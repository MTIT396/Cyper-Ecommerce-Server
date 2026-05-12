const db = require("../config/db");

exports.findByEmail = async (email) => {
  const [[row]] = await db.execute("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  return row;
};

exports.findById = async (id) => {
  const [[user]] = await db.execute(
    `
    SELECT
      id,
      email,
      username,
      role,
      google_id,
      avatar,
      avatar_public_id,
      created_at,
      updated_at
    FROM users
    WHERE id = ?
    `,
    [id],
  );

  return user;
};

exports.findByIdWithPassword = async (id) => {
  const [[user]] = await db.execute(
    `
    SELECT
      id,
      email,
      username,
      role,
      google_id,
      password,
      avatar,
      avatar_public_id,
      created_at,
      updated_at
    FROM users
    WHERE id = ?
    `,
    [id],
  );

  return user;
};

exports.findAll = async () => {
  const [rows] = await db.execute(
    "SELECT id,email,username,role,created_at FROM users",
  );
  return rows;
};

exports.create = async (data) => {
  const {
    email,
    password = null,
    username = null,
    google_id = null,
    avatar = null,
    avatar_public_id = null,
  } = data;

  try {
    const [rs] = await db.execute(
      `
      INSERT INTO users (
        email,
        password,
        username,
        role,
        google_id,
        avatar,
        avatar_public_id
      )
      VALUES (?, ?, ?, 'user', ?, ?, ?)
      `,
      [email, password, username, google_id, avatar, avatar_public_id],
    );

    return rs.insertId;
  } catch (err) {
    console.error("Create user failed:", err);
    throw err;
  }
};

exports.update = (id, data) => {
  const ALLOWED = ["username", "avatar", "avatar_public_id"];

  const fields = Object.keys(data).filter((k) => ALLOWED.includes(k));

  if (fields.length === 0) {
    throw new AppError("No valid fields to update", 400);
  }

  const sql = `
    UPDATE users
    SET ${fields.map((f) => `${f} = ?`).join(", ")}
    WHERE id = ?
  `;

  const params = [...fields.map((f) => data[f] ?? null), id];

  return db.execute(sql, params);
};

exports.updatePassword = (id, password) =>
  db.execute("UPDATE users SET password=? WHERE id=?", [password, id]);

exports.updateGoogleId = (id, googleId) =>
  db.execute("UPDATE users SET google_id=? WHERE id=?", [googleId, id]);
