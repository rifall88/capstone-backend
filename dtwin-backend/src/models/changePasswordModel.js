import pool from "../databases/dbConfig.js";

export const changePassword = async (userId, password) => {
  const result = await pool.query(
    `UPDATE authentication.users
        SET password = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING*`,
    [password, userId],
  );
  return result.rows[0];
};

export const findUser = async (userId) => {
  const result = await pool.query(
    "SELECT * FROM authentication.users WHERE id = $1",
    [userId],
  );
  return result.rows[0];
};
