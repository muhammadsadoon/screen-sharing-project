import React, { useState, useRef } from "react";
import SimplePeer from "simple-peer";
import { ref, set, onValue, remove } from "firebase/database";
import { db, ensureAuthenticated } from "../firebase/config";

const ShareScreen = () => {
  const peersRef = useRef({});
  const streamRef = useRef(null);

  const [roomId, setRoomId] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [viewerStreams, setViewerStreams] = useState([]);

  const startShare = async () => {
    const id = Math.random().toString(36).substring(2, 8);
    setRoomId(id);

    try {
      const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
      let stream;

      if (isMobile) {
        // Mobile → camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false
        });
      } else {
        // Desktop → screen
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });
      }

      streamRef.current = stream;
      setIsSharing(true);

      // stop sharing if user ends stream
      stream.getVideoTracks()[0].onended = stopShare;

      // create room in firebase
      await ensureAuthenticated();
      await set(ref(db, `rooms/${id}/host`), { active: true });

      // listen for viewers
      onValue(ref(db, `rooms/${id}/viewers`), snapshot => {
        const viewers = snapshot.val();
        if (!viewers) return;

        Object.keys(viewers).forEach(viewerId => {
          if (peersRef.current[viewerId]) return;

          const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream
          });

          peersRef.current[viewerId] = peer;

          // send offer to viewer
          peer.on("signal", data => {
            set(ref(db, `rooms/${id}/viewers/${viewerId}/offer`), data);
          });

          // receive viewer stream (camera removed in this version)
          peer.on("stream", remoteStream => {
            setViewerStreams(prev => [...prev, remoteStream]);
          });

          // receive answer from viewer
          onValue(
            ref(db, `rooms/${id}/viewers/${viewerId}/answer`),
            snap => {
              const answer = snap.val();
              if (answer) peer.signal(answer);
            }
          );

          peer.on("close", () => {
            peer.destroy();
            delete peersRef.current[viewerId];
          });

          peer.on("error", err => console.error("Peer error:", err));
        });
      });
    } catch (error) {
      console.error("Error starting share:", error);
    }
  };

  const stopShare = async () => {
    // destroy all peers
    Object.values(peersRef.current).forEach(peer => peer.destroy());
    peersRef.current = {};

    // stop local stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    // remove room from firebase
    if (roomId) {
      try {
        await ensureAuthenticated();
        await remove(ref(db, `rooms/${roomId}`));
      } catch (error) {
        console.error("Failed to remove room:", error);
      }
    }

    setViewerStreams([]);
    setIsSharing(false);
    setRoomId("");
  };

  return (
    <div>
      <h3>Host Screen Share</h3>

      <div className="input-group">
        <label>Room ID</label>
        <input value={roomId} readOnly placeholder="Generated automatically" />
      </div>

      {!isSharing ? (
        <button className="btn" onClick={startShare}>
          Start Screen Share
        </button>
      ) : (
        <button className="btn btn-secondary" onClick={stopShare}>
          Stop Sharing
        </button>
      )}

      {isSharing && (
        <div className="status-indicator status-sharing">
          Live | Room <strong>{roomId}</strong>
        </div>
      )}
    </div>
  );
};

export default ShareScreen;
