import express from "express";
import { getInclasses, createInclass, updateInclass, deleteInclass, getInClassByCluster } from "../controllers/inclass.controller.js";

const router = express.Router();

router.get("/", getInclasses);
router.post("/", createInclass);
router.put("/:id", updateInclass);
router.delete("/:id", deleteInclass);
router.get('/cluster/:clusterId', getInClassByCluster);

export default router;