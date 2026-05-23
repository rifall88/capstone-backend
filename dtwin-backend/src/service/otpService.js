import { randomInt } from "crypto";
import { createOtp } from "../models/otpModel.js";
import { v4 as uuidv4 } from "uuid";

export const generateOTP = async (userId, email, type) => {
  const otpCode = randomInt(100000, 999999).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000);

  await createOtp({
    id: uuidv4(),
    user_id: userId,
    otp_code: otpCode,
    type,
    target: email,
    expired_at: expires,
  });

  return { otp_code: otpCode, expired_at: expires };
};
