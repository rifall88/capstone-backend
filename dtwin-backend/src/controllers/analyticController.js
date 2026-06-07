import {
  createFaceDetection,
  getLastFaceScanByDate,
} from "../models/faceDetectionModel.js";
import {
  createDailyLog,
  getPreviousDailyLog,
  updateDailyLog,
  findDailyLog,
  getLast7DailyLogs,
  getLatestDailyLog,
  getHeatmapLogs,
  getDailyLog,
} from "../models/dailyLogModel.js";
import { checkIsWeekendOrHoliday } from "../utils/holidayWeekend.js";
import { formatDateForFE } from "../utils/dateFormatter.js";
import {
  getMoodScoreFromEmotion,
  calculateStressLevel,
  calculateFocusScore,
  calculateProductivityScore,
  calculateFatigueIndex,
  calculateCumulativeFatigue,
} from "../utils/dailyLogHelper.js";
import {
  createPredictionLog,
  getLatestPredictionLog,
} from "../models/predictionLog.js";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

export const faceDetectionAnalytic = async (req, res) => {
  try {
    const { image_base64 } = req.body;
    const userId = req.user.id;

    const imageSizeInBytes = Buffer.byteLength(image_base64, "base64");
    const imageSizeInMB = imageSizeInBytes / (1024 * 1024);

    if (imageSizeInMB > 5) {
      return res.status(400).json({
        status: "failed",
        message: `Image is too large (${imageSizeInMB.toFixed(3)} MB). Maximum allowed size is 5 MB.`,
      });
    }

    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    const lastFaceScan = await getLastFaceScanByDate({
      userId: userId,
      startDate: startOfToday,
      endDate: endOfToday,
    });

    if (lastFaceScan) {
      return res.status(403).json({
        status: "failed",
        message:
          "You have already completed your daily face check-in today. Come back tomorrow",
      });
    }

    const pythonResponse = await axios.post(
      process.env.FACE_DETECTION,
      { image_base64 },
      {
        headers: { Authorization: `Bearer ${process.env.SECRET_TOKEN_AI}` },
        timeout: 80000,
      },
    );

    const aiResult = pythonResponse.data.data;

    const savedLog = await createFaceDetection({
      id: uuidv4(),
      user_id: userId,
      predicted_age: aiResult.predicted_age,
      confidence_score: aiResult.confidence_score,
      emotion: aiResult.emotion,
      gender: aiResult.gender,
      is_known_face: userId ? true : false,
      source: "daily_mood_checkin",
    });

    return res.status(200).json({
      status: "success",
      message: `Daily check-in successful. Your mood today is visible ${aiResult.emotion}`,
      data: savedLog,
    });
  } catch (error) {
    console.error("Express Face Detection Error:", error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        status: "failed",
        message: "The AI microservice rejects the request",
        error: error.response.data.detail,
      });
    }

    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};

