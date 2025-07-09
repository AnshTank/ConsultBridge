import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Review from '../../../../../models/Review';

export async function GET(
  request: NextRequest,
  { params }: { params: { consultancyId: string } }
) {
  try {
    await connectDB();
    
    const reviews = await Review.find({ consultancyId: params.consultancyId });
    
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 5.0;

    return NextResponse.json({
      success: true,
      data: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10
      }
    });

  } catch (error) {
    console.error('Error fetching review stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch review stats' },
      { status: 500 }
    );
  }
}