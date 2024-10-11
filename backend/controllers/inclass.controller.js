import Inclass from "../models/inclass.model.js";
import User from "../models/user.model.js";
import Cluster from "../models/cluster.model.js";
import mongoose from "mongoose";

export const getInClassByCluster = async (req, res) => {
    const { clusterId } = req.params;
  
    try {
      const inClassItems = await Inclass.find({ classcodes: clusterId });
      if (!inClassItems || inClassItems.length === 0) {
        return res.status(200).json({ success: true, data: [] }); // Return an empty array instead of 404
      }
  
      res.status(200).json({ success: true, data: inClassItems });
    } catch (error) {
      console.error('Error fetching in-class items:', error.message);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  };

export const getInclasses = async (req, res) => {
    try {
        // const inclasses = await Inclass({});
        const inclasses = await Inclass.find({}).populate('students').populate('teachers').populate('classcodes');
        res.status(200).json({ success: true, data: inclasses });
    } catch (error) {
        console.log("error in fetching classes:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

export const createInclass = async (req, res) => {
    const inclass = req.body;

    if(!inclass.date || !inclass.starttime || !inclass.endtime) {
        return res.status(400).json({ success: false, message: "Please provide all fields" });
    }

    const newInclass = new Inclass(inclass);

    try {
        await newInclass.save();

        if (inclass.classcodes && inclass.classcodes.length > 0) {
            await Cluster.updateMany(
                { _id: { $in: inclass.classcodes } },  
                { $addToSet: { inClass: newInclass._id } } 
            );
        };

        if (inclass.students && inclass.students.length > 0) {
            await User.updateMany(
                { _id: { $in: inclass.students } },  
                { $addToSet: { inClass: newInclass._id } } 
            );
        };

        res.status(201).json({ success: true, data: newInclass });
    } catch (error) {
        console.error("Error in Create class:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateInclass = async (req, res) => {
    const { id } = req.params;

    const inclass = req.body;

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return es.status(404).json({ success: false, message: "Class not found" });
    }

    try {
        const updateInclass = await Inclass.findByIdAndUpdate(id, inclass, {new: true});

        if (inclass.classcodes && inclass.classcodes.length > 0) {
            await Cluster.updateMany(
                { inClass: id, _id: { $nin: inclass.classcodes } },
                { $pull: { inClass: id } }
            );
            await Cluster.updateMany(
                { _id: { $in: inclass.classcodes } },
                { $addToSet: { inClass: id } }
            );
        }

        if (inclass.students && inclass.students.length > 0) {
            // Remove the class ID from users who are no longer in the class
            await User.updateMany(
                { inClass: id, _id: { $nin: inclass.students } },
                { $pull: { inClass: id } }
            );
            // Add the class ID to the inClass array of the updated students
            await User.updateMany(
                { _id: { $in: inclass.students } },
                { $addToSet: { inClass: id } }
            );
        }

        res.status(200).json({ success: true, message: "Class updated" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const deleteInclass = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Class not found" });
    }

    try {
        const inclassToDelete = await Inclass.findById(id);
        if (!inclassToDelete) {
            return res.status(404).json({ success: false, message: "Class not found" });
        }

        await User.updateMany(
            { inClass: id },
            { $pull: { inClass: id } }
        );
        await Cluster.updateMany(
            { inClass: id },
            { $pull: { inClass: id } }
        );

        await Inclass.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: "Class deleted successfully" });
    } catch (error) {
        console.error("Error deleting class:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
