// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '../../../../lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const consultancyId = params.id;
    await connectDB();

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const consultanciesCollection = db.collection('consultancies');

    const consultancy = await consultanciesCollection.findOne({
      _id: new mongoose.Types.ObjectId(consultancyId)
    });

    if (!consultancy) {
      return NextResponse.json(
        { success: false, error: 'Consultancy not found' },
        { status: 404 }
      );
    }

    const response = NextResponse.json({ success: true, data: consultancy });
    
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    return response;
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
    const consultancyId = params.id;
    const updateData = await request.json();

    console.log('Updating consultancy:', consultancyId);
    console.log('Update data:', updateData);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(consultancyId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid consultancy ID' },
        { status: 400 }
      );
    }

    await connectDB();

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const consultanciesCollection = db.collection('consultancies');

    const result = await consultanciesCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(consultancyId) },
      { 
        $set: { 
          ...updateData,
          updatedAt: new Date()
        } 
      }
    );

    console.log('Update result:', result);

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Consultancy not found' },
        { status: 404 }
      );
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'No changes made' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating consultancy:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update consultancy' },
      { status: 500 }
    );
  }
}