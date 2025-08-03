import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('Login attempt for email:', email);
    
    await connectDB();
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const consultanciesCollection = db.collection('consultancies');
    
    // Find consultancy with matching email
    const consultancy = await consultanciesCollection.findOne({
      'contact.email': email
    });
    
    console.log('Consultancy found:', consultancy ? 'Yes' : 'No');
    
    if (!consultancy) {
      return NextResponse.json({
        success: false,
        error: 'No consultancy found with this email'
      }, { status: 401 });
    }
    
    console.log('Stored password:', consultancy.contact.password);
    console.log('Provided password:', password);
    
    // Check password
    if (consultancy.contact.password !== password) {
      return NextResponse.json({
        success: false,
        error: 'Incorrect password'
      }, { status: 401 });
    }
    
    // Check if consultancy is verified
    const isVerified = consultancy.status === 'verified';
    const emailVerified = consultancy.verification?.emailVerified || false;
    const phoneVerified = consultancy.verification?.phoneVerified || false;
    
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      consultancyId: consultancy._id.toString(),
      verified: isVerified,
      consultancy: {
        name: consultancy.name,
        email: consultancy.contact.email,
        category: consultancy.category,
        status: consultancy.status,
        emailVerified,
        phoneVerified,
        rejectionReason: consultancy.rejectionReason,
        needsVerification: consultancy.rejectionReason && consultancy.rejectionReason.includes('Please verify your phone number and email address to resubmit your application')
      }
    });
  } catch (error) {
    console.error('Error logging in consultancy:', error);
    return NextResponse.json({
      success: false,
      error: 'Login failed'
    }, { status: 500 });
  }
}