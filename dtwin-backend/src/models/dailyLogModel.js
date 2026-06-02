import pool from "../databases/dbConfig.js";

export const getPreviousDailyLog = async (data) => {
  const { userId, beforeDate } = data;

  const result = await pool.query(
    `SELECT * FROM analytics.daily_logs
    WHERE user_id = $1 AND log_date = $2
    ORDER BY log_date DESC
    LIMIT 1`,
    [userId, beforeDate],
  );

  return result.rows[0];
};

export const findDailyLog = async (id, userId) => {
  const result = await pool.query(
    `SELECT * FROM analytics.daily_logs WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );

  return result.rows[0];
};

export const createDailyLog = async (data) => {
  const {
    id,
    user_id,
    is_weekend,
    sleep_duration,
    study_work_duration,
    break_duration,
    exercise_duration,
    downtime_duration,
    stress_level,
    mood_score,
    focus_score,
    task_completed,
    task_planned,
    completion_ratio,
    fatigue_accumulation,
    productivity_score,
  } = data;

  const result = await pool.query(
    `INSERT INTO analytics.daily_logs 
    (id, user_id, log_date, is_weekend, sleep_duration, study_work_duration,
    break_duration, exercise_duration, downtime_duration, stress_level, mood_score,
    focus_score, task_completed, task_planned, completion_ratio, fatigue_accumulation, productivity_score) 
    VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING *`,
    [
      id,
      user_id,
      is_weekend,
      sleep_duration,
      study_work_duration,
      break_duration,
      exercise_duration,
      downtime_duration,
      stress_level,
      mood_score,
      focus_score,
      task_completed,
      task_planned,
      completion_ratio,
      fatigue_accumulation,
      productivity_score,
    ],
  );

  return result.rows[0];
};

export const updateDailyLog = async (data) => {
  const {
    id,
    user_id,
    sleep_duration,
    study_work_duration,
    break_duration,
    exercise_duration,
    downtime_duration,
    stress_level,
    mood_score,
    focus_score,
    task_completed,
    task_planned,
    completion_ratio,
    fatigue_accumulation,
    productivity_score,
  } = data;

  const result = await pool.query(
    `UPDATE analytics.daily_logs 
    SET 
      sleep_duration = $1, 
      study_work_duration = $2,
      break_duration = $3, 
      exercise_duration = $4, 
      downtime_duration = $5, 
      stress_level = $6, 
      mood_score = $7,
      focus_score = $8, 
      task_completed = $9, 
      task_planned = $10, 
      completion_ratio = $11, 
      fatigue_accumulation = $12, 
      productivity_score = $13,
      updated_at = NOW()
    WHERE id = $14 AND user_id = $15
    RETURNING *`,
    [
      sleep_duration,
      study_work_duration,
      break_duration,
      exercise_duration,
      downtime_duration,
      stress_level,
      mood_score,
      focus_score,
      task_completed,
      task_planned,
      completion_ratio,
      fatigue_accumulation,
      productivity_score,
      id,
      user_id,
    ],
  );

  return result.rows[0];
};

// 2. Mengambil 7 Log Terakhir untuk Input AI
export const getLast7DailyLogs = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM telemetry.daily_logs 
     WHERE user_id = $1
     ORDER BY log_date ASC 
     LIMIT 7`,
    [userId],
  );
  return result.rows;
};

// 3. Menyimpan Log Harian (Dengan Penambal Otomatis COALESCE)
export const upsertDailyLog = async (data) => {
  const {
    user_id,
    log_date,
    is_weekend,
    sleep_duration,
    sleep_quality,
    study_work_duration,
    break_duration,
    physical_activity_duration,
    screen_time_duration,
    stress_level,
    mood_score,
    focus_score,
    task_completed,
    task_planned,
  } = data;

  const result = await pool.query(
    `INSERT INTO telemetry.daily_logs 
    (log_id, user_id, log_date, is_weekend, sleep_duration, sleep_quality, study_work_duration, break_duration, physical_activity_duration, screen_time_duration, stress_level, mood_score, focus_score, task_completed, task_planned) 
    VALUES (
      gen_random_uuid(), $1, $2, $3, 
      COALESCE($4, 8.0),   -- Tidur 8 jam
      COALESCE($5, 5),     -- Kualitas 5
      COALESCE($6, 8.0),   -- Kerja/Belajar 8 jam
      COALESCE($7, 2.0),   -- Istirahat 2 jam
      COALESCE($8, 30.0),  -- Olahraga 30 menit
      COALESCE($9, 6.0),   -- Screen time 6 jam
      COALESCE($10, 5),    -- Stres 5
      COALESCE($11, 5),    -- Mood 5
      COALESCE($12, 5),    -- Fokus 5
      COALESCE($13, 2),    -- Task selesai 2
      COALESCE($14, 4)     -- Task rencana 4
    )
    ON CONFLICT (user_id, log_date) 
    DO UPDATE SET 
      is_weekend = EXCLUDED.is_weekend, 
      sleep_duration = EXCLUDED.sleep_duration, 
      sleep_quality = EXCLUDED.sleep_quality, 
      study_work_duration = EXCLUDED.study_work_duration, 
      break_duration = EXCLUDED.break_duration, 
      physical_activity_duration = EXCLUDED.physical_activity_duration, 
      screen_time_duration = EXCLUDED.screen_time_duration, 
      stress_level = EXCLUDED.stress_level, 
      mood_score = EXCLUDED.mood_score, 
      focus_score = EXCLUDED.focus_score, 
      task_completed = EXCLUDED.task_completed, 
      task_planned = EXCLUDED.task_planned
    RETURNING *`,
    [
      user_id,
      log_date,
      is_weekend,
      sleep_duration,
      sleep_quality,
      study_work_duration,
      break_duration,
      physical_activity_duration,
      screen_time_duration,
      stress_level,
      mood_score,
      focus_score,
      task_completed,
      task_planned,
    ],
  );
  return result.rows[0];
};