export const dailyLogAnalytic = async (req, res) => {
  try {
    const {
      sleep_duration,
      study_work_duration,
      exercise_duration,
      downtime_duration,
      task_planned,
      task_completed,
    } = req.body;
    const userId = req.user.id;

    if (task_completed > task_planned) {
      return res.status(400).json({
        status: "failed",
        message: "Task completed cannot be greater than task planned",
      });
    }

    const newDate = new Date();
    const isRestDay = checkIsWeekendOrHoliday(newDate);

    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    const lastFaceScan = await getLastFaceScanByDate({
      userId: userId,
      startDate: startOfToday,
      endDate: endOfToday,
    });

    if (!lastFaceScan) {
      return res.status(403).json({
        status: "failed",
        message:
          "You haven't done your face check-in today. Please scan your face first",
      });
    }

    const finalMoodScore = getMoodScoreFromEmotion(lastFaceScan.emotion);
    const completionRatio = task_completed / task_planned;

    const finalStressLevel = calculateStressLevel({
      sleep_duration,
      study_work_duration,
      downtime_duration,
      exercise_duration,
      task_planned,
      task_completed,
    });

    const finalFocusScore = calculateFocusScore({
      sleep_duration,
      study_work_duration,
      downtime_duration,
      exercise_duration,
      task_planned,
      task_completed,
    });
    const breakDuration = Math.max(
      0,
      24.0 -
        (sleep_duration +
          study_work_duration +
          downtime_duration +
          exercise_duration / 60),
    );

    const finalProductivityScore = calculateProductivityScore({
      sleep_duration,
      exercise_duration,
      downtime_duration,
      mood_score: finalMoodScore,
      break_duration: breakDuration,
      completion_ratio: completionRatio,
      stress_level: finalStressLevel,
      focus_score: finalFocusScore,
    });

    const currentFatigueIndex = calculateFatigueIndex({
      stress_level: finalStressLevel,
      downtime_duration,
      study_work_duration,
    });

    const previousLog = await getPreviousDailyLog(userId, startOfToday);
    const previousFatigue = previousLog
      ? previousLog.fatigue_accumulation
      : null;

    const finalFatigueAccumulation = calculateCumulativeFatigue(
      currentFatigueIndex,
      previousFatigue,
    );

    const dailyLogs = await createDailyLog({
      id: uuidv4(),
      user_id: userId,
      is_weekend: isRestDay,
      sleep_duration,
      study_work_duration,
      break_duration: breakDuration.toFixed(3),
      exercise_duration,
      downtime_duration,
      stress_level: finalStressLevel,
      mood_score: finalMoodScore,
      focus_score: finalFocusScore,
      task_completed,
      task_planned,
      completion_ratio: completionRatio,
      fatigue_accumulation: finalFatigueAccumulation,
      productivity_score: finalProductivityScore,
    });

    const dailySummary = {
      sleep_duration,
      study_work_duration,
      exercise_duration,
      downtime_duration,
      stress_level: finalStressLevel,
      focus_score: finalFocusScore,
      task_planned,
      task_completed,
      last_updated: formatDateForFE(dailyLogs.created_at),
    };

    const last7Logs = await getLast7DailyLogs(userId);
    if (last7Logs.length < 7) {
      const daysShort = 7 - last7Logs.length;
      return res.status(200).json({
        status: "success",
        message: `Daily log saved successfully! AI prediction needs ${daysShort} more days of data.`,
      });
    }

    const formattedLast7Logs = last7Logs.map((log) => ({
      id: log.id,
      user_id: log.user_id,
      log_date: log.log_date,
      is_weekend: log.is_weekend,
      sleep_duration: log.sleep_duration,
      study_work_duration: log.study_work_duration,
      break_duration: log.break_duration,
      exercise_duration: log.exercise_duration,
      downtime_duration: log.downtime_duration,
      stress_level: log.stress_level,
      mood_score: log.mood_score,
      focus_score: log.focus_score,
      task_planned: log.task_planned,
      task_completed: log.task_completed,
      completion_ratio: log.completion_ratio,
      fatigue_index: calculateFatigueIndex({
        stress_level: log.stress_level,
        downtime_duration: log.downtime_duration,
        study_work_duration: log.study_work_duration,
      }),
      cumulative_fatigue: log.fatigue_accumulation,
    }));

    const pythonResponse = await axios.post(
      process.env.AI_PREDICTION_URL,
      {
        last_7_logs: formattedLast7Logs,
      },
      {
        headers: { Authorization: `Bearer ${process.env.SECRET_TOKEN_AI}` },
        timeout: 80000,
      },
    );

    const aiResult = pythonResponse.data;

    const savedPrediction = await createPredictionLog({
      id: uuidv4(),
      ...aiResult,
    });

    return res.status(200).json({
      status: "success",
      message: `Daily log saved successfully`,
    });
  } catch (error) {
    console.error("Productivity Error:", error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        status: "failed",
        message: "The AI microservice rejects the request",
        error: error.response.data.detail,
      });
    }

    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};

