import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Review from '../../../models/Review';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { consultancyId, userId, user, rating, text } = body;

    const review = new Review({
      consultancyId,
      userId,
      user,
      rating,
      text,
      likes: 0,
      replies: []
    });

    await review.save();

    return NextResponse.json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { reviewId, action, userId, user, text } = body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    if (action === 'like') {
      review.likes = (review.likes || 0) + 1;
    } else if (action === 'unlike') {
      review.likes = Math.max(0, (review.likes || 0) - 1);
    } else if (action === 'reply') {
      const newReply = {
        user,
        userId,
        text,
        createdAt: new Date()
      };
      review.replies.push(newReply);
    }

    await review.save();

    return NextResponse.json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    );
  }
}