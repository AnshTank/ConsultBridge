import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '../../../../lib/mongodb';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    const appointmentId = params.id;

    await connectDB();

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const appointmentsCollection = db.collection('appointments');

    const result = await appointmentsCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(appointmentId) },
      { 
        $set: { 
          status: status,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    const appointmentId = params.id;

    console.log('PATCH - Appointment ID:', appointmentId, 'Updates:', updates);

    await connectDB();

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const appointmentsCollection = db.collection('appointments');

    // Try to find appointment first
    const existingAppointment = await appointmentsCollection.findOne({
      _id: new mongoose.Types.ObjectId(appointmentId)
    });
    
    console.log('Existing appointment:', existingAppointment);

    if (!existingAppointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    const result = await appointmentsCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(appointmentId) },
      { $set: { ...updates, updatedAt: new Date() } }
    );

    console.log('Update result:', result);

    return NextResponse.json({ 
      success: true, 
      message: 'Appointment updated successfully' 
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id;

    await connectDB();

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const appointmentsCollection = db.collection('appointments');

    const result = await appointmentsCollection.deleteOne(
      { _id: new mongoose.Types.ObjectId(appointmentId) }
    );

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}