import { useEffect, useState } from "react";
import api from "../services/api";

const Tenants = () => {
  const [tenants, setTenants] = useState([]);

  const loadTenants = async () => {
    const res = await api.get("/api/tenants");
    setTenants(res.data.data || []);
  };

  useEffect(() => {
    loadTenants();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Tenants</h2>
        <button>Add Tenant</button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Domain</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>

        <tbody>
          {tenants.map((t) => (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td>{t.domain}</td>
              <td>{t.active ? "Active" : "Inactive"}</td>
              <td>{t.created_at?.slice(0, 10)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Tenants;