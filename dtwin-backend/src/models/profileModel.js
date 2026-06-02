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
  const allowedColumns = [
    "full_name",
    "phone",
    "birth_date",
    "gender",
    "profile_image",
  ];
  const fields = [];
  const values = [];
  let index = 1;

  for (const key in data) {
    if (allowedColumns.includes(key)) {
      fields.push(`${key} = $${index}`);
      values.push(data[key]);
      index++;
    }
  }

  fields.push(`updated_at = NOW()`);
  values.push(userId);

  const result = await pool.query(
    `UPDATE user_management.profile_users
    SET ${fields.join(", ")}
    WHERE user_id = $${index} AND deleted_at IS NULL
    RETURNING *`,
    values,
  );

  return result.rows[0];
};

export const findUserAllProfile = async () => {
  const result = await pool.query(
    `SELECT p.full_name, u.email, u.role, u.is_active, u.created_at 
    FROM user_management.profile_users p 
    INNER JOIN authentication.users u ON p.user_id = u.id
    ORDER BY u.created_at DESC`,
  );

  return result.rows;
};

export const findUserProfile = async (userId) => {
  const result = await pool.query(
    `SELECT p.id, p.full_name, u.username, u.email, p.phone,
    p.birth_date, p.gender, p.profile_image, u.role
    FROM user_management.profile_users p 
    INNER JOIN authentication.users u ON p.user_id = u.id
    WHERE p.user_id = $1 
    AND u.deleted_at IS NULL
    AND p.deleted_at IS NULL`,
    [userId],
  );

  return result.rows[0];
};
