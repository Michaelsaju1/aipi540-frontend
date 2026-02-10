import { useState } from "react";
import "./App.css";

const API_URL = "https://depth-backend.sampacker.com";

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [depthMapUrl, setDepthMapUrl] = useState(null);
  const [model, setModel] = useState("deeplearning");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inferenceTime, setInferenceTime] = useState(null);
  const [resultModel, setResultModel] = useState(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setDepthMapUrl(null);
    setError(null);
    setInferenceTime(null);
    setResultModel(null);
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setDepthMapUrl(null);
    setError(null);
    setInferenceTime(null);
    setResultModel(null);
  }

  async function handleSubmit() {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);
    setDepthMapUrl(null);
    setInferenceTime(null);

    const formData = new FormData();
    formData.append("image", selectedImage);
    formData.append("model", model);

    try {
      const response = await fetch(`${API_URL}/predict-depth`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setDepthMapUrl(data.depth_map);
      setInferenceTime(data.inference_time_s);
      setResultModel(data.model);
    } catch (err) {
      setError("Could not reach the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <header>
        <h1>Depth Estimation</h1>
        <p className="subtitle">
          Upload an image and predict its depth map using AI
        </p>
      </header>

      <div className="controls">
        <label className="model-label" htmlFor="model-select">
          Model
        </label>
        <select
          id="model-select"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          <option value="deeplearning">Deep Learning (ViT)</option>
          <option value="naive">Naive Baseline</option>
        </select>
      </div>

      <div
        className={`dropzone ${previewUrl ? "has-image" : ""}`}
        onClick={() => document.getElementById("file-input").click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Selected" className="preview-img" />
        ) : (
          <div className="dropzone-placeholder">
            <span className="dropzone-icon">+</span>
            <span>Click or drag an image here</span>
          </div>
        )}
        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          hidden
        />
      </div>

      {previewUrl && (
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Estimating depth..." : "Estimate Depth"}
        </button>
      )}

      {error && <p className="error-msg">{error}</p>}

      {depthMapUrl && (
        <div className="results">
          <h2>Results</h2>
          {inferenceTime != null && (
            <p className="meta">
              Model: <strong>{resultModel}</strong> &middot; Inference:{" "}
              <strong>{inferenceTime}s</strong>
            </p>
          )}
          <div className="comparison">
            <div className="comparison-card">
              <h3>Original</h3>
              <img src={previewUrl} alt="Original" />
            </div>
            <div className="comparison-card">
              <h3>Depth Map</h3>
              <img src={depthMapUrl} alt="Depth map" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
