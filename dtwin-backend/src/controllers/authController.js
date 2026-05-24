import {
  findEmailOrUsername,
  createLoginLog,
  createRefreshTokenLog,
  findValidRefreshToken,
  updateTokenLastUsed,
  revokeRefreshToken,
  findUserByEmail,
  createOauthUser,
  createOauthProfile,
} from "../models/authModel.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import geoip from "geoip-lite";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { OAuth2Client } from "google-auth-library";
dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const login = async (req, res) => {
  const ipAddress =
    req.headers["cf-connecting-ip"] ||
    req.headers["x-forwarded-for"] ||
    req.ip ||
    req.socket.remoteAddress;
  const countryCode = req.headers["cf-ipcountry"] || "Unknown";
  const userAgent = req.headers["user-agent"] || "Unknown Device";
  const geo = geoip.lookup(ipAddress);
  const location = geo ? `${geo.city}, ${geo.country}` : "Unknown";

  try {
    const { identifier, password } = req.body;

    const user = await findEmailOrUsername(identifier);

    if (!user) {
      await createLoginLog({
        userId: null,
        identifier,
        ipAddress,
        userAgent,
        status: "failed",
        failureReason: "Email not registered",
        location,
      });
      return res.status(401).json({ status: "failed", message: "Wrong email" });
    }

    if (!user.password) {
      await createLoginLog({
        userId: user.id,
        identifier,
        ipAddress,
        userAgent,
        status: "failed",
        failureReason: "User login via Google/OAuth",
        location,
      });
      return res
        .status(500)
        .json({ status: "failed", message: "User does not have a password" });
    }

    if (!user.is_verified) {
      await createLoginLog({
        userId: user.id,
        identifier,
        ipAddress,
        userAgent,
        status: "failed",
        failureReason: "Account has not been OTP verified",
        location,
      });
      return res.status(403).json({
        status: "failed",
        message:
          "Your account has not been verified, please verify the OTP first",
        needVerification: true,
      });
    }

    const pwIsTrue = await bcrypt.compare(password, user.password);
    if (!pwIsTrue) {
      await createLoginLog({
        userId: user.id,
        identifier,
        ipAddress,
        userAgent,
        status: "failed",
        failureReason: "Wrong password",
        location,
      });
      return res
        .status(401)
        .json({ status: "failed", message: "Wrong password" });
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: "3h" },
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.REFRESH_TOKEN_KEY,
      { expiresIn: "1d" },
    );

    await createRefreshTokenLog({
      userId: user.id,
      token: refreshToken,
      ipAddress,
      userAgent,
    });
    await createLoginLog({
      userId: user.id,
      identifier,
      ipAddress,
      userAgent,
      status: "success",
      failureReason: null,
      location,
    });

    res.status(200).json({
      status: "success",
      message: "Login success",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error: ", error);
    res
      .status(500)
      .json({ status: "failed", message: "Internal server error" });
  }
};

export const googleLogin = async (req, res) => {
  const ipAddress =
    req.headers["cf-connecting-ip"] ||
    req.headers["x-forwarded-for"] ||
    req.ip ||
    req.socket.remoteAddress;
  const countryCode = req.headers["cf-ipcountry"] || "Unknown";
  const userAgent = req.headers["user-agent"] || "Unknown Device";
  const geo = geoip.lookup(ipAddress);
  const location = geo ? `${geo.city}, ${geo.country}` : "Unknown";

  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res
        .status(400)
        .json({ status: "failed", message: "ID token is required" });
    }

    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await findUserByEmail(email);

    if (!user) {
      const userUuid = uuidv4();
      const generatedUsername =
        email.split("@")[0] + Math.floor(100 + Math.random() * 900);

      user = await createOauthUser({
        id: userUuid,
        username: generatedUsername,
        email: email,
        provider: "google",
        provider_id: payload.sub,
      });

      await createOauthProfile({
        id: uuidv4(),
        userId: userUuid,
        fullname: name,
      });
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: "3h" },
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.REFRESH_TOKEN_KEY,
      { expiresIn: "1d" },
    );

    await createRefreshTokenLog({
      userId: user.id,
      token: refreshToken,
      ipAddress,
      userAgent,
    });

    await createLoginLog({
      userId: user.id,
      identifier: email,
      ipAddress,
      userAgent,
      status: "success",
      failureReason: "Login via Google OAuth",
      location,
    });

    res.status(200).json({
      status: "success",
      message: "Login success",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Google OAuth error: ", error);
    await createLoginLog({
      userId: null,
      identifier: req.body.email || "Unknown OAuth Attempt",
      ipAddress,
      userAgent,
      status: "failed",
      failureReason: "Google authentication failed",
      location,
    });

    res
      .status(401)
      .json({ status: "failed", message: "Google authentication failed" });
  }
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res
      .status(400)
      .json({ status: "failed", message: "Refresh token is required" });
  }

  try {
    const tokenData = await findValidRefreshToken(refreshToken);
    if (!tokenData) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid refresh token",
      });
    }

    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);

    await updateTokenLastUsed(tokenData.id);

    const accesstoken = jwt.sign(
      { id: payload.id, role: payload.role },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: "3h" },
    );

    res.status(200).json({
      status: "success",
      data: {
        id: payload.id,
        accessToken: accesstoken,
      },
    });
  } catch (error) {
    console.error("Refresh error:", error);

    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res
        .status(401)
        .json({ status: "failed", message: "Token expired atau invalid" });
    }

    res
      .status(500)
      .json({ status: "failed", message: "Internal server error" });
  }
};

export const deletetkn = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res
      .status(400)
      .json({ status: "failed", message: "Refresh token is required" });
  }

  try {
    const hpsToken = await revokeRefreshToken(refreshToken);

    if (!hpsToken) {
      return res.status(400).json({
        status: "failed",
        message: "Token not found or is no longer valid",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Logout success",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res
      .status(500)
      .json({ status: "failed", message: "Internal server error" });
  }
};
