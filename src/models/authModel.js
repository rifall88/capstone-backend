import pool from "../databases/dbConfig.js";

export const findEmailOrUsername = async (identifier) => {
  const result = await pool.query(
    "SELECT * FROM authentication.users WHERE email = $1 OR username = $2",
    [identifier, identifier],
  );
  return result.rows[0];
};

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

export const createRefreshTokenLog = async (data) => {
  const { userId, token, ipAddress, userAgent } = data;

  const result = await pool.query(
    `INSERT INTO authentication.refresh_tokens 
    (id, user_id, token, ip_address, user_agent, is_revoked, expired_at, created_at) 
    VALUES (gen_random_uuid(), $1, $2, $3, $4, false, NOW() + INTERVAL '1 day', NOW())
    RETURNING *`,
    [userId, token, ipAddress, userAgent],
  );

  return result.rows[0];
};

export const findValidRefreshToken = async (token) => {
  const result = await pool.query(
    `SELECT * FROM authentication.refresh_tokens 
    WHERE token = $1 
      AND is_revoked = false 
      AND expired_at > NOW()`,
    [token],
  );

  return result.rows[0];
};

export const updateTokenLastUsed = async (tokenId) => {
  const result = await pool.query(
    `UPDATE authentication.refresh_tokens 
    SET last_used_at = NOW() 
    WHERE id = $1
    RETURNING *`,
    [tokenId],
  );

  return result.rows[0];
};

export const revokeRefreshToken = async (token) => {
  const result = await pool.query(
    `UPDATE authentication.refresh_tokens 
    SET is_revoked = true 
    WHERE token = $1
    RETURNING *`,
    [token],
  );

  return result.rows[0];
};
