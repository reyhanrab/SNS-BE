import NotificationLog from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  const { offset = 0, limit = 20 } = req.query; // Default limit to 20
  try {
    const notifications = await NotificationLog.find()
      .sort({ timestamp: -1 }) // Sort notifications by timestamp (most recent first)
      .skip(Number(offset))
      .limit(Number(limit));
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};
