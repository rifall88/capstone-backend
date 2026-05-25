import pool from "../databases/dbConfig.js";

export const changeEmail = async (userId, email) => {
  const result = await pool.query(
    `UPDATE authentication.users
        SET email = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING*`,
    [email, userId],
  );
  return result.rows[0];
};

export const findOtp = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM authentication.otp_logs
     WHERE user_id = $1
     AND is_used = false
     AND expired_at > NOW()
     AND type = 'change_email'
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId],
  );

  return result.rows[0];
};
