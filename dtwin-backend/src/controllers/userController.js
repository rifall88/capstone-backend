import { registerUser, findEmail } from "../models/userModel.js";
import { createProfile } from "../models/profileModel.js";
import { findOtp, incrementOtpAttempt } from "../models/otpModel.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { generateOTP } from "../service/otpService.js";
import { sendOtpEmail } from "../service/emailService.js";
import AuthModel from "../models/prismaModel.js";

export const register = async (req, res) => {
  try {
    const { fullname, username, email, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const stringUuid = uuidv4();
    const user = await registerUser({
      id: stringUuid,
      username,
      email,
      password: hash,
      role: "user",
    });

    const profile = await createProfile({
      id: uuidv4(),
      user_id: user.id,
      fullname,
    });

    const otpData = await generateOTP(user.id, user.email, "REGISTRATION");
    await sendOtpEmail(user.email, otpData.otp_code);

    res.status(201).json({
      status: "success",
      message: "Register Success. Please check OTP for verification",
      data: {
        id: user.id,
        fullname,
        username,
        email,
        role,
      },
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        status: "failed",
        message: "Email or Username is already registered.",
      });
    }
    console.error("Register error", error);
    res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};

export const verifyOTP = async (req, res) => {
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

    await AuthModel.verifyOtp(otpEntry.id, user.id);

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
