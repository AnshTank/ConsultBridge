// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    
    // Get all consultancies with all fields for admin portal
    const consultancies = await consultanciesCollection.find(
      {
        _id: { $exists: true },
        name: { $exists: true, $nin: [null, ""] }
      }
    ).toArray();
    
    const consultanciesWithId = consultancies.map(consultancy => ({
      ...consultancy,
      id: consultancy._id.toString()
    }));
    
    const response = NextResponse.json({ 
      success: true, 
      data: consultanciesWithId,
      consultancies: consultanciesWithId
    });
    
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('Vary', '*');
    response.headers.set('Last-Modified', new Date().toUTCString());
    
    return response;
  } catch (error) {
    console.error('Error in consultancies API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch consultancies'
    }, { status: 500 });
  }
}