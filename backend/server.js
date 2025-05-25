import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import consultancyRoutes from "./routes/consultancyRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

const PORT = 5000;
app.use("/api/consultancies", consultancyRoutes);
// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/consultancyDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// app.use("/api", consultancyRoutes);
