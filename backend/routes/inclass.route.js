import express from "express";
import { getInclasses, createInclass, updateInclass, deleteInclass, getInClassByCluster, getInClassByDate, deleteClassesByDate } from "../controllers/inclass.controller.js";

const router = express.Router();

router.get("/", getInclasses);
router.post("/", createInclass);
router.put("/:id", updateInclass);
router.delete("/:id", deleteInclass);
router.get('/cluster/:clusterId', getInClassByCluster);
router.get("/date/:date", getInClassByDate); 
router.delete("/date/:date", deleteClassesByDate);

export default router;