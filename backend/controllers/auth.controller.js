import { generateTokenAndSetCookie } from "../lib/utils/generateTokens.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

// Function to generate a random background color from the color pool
const generateRandomColor = () => {
  const colorPool = [
    "#a8dadc", "#ff9f9f", "#9acbff", "#ffcc88", "#f4e1a1", 
    "#d8b7d1", "#d7b0f7", "#e5d1b4", "#a6c1e1", "#ffbdbd"
  ];
  const randomIndex = Math.floor(Math.random() * colorPool.length);
  return colorPool[randomIndex];
};

export const signup = async (req, res) => {
  try {
    const { username, password, usertype } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "请提供所有信息" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "该用户已存在" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "密码最短为6个字符" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a random background color for the new user
    const profileImg = generateRandomColor();

    const newUser = new User({
      username,
      password: hashedPassword,
      usertype: usertype || "isStudent", // Default to 'isStudent' if not provided
      profileImg, // Save the random background color here
    });

    await newUser.save();

    // Skip auto-login if created by admin
    if (req.user && req.user.usertype === "isAdmin") {
      return res.status(201).json({
        message: "用户创建成功",
        user: {
          _id: newUser._id,
          username: newUser.username,
          usertype: newUser.usertype,
          profileImg: newUser.profileImg, // Return the generated profileImg
        },
      });
    }

    // Auto-login logic for non-admin signups
    generateTokenAndSetCookie(newUser._id, res);
    res.status(201).json({
      _id: newUser._id,
      usertype: newUser.usertype,
      username: newUser.username,
      profileImg: newUser.profileImg, // Include the profile image color in the response
    });
  } catch (error) {
    console.log("Error in signup controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



export const login = async (req, res) => {
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username});
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "")

        if(!user || !isPasswordCorrect){
            return res.status(400).json({error: "用户名或密码不正确"})
        }

        generateTokenAndSetCookie(user._id, res);
        res.status(200).json({
            _id: user._id,
            usertype: user.usertype,
            username: user.username,
            inClass: user.inClass,
            profileImg: user.profileImg,
        })

    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge:0})
        res.status(200).json({message:"注销成功"})
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getMe controller", error.message);
        res.status(500).json({ error: "Internal Server Error" }); 
    }
}

export const remove = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.cookie("jwt", "", { maxAge: 0 });

        res.status(200).json({ message: "账户删除成功" });
    } catch (error) {
        console.log("Error in remove controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const removeUserById = async (req, res) => {
  const { id } = req.params; // Extract the user ID from the route parameters

  try {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "账户删除成功" });
  } catch (error) {
    console.error("Error in removeUserById controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
