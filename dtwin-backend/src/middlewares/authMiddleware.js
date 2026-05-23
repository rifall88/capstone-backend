import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "failed",
        message: "Token tidak ditemukan atau format salah",
      });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Authentication error: ", error);

    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ status: "failed", message: "Token tidak valid" });
    }

    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ status: "failed", message: "Token telah kadaluarsa" });
    }

    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};
