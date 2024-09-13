import Inclass from "../models/inclass.model.js";
import User from "../models/user.model.js";
import Cluster from "../models/cluster.model.js";
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

// export const createcluster = async (req, res) => {
//     const inclass = req.body;
//     const inclassId = req.params.id;

//     const t_Id = req.teachers._id.toString();
//     const s_Id = req.students._id.toString();

//     const userId = req.user._id.toString();
//     const user = await User.findById(userId);
//     if(!user) {
//         return res.status(404).json({ message: "User not found" });
//     }

//     const newCluster = new Inclass({
//         teachers: {t_Id},
//         students: {s_Id},
//     });

//     try {
//         await newCluster.save();
//         res.status(201).json({ success: true, data: newCluster });
//     } catch (error) {
//         console.error("Error in Create cluster:", error.message);
//         res.status(500).json({ success: false, message: "Server Error" });
//     }
// }

export const createInclass = async (req, res) => {
    const inclass = req.body;
    const codeId = req.classcode._id.toString();
    // const inclassId = req.params.id;

    if(!inclass.classcodes || !inclass.type || !inclass.time) {
        return res.status(400).json({ success: false, message: "Please provide all fields" });
    }

    const classcode = await Cluster.findById(codeId);
    if(!classcode) {
        return res.status(404).json({ message: "Cluster not found" });
    }

    const newInclass = new Inclass({
        classcodes: {codeId},
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