import { createFaceAnalyticsLog } from "../models/analyticModel.js";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

export const scanAndRecordFace = async (req, res) => {
  const { image_base64 } = req.body;
  const userId = req.user.id;
  try {
    const pythonResponse = await axios.post(
      process.env.FACE_DETECTION,
      { image_base64 },
      {
        headers: { Authorization: `Bearer ${process.env.SECRET_TOKEN_AI}` },
        timeout: 80000,
      },
    );

    const aiResult = pythonResponse.data.data;

    const savedLog = await createFaceAnalyticsLog({
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
