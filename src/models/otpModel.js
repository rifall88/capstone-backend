import pool from "../databases/dbConfig.js";

export const createOtp = async (data) => {
  const { user_id, otp_code, type, target, expired_at } = data;

  const result = await pool.query(
    `INSERT INTO authentication.otp_logs
    (user_id, otp_code, type, target, expired_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [user_id, otp_code, type, target, expired_at],
  );

  return result.rows[0];
};

export const findOtp = async (data) => {
  const { user_id, otp_code } = data;

  const result = await pool.query(
    `SELECT * FROM authentication.otp_logs
     WHERE user_id = $1
     AND otp_code = $2
     AND is_used = false
     AND expired_at > NOW()
     LIMIT 1`,
    [user_id, otp_code],
  );

  return result.rows[0];
};
