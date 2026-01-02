# 🎥 ScreenShare Pro

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webrtc&logoColor=white" alt="WebRTC" />
  <br />
  <strong>Share your screen securely with anyone, anywhere - No downloads required!</strong>
</div>

---

## ✨ Features

🎯 **Easy Screen Sharing**
- One-click screen capture and sharing
- Auto-generated unique room IDs
- Copy room ID with a single click

🔒 **Secure & Private**
- End-to-end encrypted WebRTC connections
- Firebase authentication for secure signaling
- No data stored on servers

📱 **Cross-Platform**
- Works on desktop and mobile browsers
- Responsive design for all screen sizes
- Modern, intuitive user interface

⚡ **Real-Time Communication**
- Low-latency peer-to-peer streaming
- Automatic connection management
- Instant screen sharing setup

🎨 **Beautiful UI**
- Modern, clean design
- Dark/light theme support
- Smooth animations and transitions

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/screenshare-pro.git
   cd screenshare-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication and Realtime Database
   - Copy your Firebase config to `src/firebase/config.js`
   - Set database rules:
     ```json
     {
       "rules": {
         ".read": "auth != null",
         ".write": "auth != null"
       }
     }
     ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

---

## 📖 How to Use

### For the Sharer:
1. Click **"Start Sharing"** to begin screen capture
2. A unique Room ID will be generated automatically
3. Click **"Copy"** to copy the Room ID
4. Share the Room ID with your viewers

### For the Viewer:
1. Enter the Room ID provided by the sharer
2. Click **"Join Room"** to connect
3. Enjoy the shared screen in real-time!

### Controls:
- **Stop Sharing**: Ends the session and cleans up data
- **Disconnect**: Leave the viewing session
- **Video Controls**: Manual play/pause if needed

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: CSS Modules, Modern CSS
- **Real-time Communication**: WebRTC, Simple-Peer
- **Backend**: Firebase (Authentication, Realtime Database)
- **Build Tools**: ESLint, Vite

### Key Dependencies:
- `react` - UI framework
- `firebase` - Backend services
- `simple-peer` - WebRTC wrapper
- `vite` - Build tool

---

## 🎯 Project Structure

```
screenshare-pro/
├── public/
├── src/
│   ├── components/
│   │   ├── ShareScreen.jsx    # Screen sharing component
│   │   └── Viewer.jsx         # Screen viewing component
│   ├── firebase/
│   │   └── config.js          # Firebase configuration
│   ├── App.jsx                # Main app component
│   ├── App.css                # Global styles
│   └── main.jsx               # App entry point
├── package.json
└── README.md
```

---

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication (Anonymous sign-in)
3. Enable Realtime Database
4. Copy your config object to `src/firebase/config.js`

### Environment Variables
No environment variables required - all config is in `src/firebase/config.js`

---

## 🌟 Features in Detail

### 🔐 Security
- Anonymous authentication for seamless access
- Encrypted WebRTC connections
- No permanent data storage

### 📊 Performance
- Optimized bundle size
- Lazy loading where applicable
- Efficient WebRTC streaming

### 🎨 User Experience
- Intuitive interface
- Real-time status updates
- Error handling and recovery

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Simple-Peer](https://github.com/feross/simple-peer) for WebRTC wrapper
- [Firebase](https://firebase.google.com) for backend services
- [Vite](https://vitejs.dev) for the amazing build tool

---

<div align="center">

### 🌟 If you found this project helpful, please give it a star! ⭐

### 📫 Follow me for more awesome projects!

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/muhammadsadoon)

</div>

---

<div align="center">
  <strong>Made with ❤️ by Muhammad Sadoon</strong>
</div>
