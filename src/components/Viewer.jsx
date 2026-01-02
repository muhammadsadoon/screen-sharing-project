import React, { useRef, useState } from "react";
import SimplePeer from "simple-peer";
import { ref, onValue, set } from "firebase/database";
import { db, ensureAuthenticated } from "../firebase/config";

const Viewer = () => {
    const videoRef = useRef(null);
    const peerRef = useRef(null);
    const [roomId, setRoomId] = useState("");
    const [isConnected, setIsConnected] = useState(false);

    const disconnect = () => {
        if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
        }
        setIsConnected(false);
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const joinRoom = () => {
        if (!roomId.trim()) return;

        const peer = new SimplePeer({
          initiator: false,
          trickle: false,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          }
        });
        peerRef.current = peer;
        setIsConnected(true);

        peer.on("error", err => console.error("Peer error:", err));

        peer.on("connect", () => {
          console.log("✅ Peer connected as viewer - waiting for stream");
        });

        peer.on("close", () => {
            console.log("Peer connection closed");
            setIsConnected(false);
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        });

        // Receive stream
        peer.on("stream", stream => {
            console.log("🎥 Stream received, setting to video", stream);
            videoRef.current.srcObject = stream;
        });

        // Listen for offer from Firebase
        onValue(ref(db, `rooms/${roomId}/offer`), snapshot => {
            const offer = snapshot.val();
            console.log("Received offer:", offer);
            if (offer) peer.signal(offer);
        });

        // Send answer back
        peer.on("signal", async answer => {
            console.log("Sending answer:", answer);
            try {
              await ensureAuthenticated();
              set(ref(db, `rooms/${roomId}/answer`), answer)
                .then(() => console.log("Answer set successfully"))
                .catch(error => console.error("Failed to set answer:", error));
            } catch (authError) {
              console.error("Auth failed for answer:", authError);
            }
        });
    };

    return (
        <div>
            <h3>👀 View Shared Screen</h3>
            <div className="input-group">
                <label htmlFor="room-id-viewer">Room ID</label>
                <input
                    id="room-id-viewer"
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Enter the room ID from sharer"
                />
            </div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
                {!isConnected ? (
                    <button className="btn" onClick={joinRoom} disabled={!roomId.trim()}>
                        🔗 Join Room
                    </button>
                ) : (
                    <button className="btn btn-secondary" onClick={disconnect}>
                        ❌ Disconnect
                    </button>
                )}
            </div>
            {isConnected && (
                <div className="status-indicator status-connected">
                    <span>✅</span>
                    Connected to room: {roomId}
                </div>
            )}
            <div className="video-container">
                <video ref={videoRef} autoPlay playsInline />
            </div>
        </div>
    );
};

export default Viewer;
