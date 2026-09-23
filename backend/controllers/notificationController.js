import mongoose from "mongoose";
import Notification from "../models/Notification.js";

export const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate(
        "order",
        "orderNumber status totalPrice subtotal shipping discount"
      )
      .populate(
        "user",
        "firstName lastName name username email"
      )
      .populate(
        "product",
        "name slug price oldPrice media stock colors active"
      )
      .sort({
        createdAt: -1,
      })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({
      read: false,
    });

    return res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "Get admin notifications error:",
      error
    );

    return res.status(500).json({
      message: "Server error, please try again later",
    });
  }
};

export const markNotificationAsRead = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid notification ID",
      });
    }

    const notification =
      await Notification.findByIdAndUpdate(
        id,
        {
          $set: {
            read: true,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "order",
          "orderNumber status totalPrice"
        )
        .populate(
          "user",
          "firstName lastName name username email"
        )
        .populate(
          "product",
          "name slug price oldPrice media stock"
        );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error(
      "Mark notification as read error:",
      error
    );

    return res.status(500).json({
      message: "Server error, please try again later",
    });
  }
};

export const markAllNotificationsAsRead = async (
  req,
  res
) => {
  try {
    await Notification.updateMany(
      {
        read: false,
      },
      {
        $set: {
          read: true,
        },
      }
    );

    return res.status(200).json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error(
      "Mark all notifications as read error:",
      error
    );

    return res.status(500).json({
      message: "Server error, please try again later",
    });
  }
};

export const deleteNotification = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid notification ID",
      });
    }

    const notification =
      await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete notification error:",
      error
    );

    return res.status(500).json({
      message: "Server error, please try again later",
    });
  }
};