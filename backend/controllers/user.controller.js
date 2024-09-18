import User from "../models/user.model.js";
import mongoose from "mongoose";

export const getallUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error("Error fetching all users:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getAdmins = async (req, res) => {
    try {
        const admins = await User.find({ usertype: 'isAdmin' });
        res.status(200).json({ success: true, data: admins });
    } catch (error) {
        console.error("Error fetching admins:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getTeachers = async (req, res) => {
    try {
        const teachers = await User.find({ usertype: 'isTeacher' });
        res.status(200).json({ success: true, data: teachers });
    } catch (error) {
        console.error("Error fetching teachers:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getStudents = async (req, res) => {
    try {
        const students = await User.find({ usertype: 'isStudent' });
        res.status(200).json({ success: true, data: students });
    } catch (error) {
        console.error("Error fetching students:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};