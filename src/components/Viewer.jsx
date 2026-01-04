import React, { useRef, useState, useEffect } from "react";
import SimplePeer from "simple-peer";
import { ref, set, onValue, remove } from "firebase/database";
import { db, ensureAuthenticated } from "../firebase/config";

const Viewer = () => {
  const hostVideoRef = useRef(null);
  const peerRef = useRef(null);
  const [hostStream, setHostStream] = useState(null);

  const viewerId = useRef(Math.random().toString(36).substring(2, 9));
  const [roomId, setRoomId] = useState("");
  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // attach stream to video element
  useEffect(() => {
    if (hostVideoRef.current && hostStream) {
      hostVideoRef.current.srcObject = hostStream;
      hostVideoRef.current.play().catch(e => console.error(e));
    }
  }, [hostStream]);

  const joinRoom = async () => {
    if (!roomId) return;

    setIsLoading(true);

    try {
      await ensureAuthenticated();

      const peer = new SimplePeer({ initiator: false, trickle: false });
      peerRef.current = peer;

      // receive host screen
      peer.on("stream", stream => {
        setHostStream(stream);
        setConnected(true);
        setIsLoading(false);
      });

      // send answer to host
      peer.on("signal", async answer => {
        await set(ref(db, `rooms/${roomId}/viewers/${viewerId.current}/answer`), answer);
      });

      // listen for offer from host
      onValue(
        ref(db, `rooms/${roomId}/viewers/${viewerId.current}/offer`),
        snap => {
          const offer = snap.val();
          if (offer) peer.signal(offer);
        }
      );

      // auto disconnect if host removes room
      onValue(ref(db, `rooms/${roomId}/host`), snap => {
        if (!snap.val()) leaveRoom();
      });

      await set(ref(db, `rooms/${roomId}/viewers/${viewerId.current}`), { joinedAt: Date.now() });
    } catch (error) {
      console.error("Error joining room:", error);
      setIsLoading(false);
    }
  };

  const leaveRoom = async () => {
    peerRef.current?.destroy();
    await remove(ref(db, `rooms/${roomId}/viewers/${viewerId.current}`));
    setConnected(false);
    setHostStream(null);
    setIsLoading(false);
  };

  return (
    <div>
      <h3>Viewer</h3>

      <div className="input-group">
        <label>Room ID</label>
        <input value={roomId} onChange={e => setRoomId(e.target.value)} />
      </div>

      {!connected ? (
        <button className="btn" onClick={joinRoom} disabled={!roomId.trim()}>
          {isLoading ? "Connecting..." : "Join Room"}
        </button>
      ) : (
        <button className="btn btn-secondary" onClick={leaveRoom}>
          Leave Room
        </button>
      )}

      <div className="video-container" style={{ marginTop: "1rem" }}>
        <label>Host Screen</label>
        {isLoading && !connected ? (
          <div style={{ padding: "1rem", color: "#555" }}>Loading...</div>
        ) : (
          <video
            ref={hostVideoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "100%", borderRadius: "8px", background: "#000" }}
          />
        )}
      </div>
    </div>
  );
};

export default Viewer;
