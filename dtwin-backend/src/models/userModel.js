import pool from "../databases/dbConfig.js";

export const findUser = async (userId) => {
  const result = await pool.query(
    "SELECT * FROM authentication.users WHERE id = $1",
    [userId],
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

export const findUserByEmail = async (email) => {
  const result = await pool.query(
    "SELECT * FROM authentication.users WHERE email = $1 AND deleted_at IS NULL",
    [email],
  );
  return result.rows[0];
};

export const findEmailOrUsername = async (identifier) => {
  const result = await pool.query(
    `SELECT * FROM authentication.users 
     WHERE (email = $1 OR username = $2) 
     AND deleted_at IS NULL`,
    [identifier, identifier],
  );
  return result.rows[0];
};

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

export const createOauthUser = async (data) => {
  const { id, username, email, provider, provider_id } = data;

  const result = await pool.query(
    `INSERT INTO authentication.users 
    (id, username, email, password, role, provider, provider_id, is_verified) 
    VALUES ($1, $2, $3, NULL, 'user', $4, $5, true)
    RETURNING *`,
    [id, username, email, provider, provider_id],
  );

  return result.rows[0];
};

export const registerUserAdmin = async (data) => {
  const { id, username, email, password, role } = data;

  const result = await pool.query(
    `INSERT INTO authentication.users (id, username, email, password, role, is_verified)
        VALUES ($1, $2, $3, $4, $5, true)
        RETURNING*`,
    [id, username, email, password, role],
  );
  return result.rows[0];
};

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

export const flagUserForDeletion = async (userId) => {
  const result = await pool.query(
    `UPDATE authentication.users 
     SET deletion_requested = true, updated_at = NOW() 
     WHERE id = $1 RETURNING id, email`,
    [userId],
  );
  return result.rows[0];
};

export const executePasswordReset = async (userId, tokenId, hashedPassword) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE authentication.users
       SET password = $1
       WHERE id = $2`,
      [hashedPassword, userId],
    );

    const result = await client.query(
      `UPDATE authentication.password_resets
       SET is_used = true
       WHERE id = $1
       RETURNING *`,
      [tokenId],
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const deleteUser = async (userId) => {
  const timestamp = Date.now();

  const result = await pool.query(
    `UPDATE authentication.users
     SET is_active = false, 
         deleted_at = NOW(),
         deletion_requested = false,
         email = email || '_deleted_' || $2,
         username = username || '_deleted_' || $2
     WHERE id = $1
     RETURNING *`,
    [userId, timestamp],
  );
  return result.rows[0];
};
