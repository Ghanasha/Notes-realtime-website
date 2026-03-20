const express = require("express");

const router = express.Router();

const notes = require("../controllers/notesController");

const auth = require("../middleware/authMiddleware");

/* Public */

router.get("/public/:shareId",notes.getPublicNote);

/* Protected */

router.post("/",auth,notes.createNote);

/* Search */

router.get("/search",auth,notes.searchNotes);

/* Activity */

router.get("/activity",auth,notes.getActivity);

/* Collaborators */

router.post(
"/:id/collaborator",
auth,
notes.addCollaborator
);

router.get(
"/:id/collaborators",
auth,
notes.getCollaborators
);

/* Notes */

router.get("/",auth,notes.getNotes);

router.get("/:id",auth,notes.getSingleNote);

router.put("/:id",auth,notes.updateNote);

router.delete("/:id",auth,notes.deleteNote);

module.exports = router;