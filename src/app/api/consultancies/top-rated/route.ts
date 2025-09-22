export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const consultanciesCollection = db.collection('consultancies');
    
    // Optimized aggregation pipeline to get top-rated consultancies
    const topRatedConsultancies = await consultanciesCollection.aggregate([
      // Match valid consultancies
      {
        $match: {
          _id: { $exists: true },
          name: { $exists: true, $nin: [null, ""] }
        }
      },
      // Add consultancy ID as string for lookup
      {
        $addFields: {
          consultancyIdStr: { $toString: "$_id" }
        }
      },
      // Lookup reviews and calculate average rating
      {
        $lookup: {
          from: "reviews",
          localField: "consultancyIdStr",
          foreignField: "consultancyId",
          as: "reviews"
        }
      },
      // Calculate rating statistics with weighted scoring
      {
        $addFields: {
          reviewCount: { $size: "$reviews" },
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: "$reviews" }, 0] },
              then: { $avg: "$reviews.rating" },
              else: 0
            }
          },
          // Weighted score: prioritize consultancies with reviews
          weightedScore: {
            $cond: {
              if: { $gt: [{ $size: "$reviews" }, 0] },
              then: {
                $add: [
                  { $avg: "$reviews.rating" },
                  { $multiply: [{ $size: "$reviews" }, 0.1] }
                ]
              },
              else: 0
            }
          }
        }
      },
      // Filter out consultancies with no reviews
      {
        $match: {
          reviewCount: { $gt: 0 }
        }
      },
      // Sort by weighted score (desc) then by review count (desc)
      {
        $sort: {
          weightedScore: -1,
          reviewCount: -1,
          averageRating: -1
        }
      },
      // Limit to top 3
      { $limit: 3 },
      // Project final fields
      {
        $project: {
          _id: 1,
          name: 1,
          category: 1,
          description: 1,
          image: 1,
          rating: { $round: ["$averageRating", 1] },
          reviews: "$reviewCount",
          id: { $toString: "$_id" }
        }
      }
    ]).toArray();

    const response = NextResponse.json({
      success: true,
      data: topRatedConsultancies,
      count: topRatedConsultancies.length
    });

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    
    return response;

  } catch (error) {
    console.error('Error fetching top-rated consultancies:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch top-rated consultancies'
    }, { status: 500 });
  }
}