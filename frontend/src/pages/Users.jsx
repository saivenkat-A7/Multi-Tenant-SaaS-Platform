import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import UserModal from "../components/UserModal";

const Users = () => {
  const { authData } = useContext(AuthContext);
  const tenantId = authData?.tenant?.id;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    const res = await api.get(`/api/tenants/${tenantId}/users`);
    setUsers(res.data?.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm("Delete user?")) return;
    await api.delete(`/api/users/${id}`);
    await loadUsers();
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  if (authData?.user?.role !== "tenant_admin") {
    return <p className="page">Access Denied</p>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Users</h2>
        <button onClick={() => { setEditingUser(null); setModalOpen(true); }}>
          + Add User
        </button>
      </div>

      <div className="filters">
        <input
          placeholder="Search name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="tenant_admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${u.role}`}>
                    {u.role}
                  </span>
                </td>
                <td>{u.active ? "Active" : "Inactive"}</td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="actions">
                  <button onClick={() => { setEditingUser(u); setModalOpen(true); }}>
                    Edit
                  </button>
                  <button className="danger" onClick={() => deleteUser(u.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <UserModal
          user={editingUser}
          tenantId={tenantId}
          onClose={() => setModalOpen(false)}
          onSaved={loadUsers}
        />
      )}
    </div>
  );
};

export default Users;