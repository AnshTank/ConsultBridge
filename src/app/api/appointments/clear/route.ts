import { NextRequest } from "next/server";
import connectDB from "../../../../lib/mongodb";
import Appointment from "../../../../models/Appointment";

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    
    // Delete all appointments
    const result = await Appointment.deleteMany({});
    
    return new Response(JSON.stringify({
      success: true,
      message: `Deleted ${result.deletedCount} appointments`,
      deletedCount: result.deletedCount
    }), { status: 200 });
    
  } catch (error) {
    console.error('Error clearing appointments:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to clear appointments'
    }), { status: 500 });
  }
}