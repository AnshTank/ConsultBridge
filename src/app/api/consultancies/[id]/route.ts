import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Consultancy from '@/models/Consultancy';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    const consultancy = await Consultancy.findById(id);
    
    if (!consultancy) {
      return NextResponse.json(
        { success: false, error: 'Consultancy not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: consultancy
    });
    
  } catch (error) {
    console.error('Error fetching consultancy:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch consultancy' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    const body = await request.json();
    
    const updatedConsultancy = await Consultancy.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!updatedConsultancy) {
      return NextResponse.json(
        { success: false, error: 'Consultancy not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedConsultancy,
      message: 'Consultancy updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating consultancy:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update consultancy' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    const deletedConsultancy = await Consultancy.findByIdAndDelete(id);
    
    if (!deletedConsultancy) {
      return NextResponse.json(
        { success: false, error: 'Consultancy not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Consultancy removed successfully'
    });
    
  } catch (error) {
    console.error('Error deleting consultancy:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete consultancy' },
      { status: 500 }
    );
  }
}