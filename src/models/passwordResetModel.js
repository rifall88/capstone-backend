import pool from "../databases/dbConfig.js";

export const createPasswordResetToken = async (data) => {
  const { id, user_id, token, expired_at } = data;

  const result = await pool.query(
    `INSERT INTO authentication.password_resets 
    (id, user_id, token, expired_at)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
    [id, user_id, token, expired_at],
  );

  return result.rows[0];
};

export const findResetToken = async (token) => {
  const result = await pool.query(
    `SELECT id, user_id, token, is_used, expired_at 
     FROM authentication.password_resets
     WHERE token = $1 
     LIMIT 1`,
    [token],
  );

  return result.rows[0];
};
