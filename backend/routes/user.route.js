import express from "express";
import { getallUsers, getAdmins, getTeachers, getStudents } from "../controllers/user.controller.js";

const router = express.Router();

router.get('/all', getallUsers);
router.get('/admins', getAdmins);
router.get('/teachers', getTeachers); 
router.get('/students', getStudents); 

export default router;