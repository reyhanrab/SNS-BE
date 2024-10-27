import NotificationLog from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  const { offset = 0, limit = 20 } = req.query; // Default limit to 20
  try {
    const notifications = await NotificationLog.find({ email: req.query.email })
      .populate({
        path: "campaign",
        select: "title", // Only include the title field from the Campaign model
      })
      .sort({ timestamp: -1 }) // Sort notifications by timestamp (most recent first)
      .skip(Number(offset))
      .limit(Number(limit));
    res.status(200).json({ results: notifications });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// Create a notification log
export const createNotificationLog = async (req, res) => {
  try {
    const notificationData = req.body;
    const notificationLog = new NotificationLog(notificationData);
    await notificationLog.save();
    res
      .status(200)
      .json({ message: "Notification logged successfully.", results: notificationLog });
  } catch (error) {
    console.error("Error logging notification:", error.message);
    res.status(500).json({ message: "Error logging notification.", error: error.message });
  }
};
