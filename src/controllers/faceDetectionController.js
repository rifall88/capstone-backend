import {
  createFaceAnalyticsLog,
  updateUserProfileViaAI,
} from "../models/faceDetectionModel.js";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

export const scanAndRecordFace = async (req, res) => {
  const { image_base64 } = req.body;
  const userId = req.user.id;

  if (!image_base64) {
    return res.status(400).json({
      status: "failed",
      message: "Snapshot gambar dari kamera tidak boleh kosong!",
    });
  }

  try {
    const pythonResponse = await axios.post(
      process.env.FACE_DETECTION,
      { image_base64 },
      {
        headers: { Authorization: `Bearer ${process.env.SECRET_TOKEN_AI}` },
        timeout: 60000,
      },
    );

    const aiResult = pythonResponse.data.data;

    const savedLog = await createFaceAnalyticsLog({
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
      message: `Facial analysis successful! Mood kamu hari ini: ${aiResult.emotion}`,
      data: savedLog,
    });
  } catch (error) {
    console.error("Express Face Detection Error:", error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        status: "failed",
        message: "Microservice AI menolak request",
        error: error.response.data.detail,
      });
    }

    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};

export const applyFaceDetectionToProfile = async (req, res) => {
  const { image_base64 } = req.body;
  const userId = req.user.id;

  if (!image_base64) {
    return res.status(400).json({
      status: "failed",
      message: "Snapshot gambar dari kamera tidak boleh kosong!",
    });
  }

  try {
    const pythonResponse = await axios.post(
      process.env.FACE_DETECTION,
      { image_base64 },
      {
        headers: { Authorization: `Bearer ${process.env.SECRET_TOKEN_AI}` },
        timeout: 60000,
      },
    );

    const aiResult = pythonResponse.data.data;

    await createFaceAnalyticsLog({
      user_id: userId,
      predicted_age: aiResult.predicted_age,
      confidence_score: aiResult.confidence_score,
      emotion: aiResult.emotion,
      gender: aiResult.gender,
      is_known_face: true,
      source: "user_triggered_profile_update",
    });

    const currentYear = new Date().getFullYear();
    const estimatedBirthYear = currentYear - aiResult.predicted_age;
    const formattedBirthDate = `${estimatedBirthYear}-01-01`;

    const updatedProfile = await updateUserProfileViaAI(
      userId,
      formattedBirthDate,
      aiResult.gender,
    );

    if (!updatedProfile) {
      return res.status(404).json({
        status: "failed",
        message: "Profile user not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Face detection feature successful",
      data: {
        updated_profile: updatedProfile,
        ai_detected: {
          age: aiResult.predicted_age,
          gender: aiResult.gender,
        },
      },
    });
  } catch (error) {
    console.error("Express Apply Profile Error:", error.message);
    if (error.response) {
      return res.status(error.response.status).json({
        status: "failed",
        message: "Microservice AI menolak request",
        error: error.response.data.detail,
      });
    }
    return res.status(500).json({
      status: "failed",
      message: "Internal server error.",
    });
  }
};
