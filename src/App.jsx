import { useState } from "react";
import "./App.css";

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle file selection
  function handleFileChange(e) {
    const file = e.target.files[0];
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  // Send image to backend
  async function sendToBackend() {
    if (!selectedImage) {
      console.log("No image selected");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      setLoading(true);

      const response = await fetch("https://depth-backend.sampacker.com/predict-depth", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Backend response:", data);

      setLoading(false);
    } catch (error) {
      console.error("Error calling backend:", error);
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <h1>Engineer AI Project</h1>

      {/* Image Upload */}
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {/* Preview */}
      {previewUrl && (
        <div style={{ marginTop: "20px" }}>
          <h3>Selected Image:</h3>
          <img src={previewUrl} alt="preview" style={{ width: "300px", borderRadius: "8px" }} />
        </div>
      )}

      {/* Send to backend */}
      <button onClick={sendToBackend} disabled={loading} style={{ marginTop: "20px" }}>
        {loading ? "Processing..." : "Send to Backend"}
      </button>
    </div>
  );
}

export default App;
