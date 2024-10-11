import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import cookieParser from 'cookie-parser';

// import productRoutes from "./routes/product.route.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import clusterRoutes from "./routes/cluster.route.js";
import inclassRoutes from "./routes/inclass.route.js";

dotenv.config(); //Access .env

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// app.use("/api/products", productRoutes);e
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/clusters", clusterRoutes);
app.use("/api/inclasses", inclassRoutes);

app.listen(PORT, () => {
    connectDB();
    console.log('Server started at http://localhost:' + PORT);
});

