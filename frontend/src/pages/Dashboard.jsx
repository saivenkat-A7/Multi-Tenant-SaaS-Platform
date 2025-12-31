import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { authData } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completed: 0,
    pending: 0,
  });

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [projectFilter, setProjectFilter] = useState("all");
  const [taskFilter, setTaskFilter] = useState("all");

  /* 🔁 NORMAL LOAD */
  useEffect(() => {
    if (authData?.user?.id) {
      loadDashboard();
    }
  }, [authData, projectFilter]);

  /* 🔥 NEW: AUTO REFRESH WHEN TASKS CHANGE */
  useEffect(() => {
    const refresh = () => {
      if (authData?.user?.id) {
        loadDashboard();
      }
    };

    window.addEventListener("dashboard-refresh", refresh);
    return () => window.removeEventListener("dashboard-refresh", refresh);
  }, [authData]);

  const loadDashboard = async () => {
    try {
      const res = await api.get("/api/projects", {
        params: projectFilter !== "all" ? { status: projectFilter } : {},
      });

      const allProjects = res.data?.data?.projects || [];
      let allTasks = [];

      for (const project of allProjects) {
        try {
          const taskRes = await api.get(
            `/api/projects/${project.id}/tasks`,
           
          );

          const projectTasks = taskRes.data?.data?.tasks || [];

          const mappedTasks = projectTasks.map((t) => ({
            ...t,
            projectId: project.id,
            projectName: project.name,
            status:
              t.status === "todo" || t.status === "in_progress"
                ? "pending"
                : t.status,
            dueDate: t.due_date,
          }));

          allTasks.push(...mappedTasks);
        } catch {
          console.warn(`Tasks not found for project ${project.id}`);
        }
      }

      setProjects(allProjects.slice(0, 5));
      setTasks(allTasks);

      setStats({
        totalProjects: allProjects.length,
        totalTasks: allTasks.length,
        completed: allTasks.filter((t) => t.status === "completed").length,
        pending: allTasks.filter((t) => t.status === "pending").length,
      });
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setProjects([]);
      setTasks([]);
      setStats({
        totalProjects: 0,
        totalTasks: 0,
        completed: 0,
        pending: 0,
      });
    }
  };

const filteredTasks = tasks.filter((t) => {
  if (taskFilter === "pending") return t.status !== "completed";
  if (taskFilter === "completed") return t.status === "completed";
  return true;
});

  return (
    <div className="dashboard">
      <div className="stats">
        <div className="card1">Projects: {stats.totalProjects}</div>
        <div className="card2">Tasks: {stats.totalTasks}</div>
        <div className="card3">Completed: {stats.completed}</div>
        <div className="card4">Pending: {stats.pending}</div>
      </div>

      <section>
        <h3>Recent Projects</h3>

        {projects.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          <div className="project-grid">
            {projects.map((p) => (
              <div
                key={p.id}
                className="project-card"
                onClick={() => navigate(`/projects/${p.id}`)}
              >
                <h4>{p.name || "Untitled Project"}</h4>
                <p>{p.description?.slice(0, 80) || "No description"}...</p>
                <span className={`badge ${p.status || "active"}`}>
                  {p.status || "active"}
                </span>
                <div className="meta">
                  <small>Tasks: {p.taskCount ?? 0}</small>
                  <small>
                    Created:{" "}
                    {p.createdAt
                      ? new Date(p.createdAt).toDateString()
                      : "N/A"}
                  </small>
                  <small>By: {p.createdBy?.fullName || "Unknown"}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3>My Tasks</h3>

        <select
          onChange={(e) => setTaskFilter(e.target.value)}
          value={taskFilter}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>

        {filteredTasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          filteredTasks.map((t) => (
            <div key={t.id} className="list-item">
              <strong>{t.title}</strong>
              <p onClick={() => navigate(`/projects/${t.projectId}/tasks`)}>
                Project: {t.projectName}
              </p>
              <p>Priority: {t.priority}</p>
              <p>Due: {t.dueDate || "N/A"}</p>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default Dashboard;