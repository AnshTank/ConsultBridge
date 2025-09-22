import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    const appointmentData = await request.json();
    console.log('Received appointment data:', appointmentData);

    await connectDB();
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const appointmentsCollection = db.collection("appointments");
    const consultanciesCollection = db.collection("consultancies");

    // Fetch consultancy name
    let consultancyName = "Unknown Consultancy";
    if (appointmentData.consultancyId) {
      try {
        const consultancy = await consultanciesCollection.findOne({
          _id: new mongoose.Types.ObjectId(appointmentData.consultancyId),
        });
        if (consultancy) {
          consultancyName = consultancy.name;
        }
      } catch (err) {
        console.log('Error fetching consultancy name:', err instanceof Error ? err.message : String(err));
      }
    }

    // Add timestamps, default status, and consultancy info
    const appointment = {
      ...appointmentData,
      consultancyName: consultancyName,
      appointmentType: appointmentData.appointmentType || "online",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("Inserting appointment:", appointment);

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
        error: error instanceof Error ? error.message : "Failed to book appointment",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const consultancyId = searchParams.get('consultancyId');
    const userId = searchParams.get('userId');
    const clientId = searchParams.get('clientId');
    
    if (!consultancyId && !userId && !clientId) {
      return NextResponse.json({
        success: false,
        error: 'Either consultancyId, userId, or clientId is required'
      }, { status: 400 });
    }
    
    await connectDB();
    
    // Update expired appointments first
    const { AppointmentStatusUpdater } = await import('../../../services/appointmentStatusUpdater');
    await AppointmentStatusUpdater.updateExpiredAppointments();
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const appointmentsCollection = db.collection('appointments');
    
    // Find appointments based on the parameter provided
    let query = {};
    if (consultancyId) {
      query = { consultancyId: consultancyId };
    } else if (userId) {
      query = { clientId: userId }; // Use clientId field in database
    } else if (clientId) {
      query = { clientId: clientId };
    }
    
    const appointments = await appointmentsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch appointments'
    }, { status: 500 });
  }
}