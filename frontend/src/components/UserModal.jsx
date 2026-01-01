import { useState } from "react";
import api from "../services/api";

const UserModal = ({ user, tenantId, onClose, onSaved }) => {
  const isEdit = Boolean(user);

  const [form, setForm] = useState({
    email: user?.email || "",
    fullName: user?.fullName || "",
    password: "",
    role: user?.role || "user",
    isActive: user?.isActive ?? true
  });

  const submit = async () => {
    if (!form.email || !form.fullName) {
      alert("Email and Full Name required");
      return;
    }

    if (!isEdit && !form.password) {
      alert("Password required");
      return;
    }

    if (isEdit) {
      await api.put(`/api/users/${user.id}`, form);
    } else {
      await api.post(`/api/tenants/${tenantId}/users`, form);
    }

    onSaved();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{isEdit ? "Edit User" : "Add User"}</h3>

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="Full Name"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />

        <input
          type="password"
          placeholder={isEdit ? "New Password (optional)" : "Password"}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="user">User</option>
          <option value="tenant_admin">Tenant Admin</option>
        </select>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Active
        </label>

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={submit}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;