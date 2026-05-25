import { changeEmail, findOtp } from "../models/changeEmailModel.js";
import { incrementOtpAttempt } from "../models/otpModel.js";
import { generateOTP } from "../service/otpService.js";
import { sendOtpEmail } from "../service/emailService.js";
import { v4 as uuidv4 } from "uuid";
import AuthModel from "../models/prismaModel.js";

export const updateEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user.id;

    const otpData = await generateOTP(userId, email, "change_email");
    await sendOtpEmail(email, otpData.otp_code);

    return res.status(200).json({
      status: "success",
      message: "OTP code for change email has been sent to your email",
      data: { email },
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        status: "failed",
        message: "Email is already registered.",
      });
    }
    console.error("Change email error", error);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal server error" });
  }
};

export const verifyOTP = async (req, res) => {
  const { code } = req.body;
  const userId = req.user.id;

  try {
    const otpEntry = await findOtp(userId);

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

    await changeEmail(userId, otpEntry.target);

    await AuthModel.verifyOtp(otpEntry.id, userId);

    return res
      .status(200)
      .json({ status: "success", message: "OTP verification successful" });
  } catch (error) {
    console.error("Verify error", error);
    res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};
