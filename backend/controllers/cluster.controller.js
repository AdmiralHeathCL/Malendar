import Cluster from "../models/cluster.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

export const getClusters = async (req, res) => {
    try {
        const clusters = await Cluster.find({});
        res.status(200).json({ success: true, data: clusters });
    } catch (error) {
        console.log("error in fetching clusters:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const createCluster = async (req, res) => {
    const {name} = req.body
    const cluster = req.body;

    if(!cluster.name) {
        return res.status(400).json({ success: false, message: "Please provide all fields" });
    }

    const existingCluster = await Cluster.findOne({ name });
    if(existingCluster){
        return res.status(400).json({ error: "Cluster already exists" });
    }

    const newCluster = new Cluster(cluster);

    try {
        await newCluster.save();

        if (cluster.students && cluster.students.length > 0) {
            await User.updateMany(
                { _id: { $in: cluster.students } },  
                { $addToSet: { inCluster: newCluster._id } } 
            );
        }

        res.status(201).json({ success: true, data: newCluster });
    } catch (error) {
        console.error("Error in Create cluster:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }

    // Notification

};

export const updateCluster = async (req, res) => {
    const { id } = req.params;
    const cluster = req.body;

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return es.status(404).json({ success: false, message: "Cluster not found" });
    }

    try {
        const updateCluster = await Cluster.findByIdAndUpdate(id, cluster, {new: true});

        if (cluster.students && cluster.students.length > 0) {
            await User.updateMany(
                { inCluster: id, _id: { $nin: cluster.students } },  
                { $pull: { inCluster: id } } 
            );

            await User.updateMany(
                { _id: { $in: cluster.students } },  
                { $addToSet: { inCluster: id } }
            );
        }
        
        res.status(200).json({ success: true, message: "Cluster updated" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const deleteCluster = async (req, res) => {
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return es.status(404).json({ success: false, message: "Cluster not found" });
    }
    
    try {
        const clusterToDelete = await Cluster.findById(id);
        if (!clusterToDelete) {
            return res.status(404).json({ success: false, message: "Cluster not found" });
        }
        await User.updateMany(
            { inCluster: id }, 
            { $pull: { inCluster: id } }
        );

        await Cluster.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Cluster deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const addtoCluster = async (req, res) => {

};

export const removefromCluster = async (req, res) => {
    
};