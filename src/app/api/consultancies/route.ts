import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const consultanciesCollection = db.collection('consultancies');
    
    const consultancies = await consultanciesCollection.find({}).toArray();
    
    const consultanciesWithId = consultancies.map(consultancy => ({
      ...consultancy,
      id: consultancy._id.toString()
    }));
    
    return NextResponse.json({ 
      success: true, 
      data: consultanciesWithId
    });
  } catch (error) {
    console.error('Error in consultancies API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch consultancies'
    }, { status: 500 });
  }
}