import { updateProfile } from "../models/profileModel.js";

export const putProfile = async (req, res) => {
  const { full_name, phone, birth_date, gender } = req.body;
  const userId = req.user.id;

  try {
    const data = Object.fromEntries(
      Object.entries({
        full_name,
        phone,
        birth_date,
        gender,
      }).filter(([_, value]) => {
        return typeof value === "string"
          ? value.trim() !== ""
          : value !== undefined;
      }),
    );

    if (req.file) {
      data.profile_image = `uploads/${req.file.filename}`;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        status: "failed",
        message: "No valid data to update",
      });
    }

    const updatedProfile = await updateProfile(data, userId);

    if (!updatedProfile) {
      return res.status(404).json({
        status: "failed",
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Updating profile error:", error);
    console.error(error.message);
    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};
