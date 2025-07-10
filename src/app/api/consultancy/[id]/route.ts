import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const consultanciesCollection = db.collection('consultancies');
    
    const consultancy = await consultanciesCollection.findOne({
      _id: new mongoose.Types.ObjectId(id)
    });
    
    if (consultancy) {
      return NextResponse.json({ 
        success: true, 
        data: {
          ...consultancy,
          id: consultancy._id.toString()
        }
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Consultancy not found'
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching consultancy:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch consultancy'
    }, { status: 500 });
  }
}