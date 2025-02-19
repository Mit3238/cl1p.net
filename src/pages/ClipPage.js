import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";

function ClipPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clip, setClip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    url: id,
  });

  useEffect(() => {
    const fetchClip = async () => {
      try {
        setLoading(true);
        const response = await axios.post("/api/pages/url", { url: id });
        if (response.data.isOk) {
          setClip(response.data.data);
          setError(null);
        } else {
          setClip(null);
          setError("not_found");
        }
      } catch (err) {
        setClip(null);
        setError("not_found");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClip();
    }
  }, [id]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const submitData = {
        content: formData.content,
        title: formData.title || id,
        url: id,
      };

      const response = await axios.post("/api/pages", submitData);
      if (response.data) {
        setClip(response.data);
        setIsCreating(false);
      }
    } catch (err) {
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

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this clip?")) {
      try {
        setLoading(true);
        await axios.delete(`/api/pages/${clip._id}`);
        navigate("/");
      } catch (err) {
        setError("Failed to delete clip");
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  if (error === "not_found" && !isCreating) {
    return (
      <div className="container">
        <h2>Clip not found</h2>
        <p>Would you like to create a new clip with URL: {id}?</p>
        {/* <button onClick={() => setIsCreating(true)} className="create-button">
          Create New Clip
        </button> */}

        <form className="clip-form">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder={`Enter title (defaults to ${id})`}
          />
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Paste your content here... (required)"
            rows="5"
            required
            className="clip-form-textarea"
          />
          {error && error !== "not_found" && (
            <div className="error-message">{error}</div>
          )}
          <div className="button-group">
            <button
              type="submit"
              className="create-button"
              onClick={handleCreateSubmit}
            >
              Create Clip
            </button>
            <button
              type="submit"
              onClick={() => navigate("/")}
              className="create-button"
            >
              Cancel
            </button>
          </div>
        </form>

        <a href="/" className="clip-link" style={{ marginTop: "20px" }}>
          ← Back to Home
        </a>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>{clip.title || "Untitled Clip"}</h1>
      <div className="clip-content">
        <pre>{clip.content}</pre>
      </div>
      <div className="button-group">
        <button onClick={handleDelete} className="delete-button">
          Delete Clip
        </button>
        <a href="/" className="clip-link">
          ← Back to Home
        </a>
      </div>
    </div>
  );
}

export default ClipPage;
