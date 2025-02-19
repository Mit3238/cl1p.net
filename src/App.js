import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "./api/axios";
import ClipPage from "./pages/ClipPage";
import "./App.css";

function HomePage() {
  const [clips, setClips] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    url: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchClips();
  }, []);

  const fetchClips = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/pages");
      setClips(response.data);
    } catch (error) {
      console.error("Error fetching clips:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.content) {
      setError("Content is required");
      return;
    }

    if (!formData.title && !formData.url) {
      setError("Either title or URL is required");
      return;
    }

    try {
      setLoading(true);
      // Only include non-empty fields in the request
      const submitData = {
        content: formData.content,
        title: formData.title || formData.url,
        url: formData.url || formData.title,
      };

      await axios.post("/api/pages", submitData);
      setFormData({ title: "", content: "", url: "" });
      fetchClips();
    } catch (error) {
      console.error("Error creating clip:", error);
      setError("Failed to create clip");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = async (clipId, e) => {
    e.preventDefault(); // Prevent navigation
    if (window.confirm("Are you sure you want to delete this clip?")) {
      try {
        setLoading(true);
        await axios.delete(`/api/pages/${clipId}`);
        fetchClips(); // Refresh the list
      } catch (error) {
        console.error("Error deleting clip:", error);
        setError("Failed to delete clip");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container">
      <h1>cl1p.net clone</h1>

      <form onSubmit={handleSubmit} className="clip-form">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter title (optional if URL provided)"
          disabled={loading}
        />
        <input
          type="text"
          name="url"
          value={formData.url}
          onChange={handleInputChange}
          placeholder="Enter URL (optional if title provided)"
          disabled={loading}
        />
        <textarea
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          placeholder="Paste your content here... (required)"
          rows="5"
          disabled={loading}
        />
        {error && <div className="error-message">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Clip"}
        </button>
      </form>

      <div className="clips-list">
        <h2>Recent Clips</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          clips.map((clip) => (
            <div key={clip.id} className="clip-item">
              <a href={`/clip/${clip.url}`} className="clip-link">
                {clip.title}
              </a>
              <button
                onClick={(e) => handleDelete(clip._id, e)}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App dark">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/clip/:id" element={<ClipPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
