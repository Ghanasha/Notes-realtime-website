import { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Activity() {
  const [logs, setLogs] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await API.get("/notes/activity");

    setLogs(res.data);
  };

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <button
        className="bg-gray-500 text-white px-4 py-2 mb-6"
        onClick={() => navigate("/dashboard")}
      >
        Back
      </button>

      <h2 className="text-2xl font-bold mb-6">Activity Log</h2>

      {logs.map((log) => (
        <div key={log.id} className="border p-3 mb-3 rounded">
          <p>Action: {log.action}</p>

          <p className="text-gray-500 text-sm">
            {new Date(log.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
