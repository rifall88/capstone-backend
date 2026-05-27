import { findEmail } from "../models/userModel.js";
import { findOtp, verifyOtp, incrementOtpAttempt } from "../models/otpModel.js";
import {
  createPasswordResetToken,
  findResetToken,
} from "../models/passwordResetModel.js";
import { executePasswordReset } from "../models/userModel.js";
import { generateOTP } from "../service/otpService.js";
import { sendOtpEmail } from "../service/emailService.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await findEmail(email);
    if (!user) {
      return res
        .status(404)
        .json({ status: "failed", message: "Email is not registered" });
    }

    const otpData = await generateOTP(user.id, user.email, "forgot_password");
    await sendOtpEmail(user.email, otpData.otp_code);

    return res.status(200).json({
      status: "success",
      message: "OTP code for password reset has been sent to your email",
      data: { email: user.email },
    });
  } catch (error) {
    console.error("Forgot password error", error);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal server error" });
  }
};

export const verifyForgotPasswordOTP = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await findEmail(email);
    if (!user) {
      return res
        .status(404)
        .json({ status: "failed", message: "User not found" });
    }

    const otpEntry = await findOtp(user.id);
    if (!otpEntry) {
      return res
        .status(400)
        .json({ status: "failed", message: "OTP is incorrect or has expired" });
    }

    if (otpEntry.attempt_count >= 10) {
      return res.status(403).json({
        status: "failed",
        message:
          "Your account is temporarily blocked due to 10 incorrect OTP entries. Please request a new OTP",
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
          message:
            "The OTP code is incorrect. The opportunity is over, this OTP is invalid",
        });
      }
      return res.status(400).json({
        status: "failed",
        message: `Wrong OTP code! Your remaining chance is ${sisaKesempatan} one more time`,
      });
    }

    await verifyOtp(otpEntry.id, user.id);

    const idUuid = uuidv4();
    const resetToken = uuidv4();
    const expiredAt = new Date();
    expiredAt.setMinutes(expiredAt.getMinutes() + 15);

    await createPasswordResetToken({
      id: idUuid,
      user_id: user.id,
      token: resetToken,
      expired_at: expiredAt,
    });

    return res.status(200).json({
      status: "success",
      message: "OTP verification successful",
      data: { token: resetToken },
    });
  } catch (error) {
    console.error("Verify forgot OTP error", error);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const resetEntry = await findResetToken(token);
    if (!resetEntry) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid or incorrect reset token",
      });
    }

    if (resetEntry.is_used) {
      return res.status(400).json({
        status: "failed",
        message: "This token has already been used",
      });
    }

    const currentTime = new Date();
    if (currentTime > new Date(resetEntry.expired_at)) {
      return res
        .status(400)
        .json({ status: "failed", message: "The reset token has expired" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await executePasswordReset(
      resetEntry.user_id,
      resetEntry.id,
      hashedNewPassword,
    );

    return res.status(200).json({
      status: "success",
      message:
        "Your password has been successfully reset. Please login with your new password",
    });
  } catch (error) {
    console.error("Reset password error", error);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal server error" });
  }
};
