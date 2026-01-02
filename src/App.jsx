import ShareScreen from "./components/ShareScreen";
import Viewer from "./components/Viewer";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>ScreenShare Pro</h1>
        <p>Share your screen securely with anyone using a simple room ID. No downloads required.</p>
      </header>
      <div className="app-content">
        <div className="card">
          <ShareScreen />
        </div>
        <div className="card">
          <Viewer />
        </div>
      </div>
    </div>
  );
}

export default App;
