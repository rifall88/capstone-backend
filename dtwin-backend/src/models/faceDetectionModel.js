import pool from "../databases/dbConfig.js";

export const createFaceAnalyticsLog = async (data) => {
  const {
    user_id,
    predicted_age,
    confidence_score,
    emotion,
    gender,
    is_known_face,
    source,
  } = data;

  const result = await pool.query(
    `INSERT INTO analytics.face_analytics_logs 
    (id, user_id, predicted_age, confidence_score, emotion, gender, is_known_face, source) 
    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [
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
