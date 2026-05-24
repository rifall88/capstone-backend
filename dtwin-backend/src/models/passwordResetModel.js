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

export const executePasswordReset = async (userId, tokenId, hashedPassword) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE authentication.users
       SET password = $1
       WHERE id = $2`,
      [hashedPassword, userId],
    );

    const result = await client.query(
      `UPDATE authentication.password_resets
       SET is_used = true
       WHERE id = $1
       RETURNING *`,
      [tokenId],
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
