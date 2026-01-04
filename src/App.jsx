import ShareScreen from "./components/ShareScreen";
import Viewer from "./components/Viewer";
import "./app.css";

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Live Screen Sharing</h1>
        <p>Share your screen with multiple viewers in real-time</p>
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
