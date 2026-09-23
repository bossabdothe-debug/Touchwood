import { login } from "../controllers/authController.js";
import { register } from "../controllers/authController.js";
import express from 'express';
import { authMiddleware } from "../middleware/authMiddleware.js";
import { updateProfile } from "../controllers/authController.js";
import { changePassword } from "../controllers/authController.js";
const authRouter = express.Router();
authRouter.post("/login",login);
authRouter.post("/register",register);
authRouter.put("/update",authMiddleware,updateProfile);
authRouter.put("/password",authMiddleware,changePassword);

export default authRouter;