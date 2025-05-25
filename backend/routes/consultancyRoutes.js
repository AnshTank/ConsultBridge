import express from "express";
import Consultancy from "../models/Consultancy.js";

const router = express.Router();

// ✅ Get consultancies by category
router.get("/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const consultancies = await Consultancy.find({ category });
    res.json(consultancies);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
