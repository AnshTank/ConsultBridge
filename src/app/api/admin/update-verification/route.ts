import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Consultancy from '@/models/Consultancy';

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const { consultancyId } = await request.json();
    
    const updatedConsultancy = await Consultancy.findByIdAndUpdate(
      consultancyId,
      {
        status: 'pending',
        'verification.emailVerified': true,
        'verification.phoneVerified': true,
        rejectionReason: null
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
      consultancy: updatedConsultancy
    });
    
  } catch (error) {
    console.error('Error updating verification status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update verification status' },
      { status: 500 }
    );
  }
}