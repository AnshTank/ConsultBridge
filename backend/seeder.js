import mongoose from "mongoose";
import Consultancy from "./models/Consultancy.js";
import connectDB from "./config/db.js";

const sampleConsultancies = [
  {
    name: "CareerGuide",
    category: "Career Consultancy",
    description: "Helping students and professionals find their career path.",
    rating: 4.5,
    location: "Mumbai, India",
    price: "$50/hour",
    __v: 0,
  },
  {
    name: "LegalAid Experts",
    category: "Legal Advisory",
    description: "Expert legal consultation for corporate and personal cases.",
    rating: 4.8,
    location: "Delhi, India",
    price: "$100/hour",
    __v: 0,
  },
  {
    name: "StartupMentors",
    category: "Business Consultancy",
    description: "Business consultation and startup mentorship.",
    rating: 4.6,
    location: "Bangalore, India",
    price: "$75/hour",
    __v: 0,
  },
  {
    name: "HealthWell Consultants",
    category: "Health Consultancy",
    description: "Providing expert health and wellness consultation.",
    rating: 4.7,
    location: "Hyderabad, India",
    price: "$60/hour",
    __v: 0,
  },
  {
    name: "TaxWise Solutions",
    category: "Finance Advisory",
    description: "Financial and tax advisory services.",
    rating: 4.9,
    location: "Pune, India",
    price: "$90/hour",
    __v: 0,
  },
];

const seedDB = async () => {
  await connectDB();
  await Consultancy.deleteMany();
  await Consultancy.insertMany(sampleConsultancies);
  console.log("Sample data added!");
  process.exit();
};

seedDB();
