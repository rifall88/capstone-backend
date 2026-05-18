import { randomInt } from "crypto";
import { createOtp } from "../models/otpModel.js";

export const generateOTP = async (userId, email, type) => {
  const otpCode = randomInt(100000, 999999).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000);

  await createOtp({
    user_id: user.id,
    otp_code: otpCode,
    type,
    target: email,
    expired_at: expires,
  });
};
