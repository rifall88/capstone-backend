import { findUser } from "../models/userModel.js";
import { changePassword } from "../models/userModel.js";
import bcrypt from "bcrypt";

export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await findUser(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "failed", message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "failed",
        message: "The old password you entered is incorrect",
      });
    }

    const isSameAsBefore = await bcrypt.compare(newPassword, user.password);
    if (isSameAsBefore) {
      return res.status(400).json({
        status: "failed",
        message: "New password cannot be the same as your current password",
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await changePassword(userId, hashedNewPassword);

    return res.status(200).json({
      status: "success",
      message: "Password successfully changed",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res
      .status(500)
      .json({ status: "failed", message: "Internal server error" });
  }
};
