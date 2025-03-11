import "./App.css";
import Leaderboard from "./Leaderboard";
import UploadForm from "./UploadForm";
import { useState } from "react";

function App() {
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleUploadSuccess = () => {
    setUploadSuccess(!uploadSuccess); // Toggle the state to trigger useEffect
  };

  return (
    <>
      <div>
        <UploadForm onUploadSuccess={handleUploadSuccess} />
        <Leaderboard uploadSuccess={uploadSuccess} />
      </div>
    </>
  );
}

export default App;
