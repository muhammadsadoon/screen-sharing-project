import React, { useRef, useState } from "react";
import SimplePeer from "simple-peer";
import { ref, set, onValue, remove } from "firebase/database";
import { db, ensureAuthenticated } from "../firebase/config";

const ShareScreen = () => {
  const peerRef = useRef(null);
  const [roomId, setRoomId] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                    window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const stopShare = async () => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    // Remove room data from database
    try {
      await ensureAuthenticated();
      remove(ref(db, `rooms/${roomId}`))
        .then(() => console.log("Room data removed"))
        .catch(error => console.error("Failed to remove room data:", error));
    } catch (authError) {
      console.error("Auth failed for remove:", authError);
    }
    setIsSharing(false);
    setRoomId("");
  };

  const startShare = async () => {
    const generatedRoomId = Math.random().toString(36).substring(2, 8);
    setRoomId(generatedRoomId);

    try {
      let stream;

      if (isMobile) {
        // Mobile: Try screen sharing first, fallback to camera
        console.log("📱 Mobile detected - trying screen sharing...");
        try {
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: { mediaSource: 'screen' },
            audio: false
          });
          console.log("✅ Screen captured on mobile", stream);
        } catch (screenError) {
          console.log("❌ Screen sharing failed on mobile, falling back to camera", screenError);
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user', // Use front camera
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: false
          });
          console.log("✅ Camera access granted on mobile", stream);
        }
      } else {
        // Desktop: Use screen sharing
        console.log("🖥️ Desktop detected - requesting screen capture...");
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: { mediaSource: 'screen' },
          audio: false
        });
        console.log("✅ Screen captured successfully", stream);
      }

      // 2️⃣ Create Peer (initiator)
      const peer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });
      peerRef.current = peer;
      setIsSharing(true);

      peer.on("error", err => console.error("Peer error:", err));

      peer.on("connect", () => {
        console.log("✅ Peer connected as sharer - ready to stream");
      });

      peer.on("close", () => {
        console.log("Peer connection closed");
        stopShare();
      });

      // Handle stream end
      stream.getVideoTracks()[0].onended = () => {
        console.log("Screen sharing stopped by user");
        stopShare();
      };

      // 3️⃣ Send Offer + ICE to Firebase
      peer.on("signal", async data => {
        console.log("Sending offer:", data);
        try {
          await ensureAuthenticated();
          set(ref(db, `rooms/${generatedRoomId}/offer`), data)
            .then(() => console.log("Offer set successfully"))
            .catch(error => console.error("Failed to set offer:", error));
        } catch (authError) {
          console.error("Auth failed for offer:", authError);
        }
      });

      // 4️⃣ Listen for Answer from Viewer
      onValue(ref(db, `rooms/${generatedRoomId}/answer`), snapshot => {
        const answer = snapshot.val();
        console.log("Received answer:", answer);
        if (answer && peerRef.current) {
          peerRef.current.signal(answer);
        }
      });
    } catch (error) {
      console.error("Error starting share:", error);
    }
  };

  return (
    <div>
      <h3>{isMobile ? "📱 Share Your Camera" : "📺 Share Your Screen"}</h3>
      {isMobile && (
        <div className="mobile-notice" style={{
          background: "#e3f2fd",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
          border: "1px solid #2196f3"
        }}>
          <strong>📱 Mobile Mode:</strong> Sharing your camera feed instead of screen (screen sharing not supported on mobile)
        </div>
      )}
      <div className="input-group">
        <label htmlFor="room-id-sharer">Room ID (Share this with viewers)</label>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            id="room-id-sharer"
            type="text"
            value={roomId}
            readOnly
            placeholder="Click Start Sharing to generate"
            style={{ flex: 1 }}
          />
          {roomId && (
            <button
              className="btn btn-secondary"
              onClick={() => navigator.clipboard.writeText(roomId)}
              style={{ padding: "0.75rem 1rem" }}
            >
              📋 Copy
            </button>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
        {!isSharing ? (
          <button className="btn" onClick={startShare}>
            {isMobile ? "📱 Start Camera Share" : "🚀 Start Screen Share"}
          </button>
        ) : (
          <button className="btn btn-secondary" onClick={stopShare}>
            ⏹️ Stop Sharing
          </button>
        )}
      </div>
      {isSharing && (
        <div className="status-indicator status-sharing">
          <span>{isMobile ? "📱" : "📡"}</span>
          {isMobile ? "Broadcasting camera to" : "Broadcasting screen to"} room: <strong>{roomId}</strong>
        </div>
      )}
    </div>
  );
};

export default ShareScreen;
