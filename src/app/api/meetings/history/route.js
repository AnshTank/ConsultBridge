import connectDB from '../../../../lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const consultancyId = searchParams.get('consultancyId');
    
    if (!userId && !consultancyId) {
      return Response.json({ error: 'User ID or Consultancy ID required' }, { status: 400 });
    }
    
    const db = mongoose.connection.db;
    const meetingHistoryCollection = db.collection('meetinghistories');
    
    const query = userId ? { clientId: userId } : { consultancyId };
    const meetings = await meetingHistoryCollection
      .find(query)
      .sort({ startedAt: -1 })
      .limit(50)
      .toArray();
    
    return Response.json({ success: true, data: meetings });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch meeting history' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const { meetingId, action, userId, role } = await request.json();
    
    if (action === 'end') {
      const db = mongoose.connection.db;
      const meetingHistoryCollection = db.collection('meetinghistories');
      const appointmentsCollection = db.collection('appointments');
      
      const meeting = await meetingHistoryCollection.findOne({ meetingId });
      if (meeting) {
        const endTime = new Date();
        const duration = Math.round((endTime - meeting.startedAt) / (1000 * 60));
        
        await meetingHistoryCollection.updateOne(
          { _id: meeting._id },
          { $set: { endedAt: endTime, duration, status: 'completed' } }
        );
        
        // Update appointment status
        await appointmentsCollection.updateOne(
          { _id: new mongoose.Types.ObjectId(meeting.appointmentId) },
          { $set: { status: 'completed', meetingEndedAt: endTime, meetingDuration: duration } }
        );
      }
    }
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to update meeting' }, { status: 500 });
  }
}