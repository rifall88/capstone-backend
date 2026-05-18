import pool from "../databases/dbConfig.js";

export const createProfile = async (data) => {
  const { id, user_id, fullname } = data;

  const result = await pool.query(
    `INSERT INTO user_management.profile_users (id, user_id, full_name)
        VALUES ($1, $2, $3)
        RETURNING*`,
    [id, user_id, fullname],
  );
  return result.rows[0];
};
