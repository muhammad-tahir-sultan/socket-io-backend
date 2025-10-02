// middleware to protect routes 

import { userModel } from "../models/User.js"
import jwt from 'jsonwebtoken'

export const protectedRoute = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(403).json({ success: false, message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(403).json({ success: false, message: "Unauthorized Access!" })
        }

        req.user = user;
        next();
    } catch (error) {
        console.log(error.message);
        return res.status(403).json({ success: false, message: error.message })
    }
};
