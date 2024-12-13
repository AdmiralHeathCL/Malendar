import express from "express";
import { getMe, login, logout, signup, remove, removeUserById } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/me", protectRoute, getMe);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.delete("/remove", protectRoute, remove);
router.delete("/users/:id", protectRoute, removeUserById);


export default router;