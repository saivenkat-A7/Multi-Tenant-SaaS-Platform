import { useState, useEffect, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

const ProjectModal = ({ project, onClose, onSuccess }) => {
  const { authData } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Populate form if editing
  useEffect(() => {
    if (project) {
      setName(project.name || "");
      setDescription(project.description || "");
      setStatus(project.status || "active");
    }
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    try {
      setLoading(true);

      const payload = { name, description, status };

      if (project?.id) {
        // ✅ Edit Project
        await api.put(`/api/projects/${project.id}`, payload, {
          headers: { Authorization:`Bearer ${authData.token}` },
        });
      } else {
        // ✅ Create Project
        await api.post("/api/projects", payload, {
          headers: { Authorization: `Bearer ${authData.token}` },
        });
      }

      onSuccess(); // refresh project list
      onClose();
    } catch (err) {
      console.error("Project save failed:", err);

      if (err.response?.status === 401) {
        setError("Unauthorized. Please login again.");
      } else {
        setError(err.response?.data?.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{project?.id ? "Edit Project" : "Create New Project"}</h3>

        {error && <p className="error">Project Limit reached.Take Subscription.</p>}

        <form onSubmit={handleSubmit}>
          <label>
            Project Name <span className="required">*</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </label>

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;