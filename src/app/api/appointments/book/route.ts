import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/mongodb";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    const appointmentData = await request.json();

    await connectDB();

    const db = mongoose.connection.db;
    const appointmentsCollection = db.collection("appointments");
    const consultanciesCollection = db.collection("consultancies");

    // Fetch consultancy name
    let consultancyName = "Unknown Consultancy";
    if (appointmentData.consultancyId) {
      const consultancy = await consultanciesCollection.findOne({
        _id: new mongoose.Types.ObjectId(appointmentData.consultancyId),
      });
      if (consultancy) {
        consultancyName = consultancy.name;
      }
    }

    // Add timestamps, default status, and consultancy info
    const appointment = {
      ...appointmentData,
      consultancyName: consultancyName,
      appointmentType: appointmentData.appointmentType || "online", // default to online
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("Booking appointment with data:", appointment);

    const result = await appointmentsCollection.insertOne(appointment);
    console.log("Insert result:", result);

    if (result.insertedId) {
      return NextResponse.json({
        success: true,
        message: "Appointment booked successfully",
        appointmentId: result.insertedId.toString(),
      });
    } else {
      throw new Error("Failed to insert appointment");
    }
  } catch (error) {
    console.error("Error booking appointment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to book appointment",
      },
      { status: 500 }
    );
  }
}
