import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 });
    }
    
    await connectDB();
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const consultanciesCollection = db.collection('consultancies');
    
    // Find consultancy by email
    const consultancy = await consultanciesCollection.findOne({
      'contact.email': email
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
    console.error('Error fetching consultancy by email:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch consultancy'
    }, { status: 500 });
  }
}