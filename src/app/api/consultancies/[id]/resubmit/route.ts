import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Consultancy from '@/models/Consultancy';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    // Update consultancy status to pending and clear rejection reason
    const updatedConsultancy = await Consultancy.findByIdAndUpdate(
      id,
      {
        status: 'pending',
        rejectionReason: undefined
      },
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
      message: 'Consultancy resubmitted for verification successfully'
    });
    
  } catch (error) {
    console.error('Error resubmitting consultancy:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resubmit consultancy' },
      { status: 500 }
    );
  }
}