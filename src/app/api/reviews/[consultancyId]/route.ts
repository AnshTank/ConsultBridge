import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Review from '../../../../models/Review';

export async function GET(
  request: NextRequest,
  { params }: { params: { consultancyId: string } }
) {
  try {
    await connectDB();
    
    const reviews = await Review.find({ consultancyId: params.consultancyId })
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: reviews
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}