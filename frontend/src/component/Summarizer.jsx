import { useState } from "react";
import axios from "axios";
import "../App.css";

function Summarizer() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await axios.post(
        "https://<YOUR_CLOUD_RUN_ENDPOINT>/summarize",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSummary(res.data.summary);
    } catch (err) {
      alert("Failed to summarize: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="summarizer-container">
      <div className="summarizer-file-upload">
        <label htmlFor="pdf-upload" className="custom-upload-button">
          📄 Choose PDF
        </label>
        <input
          id="pdf-upload"
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden-file-input"
        />
        {file && (
          <div className="file-preview">
            <span className="file-name">{file.name}</span>
            <button className="remove-button" onClick={() => setFile(null)}>
              ❌ Remove
            </button>
          </div>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={loading}
        className="summarizer-button"
      >
        {loading ? "Summarizing..." : "Upload & Summarize"}
      </button>

      {summary && (
        <div className="summarizer-output">
          <h3>📘 Summary:</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}

export default Summarizer;
