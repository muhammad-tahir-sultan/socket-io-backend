import { generateToken } from "../lib/utils.js"
import { userModel } from "../models/User.js"
import cloudinary from '../lib/cloudinary.js'
import bcrypt from "bcryptjs";
export const signUp = async (req, res) => {
    try {
        const { email, fullName, password, profilePic, bio } = req.body

        console.log(req.body);

        if (!fullName || !email || !password || !bio) {
            return res.json({ success: false, message: "Missing Details" })
        }

        const user = await userModel.findOne({ email })

        if (user) {
            return res.json({ success: false, message: "User Already Exists With Given Email" })
        }

        const salt = await bcrypt.genSalt(10)

        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = await userModel.create({ email, fullName, password: hashedPassword, profilePic, bio })

        const token = generateToken(newUser?._id)

        return res.status(201).json({
            success: true,
            userData: newUser,
            message: "Account Created Successfully",
            token
        })


    } catch (error) {
        console.log(error.message);

        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


// login User Controller 
export const login = async (req, res) => {
    try {
        console.log(req.body);
        const { email, password } = req.body



        if (!email || !password) {
            return res.json({ success: false, message: "Missing Details" })
        }

        const userData = await userModel.findOne({ email })

        if (!userData) {
            return res.json({ success: false, message: "Invalid Credentials!" })
        }

        const matchPassword = await bcrypt.compare(password, userData.password)

        if (!matchPassword) {
            return res.json({ success: false, message: "Invalid Credentials!" })
        }

        const token = generateToken(userData?._id)

        return res.status(201).json({
            success: true,
            userData,
            token,
            message: "Login Successful"
        })


    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


// check user is authenticated or not 
export const checkAuth = (req, res) => {
    res.json({ success: true, user: req.user })
}


// update User Profile
export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body

        const userId = req.user._id

        if (!userId) {
            return res.json({ success: false, message: "Invalid Credentials!" })
        }

        let updateUser;

        if (!profilePic) {
            updateUser = await userModel.findByIdAndUpdate(userId, { bio, fullName }, { new: true })
        } else {
            const upload = await cloudinary.uploader.upload(profilePic)

            updateUser = await userModel.findByIdAndUpdate(userId,
                { profilePic: upload.secure_url, bio, fullName },
                { new: true }
            )
        }

        return res.status(200).json({
            success: true,
            user: updateUser,
            message: "Profile Updated Successfully"
        })


    } catch (error) {

        console.log(error.message);

        return res.status(500).json({
            success: false,
            error: error.message,
        })
    }
}
