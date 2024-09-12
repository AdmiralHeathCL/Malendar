import Inclass from "../models/inclass.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

export const getInclasses = async (req, res) => {
    try {
        const inclasses = await Inclass({});
        res.status(200).json({ success: true, data: inclasses });
    } catch (error) {
        console.log("error in fetching classes:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

//Create a cluster of students individually?
export const createclass = async (req, res) => 

export const createInclass = async (req, res) => {
    const inclass = req.body;
    // const inclassId = req.params.id;

    // const t_Id = req.teachers._id.toString();
    // const s_Id = req.students._id.toString();

    // const teachers = await User.findById(t_Id);
    // const students = await User.findById(s_Id);

    const userId = req.user._id.toString();
    const user = await User.findById(userId);
    if(!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if(!classcode && !type && !time) {
        return res.status(400).json({ error: "Post must have text or image" });
    }

    const t_Id = 

    const s_Id = 

    if(!inclass.name || !inclass.type || !inclass.time) {
        return res.status(400).json({ success: false, message: "Please provide all fields" });
    }

    const newInclass = new Inclass({
        classcode,
        type,
        classroom,
        teachers: {t_Id},
        students: {s_Id},
        time
    });

    try {
        await newInclass.save();
        res.status(201).json({ success: true, data: newInclass });
    } catch (error) {
        console.error("Error in Create class:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }

}

export const updateInclass = async (req, res) => {
    const { id } = req.params;

    const inclass = req.body;

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return es.status(404).json({ success: false, message: "Class not found" });
    } 

    try {
        const updateInclass = await Inclass.findByIdAndUpdate(id, inclass, {new: true});
        res.status(200).json({ success: true, message: "Class updated" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const deleteInclass = async (req, res) => {
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return es.status(404).json({ success: false, message: "Class not found" });
    }
    
    try {
        await Class.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Class deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};