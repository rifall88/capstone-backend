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

export const updateProfile = async (data, userId) => {
  const fields = [];
  const values = [];
  let index = 1;

  for (const key in data) {
    fields.push(`${key} = $${index}`);
    values.push(data[key]);
    index++;
  }

  fields.push(`updated_at = NOW()`);

  const query = `
    UPDATE user_management.profile_users
    SET ${fields.join(", ")}
    WHERE user_id = $${index}
    RETURNING *
  `;

  values.push(userId);
  const result = await pool.query(query, values);
  return result.rows[0];
};
