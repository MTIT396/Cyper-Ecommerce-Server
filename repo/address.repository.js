const db = require("../config/db");

const getExecutor = (conn) => conn || db;

/* ==============================
   CREATE
============================== */
exports.create = async (data, conn) => {
  const executor = getExecutor(conn);

  const [result] = await executor.execute(
    `INSERT INTO addresses 
     (user_id, full_name, phone, email, province, ward, street, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.user_id,
      data.full_name,
      data.phone,
      data.email ?? null, // email optional
      data.province,
      data.ward,
      data.street,
      data.is_default ? 1 : 0,
    ],
  );

  return result.insertId;
};

/* ==============================
   FIND BY USER
============================== */
exports.findByUserId = async (userId, conn) => {
  const executor = getExecutor(conn);

  const [rows] = await executor.execute(
    `SELECT id,
            full_name,
            phone,
            email,
            province,
            ward,
            street,
            is_default
     FROM addresses
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId],
  );

  return rows.map((row) => ({
    id: row.id,
    full_name: row.full_name,
    phone: row.phone,
    email: row.email ?? null,
    province: row.province,
    ward: row.ward,
    street: row.street,
    is_default: Boolean(row.is_default),
  }));
};

/* ==============================
   FIND BY ID
============================== */
exports.findById = async (addressId, userId, conn) => {
  const executor = getExecutor(conn);

  const [rows] = await executor.execute(
    `SELECT * FROM addresses WHERE id = ? AND user_id = ?`,
    [addressId, userId],
  );

  return rows[0] || null;
};

/* ==============================
   CLEAR DEFAULT
============================== */
exports.clearDefault = async (userId, conn) => {
  const executor = getExecutor(conn);

  await executor.execute(
    `UPDATE addresses SET is_default = 0 WHERE user_id = ?`,
    [userId],
  );
};

/* ==============================
   SET DEFAULT
============================== */
exports.setDefault = async (addressId, userId, conn) => {
  const executor = getExecutor(conn);

  await executor.execute(
    `UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?`,
    [addressId, userId],
  );
};

/* ==============================
   DELETE
============================== */
exports.delete = async (addressId, userId, conn) => {
  const executor = getExecutor(conn);

  await executor.execute(`DELETE FROM addresses WHERE id = ? AND user_id = ?`, [
    addressId,
    userId,
  ]);
};

/* ==============================
   UPDATE FULL
============================== */
exports.updateFull = async (addressId, userId, payload, conn) => {
  const executor = getExecutor(conn);

  await executor.execute(
    `UPDATE addresses 
     SET full_name = ?, 
         phone = ?, 
         email = ?,           
         province = ?, 
         ward = ?, 
         street = ?, 
         is_default = ?
     WHERE id = ? AND user_id = ?`,
    [
      payload.full_name,
      payload.phone,
      payload.email ?? null,
      payload.province,
      payload.ward,
      payload.street,
      payload.is_default ? 1 : 0,
      addressId,
      userId,
    ],
  );
};
