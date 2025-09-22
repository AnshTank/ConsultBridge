export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    // Decode and format category name
    const categoryName = decodeURIComponent(params.category)
      .replace(/-/g, " ")
      .replace(/%26/g, "&")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    const consultanciesCollection = db.collection('consultancies');
    const reviewsCollection = db.collection('reviews');
    
    // Fetch consultancies for specific category with database filtering
    const consultancies = await consultanciesCollection.find({
      $and: [
        { _id: { $exists: true } },
        { name: { $exists: true, $nin: [null, ""] } },
        { category: categoryName }
      ]
    }).toArray();

    // Get review stats for all consultancies in one aggregation query
    const consultancyIds = consultancies.map(c => c._id);
    const reviewStats = await reviewsCollection.aggregate([
      { $match: { consultancyId: { $in: consultancyIds.map(id => id.toString()) } } },
      {
        $group: {
          _id: "$consultancyId",
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" }
        }
      }
    ]).toArray();

    // Create stats lookup map
    const statsMap = reviewStats.reduce((acc, stat) => {
      acc[stat._id] = {
        totalReviews: stat.totalReviews,
        averageRating: Math.round((stat.averageRating || 5.0) * 10) / 10
      };
      return acc;
    }, {} as Record<string, any>);

    // Combine consultancies with their stats
    const consultanciesWithStats = consultancies.map(consultancy => ({
      ...consultancy,
      id: consultancy._id.toString(),
      reviewStats: statsMap[consultancy._id.toString()] || {
        totalReviews: 0,
        averageRating: 5.0
      }
    }));

    const response = NextResponse.json({
      success: true,
      data: consultanciesWithStats,
      category: categoryName,
      count: consultanciesWithStats.length
    });

    // Set cache headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    
    return response;

  } catch (error) {
    console.error('Error in category API:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch consultancies for category'
    }, { status: 500 });
  }
}