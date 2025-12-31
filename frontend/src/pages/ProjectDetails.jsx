import { useEffect, useState, useContext } from "react"; // ✅ added useContext
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext"; // ✅ import your AuthContext

const STATUSES = ["todo", "in_progress", "completed"];

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { authData } = useContext(AuthContext); // ✅ get authData

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD PROJECT ---------------- */
  const loadProject = async () => {
    const res = await api.get("/api/projects");
    const projects = res.data?.data?.projects || [];
    const currentProject = projects.find(
      (p) => String(p.id) === String(projectId)
    );
    setProject(currentProject || null);
  };

  /* ---------------- LOAD TASKS ---------------- */
  const loadTasks = async () => {
    const res = await api.get(`/api/projects/${projectId}/tasks`);
    setTasks(res.data?.data?.tasks || []);
  };

  /* ---------------- UPDATE PROJECT ---------------- */
  const updateProject = async () => {
    const name = prompt("Project name", project.name);
    const description = prompt("Description", project.description);
    if (!name) return;

    await api.put(`/api/projects/${projectId}`, {
      name,
      description,
      status: project.status,
    });

    await loadProject();
    window.dispatchEvent(new Event("dashboard-refresh"));
  };

  /* ---------------- CREATE TASK ---------------- */
  const createTask = async () => {
    const title = prompt("Task title");
    if (!title) return;

    await api.post(`/api/projects/${projectId}/tasks`, {
      title,
      priority: "medium",
      status: "todo",
      assigned_to: authData?.user?.id, // ✅ use authData safely
    });

    await loadTasks();
    window.dispatchEvent(new Event("dashboard-refresh"));
  };

  /* ---------------- UPDATE TASK ---------------- */
  const updateTask = async (task) => {
    const title = prompt("Title", task.title);
    const priority = prompt("Priority (low/medium/high)", task.priority);
    const due_date = prompt(
      "Due date (YYYY-MM-DD)",
      task.due_date?.slice(0, 10)
    );
    if (!title) return;

    await api.put(`/api/tasks/${task.id}`, {
      title,
      priority,
      due_date,
      status: task.status,
      assigned_to: task.assigned_to,
    });

    await loadTasks();
    window.dispatchEvent(new Event("dashboard-refresh"));
  };

  /* ---------------- UPDATE TASK STATUS ---------------- */
  const updateTaskStatus = async (taskId, status) => {
    await api.patch(`/api/tasks/${taskId}/status`, { status });
    await loadTasks();
    window.dispatchEvent(new Event("dashboard-refresh"));
  };

  /* ---------------- DELETE TASK ---------------- */
  const deleteTask = async (taskId) => {
    if (!window.confirm("Delete task?")) return;
    await api.delete(`/api/tasks/${taskId}`);
    await loadTasks();
    window.dispatchEvent(new Event("dashboard-refresh"));
  };

  /* ---------------- EFFECT ---------------- */
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadProject(), loadTasks()]);
      setLoading(false);
    };
    init();
  }, [projectId]);

  if (loading) return <p className="page">Loading...</p>;
  if (!project) return <p className="page">Project not found</p>;

  const groupedTasks = STATUSES.reduce((acc, status) => {
    acc[status] = tasks.filter((t) => t.status === status);
    return acc;
  }, {});

  return (
    <div className="page">
      <div className="project-header">
        <div>
          <h2>{project.name}</h2>
          <span className={`badge ${project.status}`}>{project.status}</span>
          <p>{project.description}</p>
        </div>
        <div className="project-actions">
          <button onClick={updateProject}>Edit</button>
          <button className="danger" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>

      <div className="task-actions">
        <h3>Tasks</h3>
        <button onClick={createTask}>+ Add Task</button>
      </div>

      <div className="kanban">
        {STATUSES.map((status) => (
          <div key={status} className="kanban-column">
            <h4>
              {status === "todo"
                ? "Todo"
                : status === "in_progress"
                ? "In Progress"
                : "Completed"}
            </h4>

            {groupedTasks[status].map((task) => (
              <div key={task.id} className="task-card">
                <h5>{task.title}</h5>
                <span className={`badge ${task.priority}`}>{task.priority}</span>
                <p>👤 {task.assignee?.full_name || "Unassigned"}</p>
                <p>📅 {task.due_date?.slice(0, 10) || "N/A"}</p>

                <div className="task-actions">
                  <button onClick={() => updateTask(task)}>Edit</button>
                  {status !== "todo" && (
                    <button onClick={() => updateTaskStatus(task.id, "todo")}>
                      Todo
                    </button>
                  )}
                  {status !== "in_progress" && (
                    <button
                      onClick={() => updateTaskStatus(task.id, "in_progress")}
                    >
                      In Progress
                    </button>
                  )}
                  {status !== "completed" && (
                    <button
                      onClick={() => updateTaskStatus(task.id, "completed")}
                    >
                      Complete
                    </button>
                  )}
                  <button
                    className="danger"
                    onClick={() => deleteTask(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDetails;