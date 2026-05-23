import pool from "../databases/dbConfig.js";

export const registerUser = async (data) => {
  const { id, username, email, password, role } = data;

  const result = await pool.query(
    `INSERT INTO authentication.users (id, username, email, password, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING*`,
    [id, username, email, password, role],
  );
  return result.rows[0];
};

export const findEmail = async (email) => {
  const result = await pool.query(
    "SELECT * FROM authentication.users WHERE email = $1",
    [email],
  );
  return result.rows[0];
};
