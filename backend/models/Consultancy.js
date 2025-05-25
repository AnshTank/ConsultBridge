import mongoose from "mongoose";

const ConsultancySchema = new mongoose.Schema({
  name: String,
  category: String,
  description: String,
  rating: Number,
  location: String,
  price: String,
});

const Consultancy = mongoose.model("Consultancy", ConsultancySchema);
export default Consultancy;
