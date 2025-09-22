import { NextRequest } from "next/server";
import connectDB from "../../../../lib/mongodb";
import Appointment from "../../../../models/Appointment";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const userId = searchParams.get('userId');
    
    if (!date || !userId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Date and userId are required' 
      }), { status: 400 });
    }
    
    console.log('=== CONFLICT CHECK DEBUG ===');
    console.log('Input date:', date);
    console.log('User ID:', userId);
    
    // Parse date correctly - handle both YYYY-MM-DD and DD/MM/YYYY formats
    let parsedDate;
    if (date.includes('/')) {
      // Handle DD/MM/YYYY format
      const [day, month, year] = date.split('/');
      parsedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      console.log('Converted DD/MM/YYYY to:', parsedDate);
    } else {
      // Already in YYYY-MM-DD format
      parsedDate = date;
      console.log('Using YYYY-MM-DD format:', parsedDate);
    }
    
    // Create date object for comparison
    const targetDate = new Date(parsedDate + 'T00:00:00.000Z');
    console.log('Target date object:', targetDate);
    
    // Find all appointments for this user
    const allAppointments = await Appointment.find({
      clientId: userId,
      status: { $in: ['pending', 'confirmed'] } // Only active appointments
    });
    
    console.log('All user appointments:', allAppointments.length);
    
    // Filter appointments for the specific date
    const appointments = allAppointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      const aptDateStr = aptDate.toISOString().split('T')[0];
      const targetDateStr = targetDate.toISOString().split('T')[0];
      
      console.log('Comparing:', { aptDateStr, targetDateStr, match: aptDateStr === targetDateStr });
      return aptDateStr === targetDateStr;
    });
    
    console.log('Filtered appointments for date:', appointments.map(apt => ({
      id: apt._id,
      date: apt.appointmentDate,
      time: apt.appointmentTime,
      status: apt.status
    })));
    
    const bookedTimes = appointments.map(apt => {
      let time = apt.appointmentTime;
      const originalTime = time;
      
      // Normalize time format to match frontend format
      if (!time.includes('AM') && !time.includes('PM')) {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        if (hour === 0) {
          time = `12:${minutes} AM`;
        } else if (hour < 12) {
          time = `${hour}:${minutes} AM`;
        } else if (hour === 12) {
          time = `12:${minutes} PM`;
        } else {
          time = `${hour - 12}:${minutes} PM`;
        }
      }
      
      console.log('Time conversion:', { originalTime, normalizedTime: time });
      return time;
    });
    
    console.log('Final booked times:', bookedTimes);
    
    return new Response(JSON.stringify({
      success: true,
      bookedTimes
    }), { status: 200 });
    
  } catch (error) {
    console.error('Error checking appointments:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to check appointments'
    }), { status: 500 });
  }
}