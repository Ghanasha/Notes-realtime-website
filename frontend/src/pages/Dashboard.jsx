import { useEffect, useState, useContext } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  const { logout, user } = useContext(AuthContext);

  const navigate = useNavigate();

  /* Load */

  const getNotes = async () => {
    try {
      setLoading(true);

      const res = await API.get("/notes");

      setNotes(res.data || []);
    } catch (err) {
      setMessage("Failed to load");
    }

    setLoading(false);
  };

  useEffect(() => {
    getNotes();
  }, []);

  /* Create */

  const createNote = async () => {
    try {
      setCreating(true);

      const res = await API.post("/notes", {
        title: "Untitled Note",
        content: "",
      });

      if (res.data?.noteId) {
        navigate(`/editor/${res.data.noteId}`);
      }
    } catch {
      setMessage("Create failed");
    }

    setCreating(false);
  };

  /* Delete */

  const deleteNote = async (id) => {
    if (!window.confirm("Delete note?")) return;

    try {
      await API.delete(`/notes/${id}`);

      setMessage("Deleted");

      getNotes();
    } catch {
      setMessage("Delete failed");
    }
  };

  /* Search */

  const searchNotes = async () => {
    if (!search) {
      getNotes();

      return;
    }

    try {
      const res = await API.get(`/notes/search?q=${search}`);

      setNotes(res.data);
    } catch {
      setMessage("Search failed");
    }
  };

  /* Share */

  const copyLink = (shareId) => {
    if (!shareId) {
      setMessage("No share link");

      return;
    }

    const url = `${window.location.origin}/public/${shareId}`;

    navigator.clipboard.writeText(url);

    setMessage("Share link copied");

    setTimeout(() => {
      setMessage("");
    }, 2000);
  };

  /* Logout */

  const handleLogout = () => {
    logout();

    navigate("/");
  };

  /* Key */

  const handleKey = (e) => {
    if (e.key === "Enter") {
      searchNotes();
    }
  };

  /* Role badge */

  const roleBadge = (note) => {
    if (note.owner === user?.id) {
      return (
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
          Owner
        </span>
      );
    }

    return (
      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
        Collaborator
      </span>
    );
  };

  return (
    <div className="p-10 max-w-5xl mx-auto">
      {/* Header */}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Realtime Notes</h1>

        <div>
          <button
            className="bg-gray-600 text-white px-4 py-2 mr-3 rounded"
            onClick={() => navigate("/activity")}
          >
            Activity
          </button>

          <button
            className="bg-red-500 text-white px-4 py-2 mr-3 rounded"
            onClick={handleLogout}
          >
            Logout
          </button>

          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={createNote}
            disabled={creating}
          >
            {creating ? "Creating..." : "New Note"}
          </button>
        </div>
      </div>

      {/* Status */}

      {message && <div className="mb-4 text-blue-600">{message}</div>}

      {/* Search */}

      <div className="mb-6 flex">
        <input
          className="border p-2 flex-1 rounded mr-2"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKey}
        />

        <button
          className="bg-gray-700 text-white px-4 py-2 rounded mr-2"
          onClick={searchNotes}
        >
          Search
        </button>

        <button className="bg-gray-300 px-4 py-2 rounded" onClick={getNotes}>
          Reset
        </button>
      </div>

      {/* Notes */}

      {loading && <p className="text-gray-500">Loading...</p>}

      {!loading && notes.length === 0 && (
        <div className="text-center text-gray-500 mt-16">
          <p className="text-xl mb-2">No notes yet</p>

          <p>Click New Note to start</p>
        </div>
      )}

      <div className="grid gap-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-white p-5 shadow rounded border hover:shadow-lg transition"
          >
            <div
              className="cursor-pointer mb-3"
              onClick={() => navigate(`/editor/${note.id}`)}
            >
              <div className="flex justify-between">
                <h3 className="font-bold text-lg">
                  {note.title || "Untitled"}
                </h3>

                {roleBadge(note)}
              </div>

              <p className="text-gray-600 text-sm mt-1">
                {note.content
                  ? note.content.substring(0, 80) + "..."
                  : "Empty note"}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                Updated:{" "}
                {note.updated_at
                  ? new Date(note.updated_at).toLocaleString()
                  : "N/A"}
              </p>
            </div>

            <div className="flex justify-end gap-5">
              <button
                className="text-blue-500"
                onClick={() => copyLink(note.share_id)}
              >
                Share
              </button>

              {/* Only owner delete */}

              {note.owner === user?.id && (
                <button
                  className="text-red-500"
                  onClick={() => deleteNote(note.id)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
