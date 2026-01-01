import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

const Tasks = () => {
  const { authData } = useContext(AuthContext);
  const { projectId } = useParams(); // ✅ get projectId from route
  const userId = authData?.user?.id;

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const loadTasks = async () => {
    try {
      setLoading(true);

      // ✅ Dynamic projectId
      const res = await api.get(`/api/projects/${projectId}/tasks`);

      let allTasks = res.data?.data?.tasks || [];

      // ✅ Filter tasks assigned to logged-in user
      let myTasks = allTasks.filter(t => t.assigned_to === userId);

      // ✅ Filter by status
      if (statusFilter !== "all") {
        myTasks = myTasks.filter(t => t.status === statusFilter);
      }

      // ✅ Attach project name (optional / static)
      myTasks = myTasks.map(t => ({
        ...t,
        projectName: "Project"
      }));

      setTasks(myTasks);
    } catch (err) {
      console.error("LoadTasks Error:", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && projectId) loadTasks();
  }, [userId, projectId, statusFilter]);

  if (loading) return <p className="page">Loading tasks...</p>;

  return (
    <div className="page">
      <h2>My Tasks</h2>

      <select
        value={statusFilter}
        onChange={e => setStatusFilter(e.target.value)}
      >
        <option value="all">All</option>
        <option value="todo">Todo</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      {tasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Project</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id}>
                <td>{t.title}</td>
                <td>{t.projectName}</td>
                <td>{t.status}</td>
                <td>{t.priority}</td>
                <td>{t.due_date?.slice(0, 10)} || "N/A"</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Tasks;