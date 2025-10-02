import express from "express";
import { checkAuth, login, signUp, updateProfile } from "../controllers/userController.js";
import { protectedRoute } from "../middleware/auth.js";

export const userRouter = express.Router()

userRouter.post("/signup", signUp)
userRouter.post("/login", login)
userRouter.put("/updated-profile", protectedRoute, updateProfile) // // protected
userRouter.get("/check", protectedRoute, checkAuth) // protected

