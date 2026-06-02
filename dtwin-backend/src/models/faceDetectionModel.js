import pool from "../databases/dbConfig.js";

export const createFaceDetection = async (data) => {
  const {
    id,
    user_id,
    predicted_age,
    confidence_score,
    emotion,
    gender,
    is_known_face,
    source,
  } = data;

  const result = await pool.query(
    `INSERT INTO analytics.face_detections 
    (id, user_id, predicted_age, confidence_score, emotion, gender, is_known_face, source) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      id,
      user_id,
      predicted_age,
      confidence_score,
      emotion,
      gender,
      is_known_face,
      source,
    ],
  );

  return result.rows[0];
};

export const getLastFaceScanByDate = async (data) => {
  const { userId, startDate, endDate } = data;

  const result = await pool.query(
    `SELECT emotion FROM analytics.face_detections 
    WHERE user_id = $1 
      AND captured_at >= $2 
      AND captured_at <= $3 
    ORDER BY captured_at DESC 
    LIMIT 1`,
    [userId, startDate, endDate],
  );

  return result.rows[0];
};
