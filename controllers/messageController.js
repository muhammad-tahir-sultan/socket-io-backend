// Get all users except the loggedIn user

import { Message } from "../models/Message.js";
import { userModel } from "../models/User.js";
import cloudinary from '../lib/cloudinary.js'
import { io, userSocketMap } from "../server.js";

// Unseen Messages 
export const getUserFromSidebar = async (req, res) => {
    try {
        const userId = req.user._id;

        const filteredUsers = await userModel.find({ _id: { $ne: userId } }).select("-password")

        // count number of messages not seen

        const unseenMessages = {}

        const promises = filteredUsers.map(async (user) => {
            const messages = await Message.find({ senderId: user._id, receiverId: userId, seen: false })

            if (messages.length > 0) {
                unseenMessages[user._id] = messages.length
            }
        })

        await Promise.all(promises)

        return res.status(200).json({
            success: true,
            users: filteredUsers,
            unseenMessages
        })

    } catch (error) {
        console.log(error.message);

        return res.status(500).json({
            success: false,
            error: error.message,
        })
    }
}

// Get All Messages for Selected User  
export const getMessagesForSelectedUser = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;

        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId },
            ]
        })

        await Message.updateMany({ senderId: selectedUserId, receiverId: myId }, { seen: true })


        return res.status(200).json({
            success: true,
            messages
        })

    } catch (error) {
        console.log(error.message);

        return res.status(500).json({
            success: false,
            error: error.message,
        })
    }
}



//  markMessageAsSeen using message id
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;

        await Message.findByIdAndUpdate(id, { seen: true })

        return res.status(200).json({
            success: true,
        })

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            error: error.message,
        })
    }
}

//  send message to selected user
export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body

        const senderId = req.user._id
        const { id: receiverId } = req.params;

        let imageUrl;

        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url
        }

        const newMessage = await Message.create({
            senderId, receiverId, text, image: imageUrl
        })

        //  emit the new message to the receiver's socket
        const receiverSocketId = userSocketMap[receiverId]

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

        return res.status(200).json({
            success: true,
            newMessage
        })

    } catch (error) {

        console.log(error.message);
        return res.status(500).json({
            success: false,
            error: error.message,
        })
    }
}
