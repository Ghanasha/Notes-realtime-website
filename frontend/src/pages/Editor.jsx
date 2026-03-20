import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import { io } from "socket.io-client";

const socket = io("https://notes-realtime-website.onrender.com");

export default function Editor() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const [email, setEmail] = useState("");
  const [collaborators, setCollaborators] = useState([]);

  const [readOnly, setReadOnly] = useState(false);

  /* Load note */

  const loadNote = async () => {
    try {
      const res = await API.get(`/notes/${id}`);

      setTitle(res.data.title || "");

      setContent(res.data.content || "");
    } catch (err) {
      console.log(err);
    }
  };

  /* Load collaborators */

  const loadCollaborators = async () => {
    try {
      const res = await API.get(`/notes/${id}/collaborators`);

      setCollaborators(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadNote();

    loadCollaborators();

    /* Join */

    socket.emit("join-note", id);

    /* Listen */

    socket.on("note-updated", (data) => {
      if (data.noteId === id) {
        setTitle(data.title);

        setContent(data.content);

        setStatus("Updated by collaborator");

        setTimeout(() => {
          setStatus("");
        }, 1500);
      }
    });

    /* Cleanup */

    return () => {
      socket.emit("leave-note", id);

      socket.off("note-updated");
    };
  }, [id]);

  /* Save */

  const saveAndExit = async () => {
    try {
      setSaving(true);

      await API.put(`/notes/${id}`, {
        title,
        content,
      });

      setSaving(false);

      navigate("/dashboard");
    } catch (err) {
      alert("Save failed");

      setSaving(false);
    }
  };

  /* Realtime */

  const handleContentChange = (e) => {
    if (readOnly) return;

    const newContent = e.target.value;

    setContent(newContent);

    socket.emit("edit-note", {
      noteId: id,
      title,
      content: newContent,
    });
  };

  const handleTitleChange = (e) => {
    if (readOnly) return;

    const newTitle = e.target.value;

    setTitle(newTitle);

    socket.emit("edit-note", {
      noteId: id,
      title: newTitle,
      content,
    });
  };

  /* Add collaborator */

  const addCollaborator = async () => {
    if (!email) return;

    try {
      await API.post(`/notes/${id}/collaborator`, {
        email,
        role: "editor",
      });

      setEmail("");

      loadCollaborators();
    } catch (err) {
      alert("Failed to add");
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <div className="flex justify-between mb-4">
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={() => navigate("/dashboard")}
        >
          Back
        </button>

        <div>
          <span className="text-blue-500 mr-4">{status}</span>

          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={saveAndExit}
          >
            {saving ? "Saving..." : "Save & Exit"}
          </button>
        </div>
      </div>

      {/* Title */}

      <input
        className="text-2xl font-bold w-full mb-4 border p-3 rounded"
        value={title}
        onChange={handleTitleChange}
        disabled={readOnly}
        placeholder="Note title"
      />

      {/* Content */}

      <textarea
        className="w-full h-72 border p-4 rounded"
        value={content}
        onChange={handleContentChange}
        disabled={readOnly}
        placeholder="Write your notes..."
      ></textarea>

      <p className="text-gray-400 text-sm mt-2">
        Realtime collaboration enabled
      </p>

      {/* Collaborators */}

      <div className="mt-8">
        <h3 className="font-bold mb-2">Collaborators</h3>

        <div className="flex mb-3">
          <input
            className="border p-2 mr-2 flex-1"
            placeholder="User email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            className="bg-green-500 text-white px-4"
            onClick={addCollaborator}
          >
            Add
          </button>
        </div>

        <div className="bg-gray-100 p-3 rounded">
          {collaborators.length === 0 && <p>No collaborators</p>}

          {collaborators.map((c) => (
            <div key={c.id} className="flex justify-between border-b py-2">
              <span>{c.email}</span>

              <span className="text-gray-500">{c.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
