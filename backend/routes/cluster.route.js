import express from 'express';
import { createCluster, deleteCluster, getClusters, updateCluster, getClusterById } from '../controllers/cluster.controller.js';

const router = express.Router();

router.get("/", getClusters);
router.post("/", createCluster);
router.put("/:id", updateCluster);
router.delete("/:id", deleteCluster);
router.get('/:id', getClusterById);

export default router;