export const updateDailyLogAnalytic = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const {
      sleep_duration,
      study_work_duration,
      exercise_duration,
      downtime_duration,
      task_planned,
      task_completed,
    } = req.body;

    if (task_completed > task_planned) {
      return res.status(400).json({
        status: "failed",
        message: "Task completed cannot be greater than task planned",
      });
    }

    const existingLog = await findDailyLog(id, userId);
    if (!existingLog) {
      return res.status(404).json({
        status: "failed",
        message: "Daily log not found.",
      });
    }

    const finalMoodScore = existingLog.mood_score;
    const completionRatio = task_completed / task_planned;

    const finalStressLevel = calculateStressLevel({
      sleep_duration,
      study_work_duration,
      downtime_duration,
      exercise_duration,
      task_planned,
      task_completed,
    });

    const finalFocusScore = calculateFocusScore({
      sleep_duration,
      study_work_duration,
      downtime_duration,
      exercise_duration,
      task_planned,
      task_completed,
    });

    const breakDuration = Math.max(
      0,
      24.0 -
        (sleep_duration +
          study_work_duration +
          downtime_duration +
          exercise_duration / 60),
    );

    const finalProductivityScore = calculateProductivityScore({
      sleep_duration,
      exercise_duration,
      downtime_duration,
      mood_score: finalMoodScore,
      break_duration: breakDuration,
      completion_ratio: completionRatio,
      stress_level: finalStressLevel,
      focus_score: finalFocusScore,
    });

    const currentFatigueIndex = calculateFatigueIndex({
      stress_level: finalStressLevel,
      downtime_duration,
      study_work_duration,
    });

    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));

    const previousLog = await getPreviousDailyLog(userId, startOfToday);
    const previousFatigue = previousLog
      ? previousLog.fatigue_accumulation
      : null;

    const finalFatigueAccumulation = calculateCumulativeFatigue(
      currentFatigueIndex,
      previousFatigue,
    );

    const updatedDailyLog = await updateDailyLog({
      id: id,
      user_id: userId,
      sleep_duration,
      study_work_duration,
      break_duration: breakDuration.toFixed(3),
      exercise_duration,
      downtime_duration,
      stress_level: finalStressLevel,
      mood_score: finalMoodScore,
      focus_score: finalFocusScore,
      task_completed,
      task_planned,
      completion_ratio: completionRatio.toFixed(3),
      fatigue_accumulation: finalFatigueAccumulation,
      productivity_score: finalProductivityScore,
    });

    const dailySummary = {
      sleep_duration,
      study_work_duration,
      exercise_duration,
      downtime_duration,
      stress_level: finalStressLevel,
      focus_score: finalFocusScore,
      task_planned,
      task_completed,
      last_updated: formatDateForFE(updatedDailyLog.updated_at),
    };

    const last7Logs = await getLast7DailyLogs(userId);
    if (last7Logs.length < 7) {
      const daysShort = 7 - last7Logs.length;
      return res.status(200).json({
        status: "success",
        message: `Daily log successfully updated! AI prediction needs ${daysShort} more days of data.`,
      });
    }

    const formattedLast7Logs = last7Logs.map((log) => ({
      id: log.id,
      user_id: log.user_id,
      log_date: log.log_date,
      is_weekend: log.is_weekend,
      sleep_duration: log.sleep_duration,
      study_work_duration: log.study_work_duration,
      break_duration: log.break_duration,
      exercise_duration: log.exercise_duration,
      downtime_duration: log.downtime_duration,
      stress_level: log.stress_level,
      mood_score: log.mood_score,
      focus_score: log.focus_score,
      task_planned: log.task_planned,
      task_completed: log.task_completed,
      completion_ratio: log.completion_ratio,
      fatigue_index: calculateFatigueIndex({
        stress_level: log.stress_level,
        downtime_duration: log.downtime_duration,
        study_work_duration: log.study_work_duration,
      }),
      cumulative_fatigue: log.fatigue_accumulation,
    }));

    const pythonResponse = await axios.post(
      process.env.AI_PREDICTION_URL,
      {
        last_7_logs: formattedLast7Logs,
      },
      {
        headers: { Authorization: `Bearer ${process.env.SECRET_TOKEN_AI}` },
        timeout: 80000,
      },
    );

    const aiResult = pythonResponse.data;

    const savedPrediction = await createPredictionLog({
      id: uuidv4(),
      ...aiResult,
    });

    return res.status(200).json({
      status: "success",
      message: "Daily log successfully updated.",
    });
  } catch (error) {
    console.error("Update Productivity Error:", error.message);
    if (error.response) {
      return res.status(error.response.status).json({
        status: "failed",
        message: "The AI microservice rejects the request",
        error: error.response.data.detail,
      });
    }
    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};

