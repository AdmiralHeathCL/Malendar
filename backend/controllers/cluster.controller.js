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

export const getClusterById = async (req, res) => {
    const { id } = req.params;
  
    try {
      const cluster = await Cluster.findById(id).populate('students');;
      if (!cluster) {
        return res.status(404).json({ success: false, message: 'Class not found' });
      }
  
      res.status(200).json({ success: true, data: cluster });
    } catch (error) {
      console.error("Error in fetching class:", error.message);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  };

export const createCluster = async (req, res) => {
    const {name} = req.body;
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

export const addStudentToCluster = async (req, res) => {
    const { id } = req.params; // Cluster ID
    const { studentId } = req.body; // Student to add
  
    try {
      const cluster = await Cluster.findById(id);
      if (!cluster) {
        return res.status(404).json({ success: false, message: "Cluster not found" });
      }
  
      const student = await User.findById(studentId);
      if (!student) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      // Add student to the cluster's students array if not already present
      if (!cluster.students.includes(studentId)) {
        cluster.students.push(studentId);
        await cluster.save();
  
        // Also update the User model to reflect the student's membership in the cluster
        student.inCluster.push(id);
        await student.save();
  
        return res.status(200).json({ success: true, data: cluster });
      } else {
        return res.status(400).json({ success: false, message: "Student already in cluster" });
      }
    } catch (error) {
      console.error("Error adding student to cluster:", error.message);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };

  export const removeStudentFromCluster = async (req, res) => {
    const { id } = req.params; // Cluster ID
    const { studentId } = req.body; // Student to remove
  
    try {
      const cluster = await Cluster.findById(id);
      if (!cluster) {
        return res.status(404).json({ success: false, message: "Cluster not found" });
      }
  
      // Remove student from the cluster's students array
      if (cluster.students.includes(studentId)) {
        cluster.students.pull(studentId);
        await cluster.save();
  
        // Also update the User model to reflect that the student is no longer in the cluster
        const student = await User.findById(studentId);
        if (student) {
          student.inCluster.pull(id);
          await student.save();
        }
  
        return res.status(200).json({ success: true, data: cluster });
      } else {
        return res.status(400).json({ success: false, message: "Student not in cluster" });
      }
    } catch (error) {
      console.error("Error removing student from cluster:", error.message);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  };
  