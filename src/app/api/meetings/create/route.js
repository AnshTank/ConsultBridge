import connectDB from '../../../../lib/mongodb';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    await connectDB();
    const { userId, consultancyId, appointmentId, createdBy } = await request.json();
    
    const meetingId = `consultbridge-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const startTime = new Date();
    
    // Update appointment with meeting ID if appointmentId provided
    if (appointmentId && appointmentId !== 'demo-appointment') {
      const db = mongoose.connection.db;
      const appointmentsCollection = db.collection('appointments');
      
      const appointment = await appointmentsCollection.findOne({
        _id: new mongoose.Types.ObjectId(appointmentId)
      });
      
      // Validate appointment ownership
      if (!appointment || appointment.consultancyId !== consultancyId) {
        return Response.json(
          { success: false, error: 'Unauthorized access to appointment' },
          { status: 403 }
        );
      }
      
      await appointmentsCollection.updateOne(
        { _id: new mongoose.Types.ObjectId(appointmentId) },
        { $set: { meetingId, meetingStartedAt: startTime, updatedAt: new Date() } }
      );
    }
    
    return Response.json({
      success: true,
      meetingId,
      meetingUrl: `https://meet.jit.si/${meetingId}`,
      joinUrl: `/meeting/${meetingId}`,
      participants: {
        user: userId || 'demo-user',
        consultant: consultancyId || 'demo-consultant'
      },
      createdAt: startTime.toISOString()
    });
  } catch (error) {
    console.error('Meeting creation error:', error);
    return Response.json(
      { success: false, error: 'Failed to create meeting' },
      { status: 500 }
    );
  }
}