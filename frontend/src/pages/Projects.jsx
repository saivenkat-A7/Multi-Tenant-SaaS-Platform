import { useEffect, useState } from "react";
import api from "../services/api";
import ProjectModal from "../components/ProjectModal";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editProject, setEditProject] = useState(null);

  // Load projects whenever filter changes
  useEffect(() => {
    loadProjects();
  }, [filter]);

  const loadProjects = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/projects", {
        params: filter !== "all" ? { status: filter } : {},
      });

      // Map API response safely
      const projectsData = res.data?.data?.projects || [];
      setProjects(projectsData);
    } catch (err) {
      console.error("Failed to load projects:", err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      await api.delete(`/api/projects/${id}`);
      loadProjects();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Filter projects by search term
  const filteredProjects = projects.filter((p) =>
    p?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <h2>Projects</h2>
        <button onClick={() => setOpenModal(true)}>Create New Project</button>
      </div>

      {/* Filters */}
      <div className="filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>

        <input
          type="text"
          placeholder="Search project..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Projects Grid */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredProjects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <div className="project-grid">
          {filteredProjects.map((p) => (
            <div key={p.id} className="project-card">
              <h3>{p.name || "Untitled Project"}</h3>
              <p>{p.description?.slice(0, 80) || "No description"}...</p>

              <span className={`badge ${p.status || "active"}`}>
                {p.status || "active"}
              </span>

              <div className="meta">
                <small>Tasks: {p.taskCount ?? 0}</small>
                <small>
                  Created:{" "}
                  {p.createdAt ? new Date(p.createdAt).toDateString() : "N/A"}
                </small>
                <small>By: {p.createdBy?.fullName || "Unknown"}</small>
              </div>

              <div className="actions">
                <button onClick={() => alert("View page later")}>View</button>
                <button
                  onClick={() => {
                    setEditProject(p);
                    setOpenModal(true);
                  }}
                >
                  Edit
                </button>
                <button onClick={() => deleteProject(p.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {openModal && (
        <ProjectModal
          project={editProject}
          onClose={() => {
            setOpenModal(false);
            setEditProject(null);
          }}
          onSuccess={loadProjects}
        />
      )}
    </div>
  );
};

export default Projects;