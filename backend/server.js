import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import cookieParser from 'cookie-parser';
import path from "path";

// import productRoutes from "./routes/product.route.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import clusterRoutes from "./routes/cluster.route.js";
import inclassRoutes from "./routes/inclass.route.js";

dotenv.config(); //Access .env

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// app.use("/api/products", productRoutes);e
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/clusters", clusterRoutes);
app.use("/api/inclasses", inclassRoutes);

const staticPath = path.join(__dirname, "/frontend/dist");
console.log("Serving static files from:", staticPath);
app.use(express.static(staticPath));

if(process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/frontend/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});

