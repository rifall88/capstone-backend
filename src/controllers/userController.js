import { registerUser, findEmail } from "../models/userModel.js";
import { createProfile } from "../models/profileModel.js";
import { findOtp } from "../models/otpModel.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";
import { generateOTP } from "../service/otpService.js";
import { sendOtpEmail } from "../service/emailService.js";
import AuthModel from "../models/prismaModel.js";

const prisma = new PrismaClient();

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
      message: "Register Success. Silakan cek OTP untuk verifikasi.",
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
        message: "Email atau Username sudah terdaftar",
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
        .json({ status: "failed", message: "User tidak ditemukan!" });
    }

    const otpEntry = await findOtp({
      user_id: user.id,
      otp_code: code,
    });

    if (!otpEntry) {
      return res
        .status(400)
        .json({ status: "failed", message: "OTP salah atau sudah expired!" });
    }

    await AuthModel.verifyOtp(otpEntry.id, user.id);

    return res
      .status(200)
      .json({ status: "success", message: "Verifikasi berhasil!" });
  } catch (error) {
    console.error("Verify error", error);
    res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};
