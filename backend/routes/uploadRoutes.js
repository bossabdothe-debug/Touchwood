import express from "express";
import {
  createUploadUrl,
  deleteUpload,
} from "../controllers/uploadController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post(
  "/presign",
  authMiddleware,
  adminMiddleware,
  createUploadUrl
);

router.delete(
  "/",
  authMiddleware,
  adminMiddleware,
  deleteUpload
);

export default router;