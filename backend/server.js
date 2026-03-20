const express = require("express");
const cors = require("cors");
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const db = require("./config/database");

const authRoutes = require("./routes/authRoutes");
const notesRoutes = require("./routes/notesRoutes");

const app = express();

/* Middleware */

app.use(cors());

app.use(express.json());

/* HTTP server */

const server = http.createServer(app);

/* Socket */

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

/* Make socket available */

app.use((req, res, next) => {
  req.io = io;

  next();
});

/* Socket events */

io.on("connection", (socket) => {
  console.log("User connected");

  /* Join note room */

  socket.on("join-note", (noteId) => {
    socket.join(noteId);
  });

  /* Leave */

  socket.on("leave-note", (noteId) => {
    socket.leave(noteId);
  });

  /* Edit broadcast */

  socket.on("edit-note", (data) => {
    socket.to(data.noteId).emit("note-updated", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

/* Routes */

app.use("/api/auth", authRoutes);

app.use("/api/notes", notesRoutes);

/* Database tables */

db.serialize(() => {
  /* Users */

  db.run(`
CREATE TABLE IF NOT EXISTS users(
id TEXT PRIMARY KEY,
name TEXT,
email TEXT UNIQUE,
password TEXT,
role TEXT DEFAULT 'editor'
)
`);

  /* Notes */

  db.run(`
CREATE TABLE IF NOT EXISTS notes(
id TEXT PRIMARY KEY,
title TEXT,
content TEXT,
owner TEXT,
share_id TEXT,
updated_at TEXT
)
`);

  /* Collaborators (NEW) */

  db.run(`
CREATE TABLE IF NOT EXISTS collaborators(
id TEXT PRIMARY KEY,
note_id TEXT,
user_id TEXT,
role TEXT
)
`);

  /* Activity */

  db.run(`
CREATE TABLE IF NOT EXISTS activity(
id TEXT PRIMARY KEY,
user TEXT,
action TEXT,
note TEXT,
created_at TEXT
)
`);

  console.log("Tables ready");
});

/* Test */

app.get("/", (req, res) => {
  res.send("API running");
});

/* Start */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
