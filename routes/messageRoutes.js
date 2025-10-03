import express from "express";
import { checkAuth, login, signUp, updateProfile } from "../controllers/userController.js";
import { getMessagesForSelectedUser, getUserFromSidebar, markMessageAsSeen, sendMessage } from "../controllers/messageController.js";
import { protectedRoute } from "../middleware/auth.js";
import { createRequire } from 'module';
import { createRequire } from 'module';

var require = createRequire(import.meta.url);
var module = { exports: {} };

const require = createRequire(import.meta.url);

export const messageRouter = express.Router()

messageRouter.get("/users", protectedRoute, getUserFromSidebar) // protected
messageRouter.get("/:id", protectedRoute, getMessagesForSelectedUser) // protected
messageRouter.put("/mark/:id", protectedRoute, markMessageAsSeen) // protected
messageRouter.post("/send/:id", protectedRoute, sendMessage) // protected



