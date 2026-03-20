const db = require("../config/database");
const { v4: uuidv4 } = require("uuid");

/* Helper permission check */

const checkAccess = (noteId, userId, callback) => {
  db.get(
    `SELECT * FROM notes WHERE id=?`,

    [noteId],

    (err, note) => {
      if (!note) {
        return callback(false);
      }

      if (note.owner === userId) {
        return callback(true);
      }

      /* check collaborator */

      db.get(
        `SELECT * FROM collaborators 
WHERE note_id=? AND user_id=?`,

        [noteId, userId],

        (err, col) => {
          if (col) {
            return callback(true);
          }

          callback(false);
        },
      );
    },
  );
};

/* Create */

exports.createNote = (req, res) => {
  const { title, content } = req.body || {};

  const id = uuidv4();

  const shareId = uuidv4();

  const owner = req.user.id;

  const time = new Date().toISOString();

  db.run(
    `INSERT INTO notes(id,title,content,owner,share_id,updated_at)
VALUES(?,?,?,?,?,?)`,

    [id, title || "Untitled", content || "", owner, shareId, time],

    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      /* Activity */

      db.run(
        `INSERT INTO activity(id,user,action,note,created_at)
VALUES(?,?,?,?,?)`,

        [uuidv4(), owner, "CREATE", id, time],
      );

      res.json({
        noteId: id,
        shareId,
      });
    },
  );
};

/* Get Notes (owner + collaborators) */

exports.getNotes = (req, res) => {
  db.all(
    `SELECT * FROM notes 
WHERE owner=?
OR id IN(
SELECT note_id FROM collaborators
WHERE user_id=?
)
ORDER BY updated_at DESC`,

    [req.user.id, req.user.id],

    (err, rows) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json(rows);
    },
  );
};

/* Single */

exports.getSingleNote = (req, res) => {
  checkAccess(
    req.params.id,

    req.user.id,

    (hasAccess) => {
      if (!hasAccess) {
        return res.status(403).json({
          message: "Access denied",
        });
      }

      db.get(
        `SELECT * FROM notes WHERE id=?`,

        [req.params.id],

        (err, row) => {
          res.json(row);
        },
      );
    },
  );
};

/* Update */

exports.updateNote = (req, res) => {
  checkAccess(
    req.params.id,

    req.user.id,

    (hasAccess) => {
      if (!hasAccess) {
        return res.status(403).json({
          message: "No permission",
        });
      }

      const { title, content } = req.body;

      const time = new Date().toISOString();

      db.run(
        `UPDATE notes 
SET title=?,content=?,updated_at=? 
WHERE id=?`,

        [title, content, time, req.params.id],

        (err) => {
          if (err) {
            return res.status(500).json(err);
          }

          /* Activity */

          db.run(
            `INSERT INTO activity(id,user,action,note,created_at)
VALUES(?,?,?,?,?)`,

            [uuidv4(), req.user.id, "UPDATE", req.params.id, time],
          );

          /* Realtime */

          if (req.io) {
            req.io.to(req.params.id).emit("note-updated", {
              noteId: req.params.id,
              title,
              content,
            });
          }

          res.json({
            message: "Updated",
          });
        },
      );
    },
  );
};

/* Delete */

exports.deleteNote = (req, res) => {
  db.run(
    `DELETE FROM notes 
WHERE id=? AND owner=?`,

    [req.params.id, req.user.id],

    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      db.run(
        `INSERT INTO activity(id,user,action,note,created_at)
VALUES(?,?,?,?,?)`,

        [
          uuidv4(),
          req.user.id,
          "DELETE",
          req.params.id,
          new Date().toISOString(),
        ],
      );

      res.json({
        message: "Deleted",
      });
    },
  );
};

/* Search */

exports.searchNotes = (req, res) => {
  const q = req.query.q || "";

  db.all(
    `SELECT * FROM notes
WHERE (
owner=?
OR id IN(
SELECT note_id FROM collaborators 
WHERE user_id=?
)
)
AND (
title LIKE ?
OR content LIKE ?
)`,

    [req.user.id, req.user.id, `%${q}%`, `%${q}%`],

    (err, rows) => {
      res.json(rows);
    },
  );
};

/* Activity */

exports.getActivity = (req, res) => {
  db.all(
    `SELECT * FROM activity
WHERE user=?
ORDER BY created_at DESC`,

    [req.user.id],

    (err, rows) => {
      res.json(rows);
    },
  );
};

/* Public */

exports.getPublicNote = (req, res) => {
  db.get(
    `SELECT title,content 
FROM notes 
WHERE share_id=?`,

    [req.params.shareId],

    (err, row) => {
      if (!row) {
        return res.status(404).json({
          message: "Not found",
        });
      }

      res.json(row);
    },
  );
};

/* Add collaborator */

exports.addCollaborator = (req,res)=>{

const {email,role}=req.body;

db.get(

`SELECT id FROM users WHERE email=?`,

[email],

(err,user)=>{

if(!user){

return res.json({

message:"User not found"

});

}

db.run(

`INSERT INTO collaborators(
id,
note_id,
user_id,
role
)
VALUES(?,?,?,?)`,

[
uuidv4(),
req.params.id,
user.id,
role || "viewer"
],

()=>{

/* Activity */

db.run(

`INSERT INTO activity(
id,
user,
action,
note,
created_at
)
VALUES(?,?,?,?,?)`,

[
uuidv4(),
req.user.id,
"ADD_COLLAB",
req.params.id,
new Date().toISOString()
]

);

res.json({

message:"Collaborator added"

});

}

);

}

);

};

/* Get collaborators */

exports.getCollaborators = (req,res)=>{

db.all(

`SELECT users.id,
users.name,
users.email,
collaborators.role

FROM collaborators

JOIN users
ON collaborators.user_id = users.id

WHERE collaborators.note_id=?`,

[req.params.id],

(err,rows)=>{

if(err){

return res.status(500).json(err);

}

res.json(rows);

}

);

};