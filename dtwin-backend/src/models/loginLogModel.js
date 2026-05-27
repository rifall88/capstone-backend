import pool from "../databases/dbConfig.js";

export const createLoginLog = async (data) => {
  const {
    userId,
    identifier,
    ipAddress,
    userAgent,
    status,
    failureReason,
    location,
  } = data;

  const result = await pool.query(
    `INSERT INTO authentication.login_logs 
    (id, user_id, identifier, ip_address, user_agent, status, failure_reason, location, created_at) 
    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())
    RETURNING *`,
    [userId, identifier, ipAddress, userAgent, status, failureReason, location],
  );

  return result.rows[0];
};
