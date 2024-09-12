import express from "express";
import { getInclasses, createInclass, updateInclass, deleteInclass } from "../controllers/inclass.controller.js";

const router = express.Router();

router.get("/", getInclasses);
router.post("/", createInclass);
router.put("/:id", updateInclass);
router.delete("/:id", deleteInclass);

export default router;