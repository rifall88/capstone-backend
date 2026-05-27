import pool from "../databases/dbConfig.js";

export const findOtp = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM authentication.otp_logs
     WHERE user_id = $1
     AND is_used = false
     AND expired_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId],
  );

  return result.rows[0];
};

export const findOtpByUserId = async (userId) => {
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

export const createOtp = async (data) => {
  const { id, user_id, otp_code, type, target, expired_at } = data;

  const result = await pool.query(
    `INSERT INTO authentication.otp_logs
    (id, user_id, otp_code, type, target, expired_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [id, user_id, otp_code, type, target, expired_at],
  );

  return result.rows[0];
};

export const incrementOtpAttempt = async (id, currentAttempt) => {
  const newAttempt = currentAttempt + 1;

  const result = await pool.query(
    `UPDATE authentication.otp_logs 
     SET attempt_count = $1 
     WHERE id = $2
     RETURNING *`,
    [newAttempt, id],
  );

  return result.rows[0];
};