export const getLatestPrediction = async (req, res) => {
  try {
    const userId = req.user.id;
    const latestPrediction = await getLatestPredictionLog(userId);

    if (!latestPrediction) {
      return res.status(200).json({
        status: "success",
        data: null,
      });
    }

    const rawHeatmap = latestPrediction.activity_heatmap || {};
    const normalizedRaw = {};
    Object.keys(rawHeatmap).forEach((key) => {
      normalizedRaw[key.toLowerCase()] = rawHeatmap[key];
    });
    const processedHeatmap = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayName = d
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();
      const dayShort = dayName.substring(0, 3).toUpperCase();
      const aiValue = normalizedRaw[dayName];

      return {
        day: dayShort,
        value: aiValue !== undefined ? Math.round(aiValue) : 0,
      };
    });

    const formattedData = {
      "1_main_dashboard": {
        productivity_status: latestPrediction.productivity_status,
        productivity_score: latestPrediction.productivity_score,
        prediction_confidence: latestPrediction.prediction_confidence,
        probabilities: latestPrediction.probabilities,
        fatigue_level: latestPrediction.fatigue_level,
        completion_rate: latestPrediction.completion_rate,
        risk_signal: latestPrediction.risk_signal,
      },
      "2_productivity_analytics_dashboard": {
        weekly_productivity_trend: latestPrediction.weekly_trend,
        most_dominant_activity: latestPrediction.dominant_activity,
        peak_productive_hours: latestPrediction.peak_productive_hours,
        daily_productivity_chart: latestPrediction.daily_chart_data,
        activity_heatmap: processedHeatmap,
      },
      "3_ai_insight_and_recommendation": {
        condition_insight: latestPrediction.condition_insight,
        performance_cause: latestPrediction.performance_cause,
        activity_recommendation: latestPrediction.activity_recommendation,
        tomorrow_prediction: latestPrediction.tomorrow_prediction,
        burnout_warning: latestPrediction.burnout_warning,
      },
      "4_similar_productivity_history": {
        top_3_similar_days: latestPrediction.top_similar_days,
        average_productivity_from_similar_days:
          latestPrediction.avg_similar_productivity,
      },
    };

    return res.status(200).json({
      status: "success",
      message: "Latest AI prediction retrieved successfully",
      data: formattedData,
    });
  } catch (error) {
    console.error("Fetch Latest Prediction Error:", error.message);
    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};

export const getDailySummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const latestLog = await getLatestDailyLog(userId);

    if (!latestLog) {
      return res.status(200).json({
        status: "success",
        message: "No daily log found",
        data: {
          dailySummary: {
            sleep_duration: 0,
            study_work_duration: 0,
            downtime_duration: 0,
            exercise_duration: 0,
            stress_level: 0,
            last_updated: "Belum ada aktivitas",
          },
        },
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Daily summary retrieved successfully",
      data: {
        dailySummary: {
          sleep_duration: latestLog.sleep_duration,
          study_work_duration: latestLog.study_work_duration,
          downtime_duration: latestLog.downtime_duration,
          exercise_duration: latestLog.exercise_duration,
          stress_level: latestLog.stress_level,
          last_updated: formatDateForFE(latestLog.created_at),
        },
      },
    });
  } catch (error) {
    console.error("Get Daily Summary Error:", error.message);
    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};

export const getDailyLogs = async (req, res) => {
  try {
    const userId = req.user.id;

    const dailyLogs = await getDailyLog(userId);
    if (!dailyLogs) {
      return res.status(404).json({
        status: "failed",
        message: "No daily log found",
      });
    }
    res.status(200).json({
      status: "success",
      dailyLogs: dailyLogs || [],
    });
  } catch (error) {
    console.error("Getting daily log error: ", error.message);
    res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};
