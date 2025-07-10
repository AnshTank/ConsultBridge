import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const category = decodeURIComponent(params.category);
    
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const consultanciesCollection = db.collection('consultancies');
    
    // Search for consultancies by category (case-insensitive)
    const consultancies = await consultanciesCollection.find({
      category: { $regex: new RegExp(category, 'i') }
    }).toArray();
    
    const consultanciesWithId = consultancies.map(consultancy => ({
      ...consultancy,
      id: consultancy._id.toString()
    }));
    
    return NextResponse.json({ 
      success: true, 
      data: consultanciesWithId
    });
  } catch (error) {
    console.error('Error fetching consultancies by category:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch consultancies by category'
    }, { status: 500 });
  }
}