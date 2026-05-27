import pool from "../databases/dbConfig.js";

export const flagUserForDeletion = async (userId) => {
  const result = await pool.query(
    `UPDATE authentication.users 
     SET deletion_requested = true, updated_at = NOW() 
     WHERE id = $1 RETURNING id, email`,
    [userId],
  );
  return result.rows[0];
};

export const deleteUser = async (userId) => {
  const timestamp = Date.now();

  const result = await pool.query(
    `UPDATE authentication.users
     SET is_active = false, 
         deleted_at = NOW(),
         deletion_requested = false,
         email = email || '_deleted_' || $2,
         username = username || '_deleted_' || $2
     WHERE id = $1
     RETURNING *`,
    [userId, timestamp],
  );
  return result.rows[0];
};
