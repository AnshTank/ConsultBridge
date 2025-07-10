import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import mongoose from 'mongoose';

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const consultanciesCollection = db.collection('consultancies');
    
    const result = await consultanciesCollection.deleteMany({});
    
    return NextResponse.json({
      success: true,
      message: 'All consultancies deleted successfully',
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error clearing consultancies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear consultancies' },
      { status: 500 }
    );
  }
}