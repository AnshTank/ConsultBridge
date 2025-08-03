import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { email } = await request.json();
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const consultanciesCollection = db.collection('consultancies');
    
    const consultancy = await consultanciesCollection.findOne({
      'contact.email': email
    });
    
    if (!consultancy) {
      return NextResponse.json({
        success: false,
        error: 'Oops! Wrong email address. No consultancy found with this email. Please double-check your email or register a new consultancy.'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        name: consultancy.name,
        status: consultancy.status || 'pending',
        rejectionReason: consultancy.rejectionReason,
        emailVerified: consultancy.verification?.emailVerified || false,
        phoneVerified: consultancy.verification?.phoneVerified || false
      }
    });
    
  } catch (error) {
    console.error('Error checking status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check status'
    }, { status: 500 });
  }
}