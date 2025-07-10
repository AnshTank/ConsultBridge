import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    const consultancyData = await request.json();
    
    await connectDB();
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const consultanciesCollection = db.collection('consultancies');
    
    // Check if consultancy with this email already exists
    const existingConsultancy = await consultanciesCollection.findOne({
      'contact.email': consultancyData.contact.email
    });
    
    if (existingConsultancy) {
      return NextResponse.json({
        success: false,
        error: 'A consultancy with this email already exists'
      }, { status: 400 });
    }
    
    // Add timestamps
    consultancyData.createdAt = new Date();
    consultancyData.updatedAt = new Date();
    
    // Insert the new consultancy
    const result = await consultanciesCollection.insertOne(consultancyData);
    
    return NextResponse.json({
      success: true,
      message: 'Consultancy registered successfully',
      consultancyId: result.insertedId.toString()
    });
  } catch (error) {
    console.error('Error registering consultancy:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to register consultancy'
    }, { status: 500 });
  }
}