import pool from "../databases/dbConfig.js";

export const getLatestPredictionLog = async (userId) => {
  const { rows } = await pool.query(
    `SELECT * FROM analytics.prediction_logs
     WHERE user_id = $1
     ORDER BY prediction_date DESC
     LIMIT 1`,
    [userId],
  );
  return rows[0];
};

export const createPredictionLog = async (data) => {
  const {
    id,
    user_id,
    days_logged,
    "1_main_dashboard": mainDash,
    "2_productivity_analytics_dashboard": analyticDash,
    "3_ai_insight_and_recommendation": insight,
    "4_similar_productivity_history": history,
  } = data;

  const result = await pool.query(
    `INSERT INTO analytics.prediction_logs (
      id, user_id, days_analyzed, 
      productivity_status, productivity_score, prediction_confidence, probabilities, 
      fatigue_level, completion_rate, risk_signal, 
      weekly_trend, dominant_activity, peak_productive_hours, daily_chart_data, activity_heatmap, 
      condition_insight, performance_cause, activity_recommendation, tomorrow_prediction, burnout_warning, 
      top_similar_days, avg_similar_productivity
    ) 
    VALUES (
      $1, $2, $3, 
      $4, $5, $6, $7, 
      $8, $9, $10, 
      $11, $12, $13, $14, $15, 
      $16, $17, $18, $19, $20, 
      $21, $22
    )
    RETURNING *`,
    [
      id,
      user_id,
      days_logged,
      mainDash.productivity_status,
      mainDash.productivity_score,
      mainDash.prediction_confidence,
      JSON.stringify(mainDash.probabilities),
      mainDash.fatigue_level,
      mainDash.completion_rate,
      mainDash.risk_signal,
      analyticDash.weekly_productivity_trend,
      analyticDash.most_dominant_activity,
      analyticDash.peak_productive_hours,
      JSON.stringify(analyticDash.daily_productivity_chart),
      JSON.stringify(analyticDash.activity_heatmap),
      insight.condition_insight,
      insight.performance_cause,
      insight.activity_recommendation,
      insight.tomorrow_prediction,
      insight.burnout_warning,
      JSON.stringify(history.top_3_similar_days),
      history.average_productivity_from_similar_days,
    ],
  );

  return result.rows[0];
};
