import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";

export default function PublicView() {
  const { shareId } = useParams();

  const [note, setNote] = useState(null);

  useEffect(() => {
    API.get(`/notes/public/${shareId}`).then((res) => {
      setNote(res.data);
    });
  }, []);

  if (!note) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{note.title}</h1>

      <div className="bg-white p-6 shadow rounded">{note.content}</div>

      <p className="text-gray-500 mt-4">Read only shared note</p>
    </div>
  );
}
