import React, { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";
import { ref, set, onValue, remove } from "firebase/database";
import { db, ensureAuthenticated } from "../firebase/config";

const ShareScreen = () => {
  const peersRef = useRef({});
  const streamRef = useRef(null);

  const [roomId, setRoomId] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        /Android|iPhone|iPad/i.test(navigator.userAgent) ||
          window.innerWidth < 768
      );
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const stopShare = async () => {
    Object.values(peersRef.current).forEach(p => p.destroy());
    peersRef.current = {};

    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;

    if (roomId) {
      await ensureAuthenticated();
      await remove(ref(db, `rooms/${roomId}`));
    }

    setIsSharing(false);
    setRoomId("");
  };

  const startShare = async () => {
    const id = Math.random().toString(36).substring(2, 8);
    setRoomId(id);

    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false
    });

    streamRef.current = stream;
    setIsSharing(true);

    stream.getVideoTracks()[0].onended = stopShare;

    await ensureAuthenticated();
    await set(ref(db, `rooms/${id}/host`), { active: true });

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

        peer.on("signal", data => {
          set(ref(db, `rooms/${id}/viewers/${viewerId}/offer`), data);
        });

        onValue(
          ref(db, `rooms/${id}/viewers/${viewerId}/answer`),
          snap => snap.val() && peer.signal(snap.val())
        );
      });
    });
  };

  return (
    <>
      <h3>{isMobile ? "📱 Share Camera" : "🖥️ Share Screen"}</h3>

      {isMobile && (
        <div className="mobile-notice">
          <strong>Mobile Mode</strong>
          Camera feed will be shared instead of screen
        </div>
      )}

      <div className="input-group">
        <label>Room ID</label>
        <input value={roomId} readOnly placeholder="Auto generated" />
      </div>

      {!isSharing ? (
        <button className="btn" onClick={startShare}>
          🚀 Start Sharing
        </button>
      ) : (
        <button className="btn btn-secondary" onClick={stopShare}>
          ⏹ Stop Sharing
        </button>
      )}

      {isSharing && (
        <div className="status-indicator status-sharing">
          📡 Live | Room <strong>{roomId}</strong>
        </div>
      )}
    </>
  );
};

export default ShareScreen;
