import { flagUserForDeletion, deleteUser } from "../models/userModel.js";
import { findUser } from "../models/userModel.js";
import { findOtp, verifyOtp, incrementOtpAttempt } from "../models/otpModel.js";
import { v4 as uuidv4 } from "uuid";
import { generateOTP } from "../service/otpService.js";
import {
  sendDeleteAccountOtpEmail,
  sendAdminDeletionEmail,
  sendUserDeletionPendingEmail,
} from "../service/emailService.js";

export const requestDeleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await findUser(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "failed", message: "User not found" });
    }

    const otpData = await generateOTP(userId, user.email, "account_deletion");

    await sendDeleteAccountOtpEmail(user.email, otpData.otp_code);

    return res.status(200).json({
      status: "success",
      message: "OTP to confirm account deletion has been sent to your email.",
    });
  } catch (error) {
    console.error("Request delete error:", error);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal server error" });
  }
};

export const confirmDeleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;

    const user = await findUser(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "failed", message: "User not found" });
    }

    const otpEntry = await findOtp(userId);

    if (!otpEntry || otpEntry.type !== "account_deletion") {
      return res.status(400).json({
        status: "failed",
        message: "OTP is incorrect, expired, or invalid type",
      });
    }

    if (otpEntry.attempt_count >= 10) {
      return res.status(403).json({
        status: "failed",
        message: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    if (otpEntry.otp_code !== code) {
      const updatedLog = await incrementOtpAttempt(
        otpEntry.id,
        otpEntry.attempt_count,
      );
      const sisaKesempatan = 10 - updatedLog.attempt_count;

      if (sisaKesempatan <= 0) {
        return res.status(400).json({
          status: "failed",
          message: "OTP invalid. Max attempts reached.",
        });
      }
      return res.status(400).json({
        status: "failed",
        message: `Wrong OTP code! Your remaining chance is ${sisaKesempatan} one more time`,
      });
    }

    await flagUserForDeletion(userId);

    try {
      await sendAdminDeletionEmail(user.email, user.username);
      await sendUserDeletionPendingEmail(user.email);
    } catch (emailError) {
      console.error("Failed to send deletion notification email: ", emailError);
    }

    await verifyOtp(otpEntry.id, user.id);

    return res.status(200).json({
      status: "success",
      message:
        "Account deletion requested successfully. Admin will process the deletion during working hours (Monday-Friday, 08:00 - 15:00).",
    });
  } catch (error) {
    console.error("Confirm delete error:", error);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal server error" });
  }
};

export const softDelete = async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await deleteUser(userId);
    if (!deletedUser) {
      return res
        .status(404)
        .json({ status: "failed", message: "User not found" });
    }

    return res
      .status(200)
      .json({ status: "success", message: "Delete user successful" });
  } catch (err) {
    console.error("Error deleting user: ", err);
    res
      .status(500)
      .json({ status: "failed", message: "Internal server error" });
  }
};
