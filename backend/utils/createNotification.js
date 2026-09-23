import Notification from "../models/Notification.js";

const createNotification = async ({
  type,
  title,
  message,
  order = null,
  user = null,
  product = null,
}) => {
  try {
    const notification = await Notification.create({
      type,
      title,
      message,
      order,
      user,
      product,
    });

    return notification;
  } catch (error) {
    console.error(
      "Create notification error:",
      error
    );

    return null;
  }
};

export default createNotification;