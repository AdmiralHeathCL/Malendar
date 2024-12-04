import nodemailer from 'nodemailer';
import User from '../models/user.model.js';

export const resetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    console.error("No email provided");
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`User with email ${email} not found`);
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a temporary password (hash in production)
    const tempPassword = Math.random().toString(36).substring(2, 8);
    user.password = tempPassword; // Update to hashed password in production
    await user.save();

    // Create a transporter using Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // Use true for port 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email configuration
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset - Martz",
      text: `Your temporary password is: ${tempPassword}. Please log in and change it immediately.`,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
    res.status(200).json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error("Error resetting password:", error.message);
    res.status(500).json({ error: "Failed to reset password" });
  }
};


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