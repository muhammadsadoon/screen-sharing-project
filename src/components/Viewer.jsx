import React, { useRef, useState } from "react";
import SimplePeer from "simple-peer";
import { ref, onValue, set, remove } from "firebase/database";
import { db, ensureAuthenticated } from "../firebase/config";

const Viewer = () => {
  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const viewerId = useRef(Math.random().toString(36).substring(2, 9));

  const [roomId, setRoomId] = useState("");
  const [connected, setConnected] = useState(false);

  const joinRoom = async () => {
    if (!roomId) return;

    await ensureAuthenticated();

    await set(
      ref(db, `rooms/${roomId}/viewers/${viewerId.current}`),
      { joined: Date.now() }
    );

    const peer = new SimplePeer({ initiator: false, trickle: false });
    peerRef.current = peer;

    peer.on("signal", answer => {
      set(
        ref(db, `rooms/${roomId}/viewers/${viewerId.current}/answer`),
        answer
      );
    });

    peer.on("stream", stream => {
      videoRef.current.srcObject = stream;
      setConnected(true);
    });

    onValue(
      ref(db, `rooms/${roomId}/viewers/${viewerId.current}/offer`),
      snap => snap.val() && peer.signal(snap.val())
    );
  };

  const leaveRoom = async () => {
    peerRef.current?.destroy();
    await remove(ref(db, `rooms/${roomId}/viewers/${viewerId.current}`));
    videoRef.current.srcObject = null;
    setConnected(false);
  };

  return (
    <>
      <h3>👀 View Screen</h3>

      <div className="input-group">
        <label>Room ID</label>
        <input
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
          placeholder="Enter Room ID"
        />
      </div>

      {!connected ? (
        <button className="btn" onClick={joinRoom}>
          🔗 Join Room
        </button>
      ) : (
        <button className="btn btn-secondary" onClick={leaveRoom}>
          ❌ Leave
        </button>
      )}

      {connected && (
        <div className="status-indicator status-connected">
          ✅ Connected
        </div>
      )}

      <div className="video-container">
        <video ref={videoRef} autoPlay playsInline />
      </div>
    </>
  );
};

export default Viewer;
