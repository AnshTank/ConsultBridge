import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Feedback from '../../../models/Feedback';

export async function POST(request: NextRequest) {
  try {
    const feedbackData = await request.json();

    // Validate required fields
    const { name, email, userType, topic, rating, feedback } = feedbackData;
    
    if (!name || !email || !userType || !topic || !rating || !feedback) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Create new feedback entry
    const newFeedback = new Feedback({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      userType,
      topic: topic.trim(),
      category: feedbackData.category || 'General',
      priority: feedbackData.priority || 'Medium',
      rating,
      feedback: feedback.trim()
    });

    await newFeedback.save();

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedbackId: newFeedback._id.toString()
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}