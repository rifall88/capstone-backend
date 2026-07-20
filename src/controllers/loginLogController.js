import { getAllLoginLogs } from "../models/loginLogModel.js";
import { formatDateForFE, parseUserAgent } from "../utils/dateFormatter.js";

export const viewLoginLogs = async (req, res) => {
  try {
    const logs = await getAllLoginLogs();

    const formattedLogs = logs.map((log) => {
      return {
        id: log.id,
        time: formatDateForFE(log.created_at),
        user_or_email: log.identifier,
        ip_address: log.ip_address,
        device: parseUserAgent(log.user_agent),
        location: log.location || "Unknown",
        status: log.status,
        message:
          log.status === "success" ? "Login successful" : log.failure_reason,
      };
    });

    return res.status(200).json({
      status: "success",
      message: "Successfully retrieved login logs",
      data: formattedLogs,
    });
  } catch (error) {
    console.error("Get logs error:", error);
    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};
