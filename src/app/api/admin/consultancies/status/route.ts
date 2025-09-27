import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Consultancy from '../../../../../models/Consultancy';

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const { consultancyId, status, rejectionReason } = await request.json();
    
    const updateData: any = { status };
    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }
    
    const updatedConsultancy = await Consultancy.findByIdAndUpdate(
      consultancyId,
      updateData,
      { new: true }
    );
    
    if (!updatedConsultancy) {
      return NextResponse.json(
        { success: false, error: 'Consultancy not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      consultancy: updatedConsultancy
    });
    
  } catch (error) {
    console.error('Error updating consultancy status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update status' },
      { status: 500 }
    );
  }
}