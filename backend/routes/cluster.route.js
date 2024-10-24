import express from 'express';
import { createCluster, deleteCluster, getClusters, updateCluster, getClusterById, addStudentToCluster, removeStudentFromCluster } from '../controllers/cluster.controller.js';

const router = express.Router();

router.get("/", getClusters);
router.post("/", createCluster);
router.put("/:id", updateCluster);
router.delete("/:id", deleteCluster);
router.get('/:id', getClusterById);

router.put('/:id/addStudent', addStudentToCluster);
router.put('/:id/removeStudent', removeStudentFromCluster);

export default router;