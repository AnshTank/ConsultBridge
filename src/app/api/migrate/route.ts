import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Consultancy from '@/models/Consultancy';

export async function POST() {
  try {
    await dbConnect();
    
    // Update all consultancies that don't have status or verification fields
    const result = await Consultancy.updateMany(
      {
        $or: [
          { status: { $exists: false } },
          { verification: { $exists: false } }
        ]
      },
      {
        $set: {
          status: 'pending',
          verification: {
            emailVerified: false,
            phoneVerified: false
          }
        }
      }
    );

    // Get updated count
    const totalCount = await Consultancy.countDocuments();
    const pendingCount = await Consultancy.countDocuments({ status: 'pending' });

    return NextResponse.json({
      success: true,
      message: `Migration completed. Updated ${result.modifiedCount} consultancies.`,
      stats: {
        total: totalCount,
        pending: pendingCount,
        modified: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { success: false, error: 'Migration failed' },
      { status: 500 }
    );
  }
}