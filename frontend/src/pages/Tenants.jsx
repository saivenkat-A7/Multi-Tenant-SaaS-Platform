import { useEffect, useState } from "react";
import api from "../services/api";

const Tenants = () => {
  const [tenants, setTenants] = useState([]);

  const loadTenants = async () => {
    const res = await api.get("/api/tenants");

    // ✅ correct array access
    setTenants(res.data.data.tenants || []);
  };

  useEffect(() => {
    loadTenants();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Tenants</h2>
       
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Subdomain</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>

        <tbody>
          {tenants.map((t) => (
            <tr key={t.id}>
              <td>{t.name || "-"}</td>
              <td>{t.subdomain || "-"}</td>
              <td>{t.status}</td>
              <td>{t.createdAt?.slice(0, 10)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Tenants;