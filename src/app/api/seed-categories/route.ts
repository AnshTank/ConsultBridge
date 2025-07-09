import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Category from '../../../models/Category';
import { createSlug } from '../../../utils/urlUtils';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const categoriesData = [
      {
        name: "Career Consultation",
        description: "Personalized career advice to help you achieve success in your field.",
        emoji: "📖"
      },
      {
        name: "Legal Advisory",
        description: "Expert legal guidance for contracts, compliance, and corporate law.",
        emoji: "⚖️"
      },
      {
        name: "Business Strategy",
        description: "Innovative strategies for scaling and optimizing your business operations.",
        emoji: "📈"
      },
      {
        name: "Health & Wellness",
        description: "Comprehensive mental & physical well-being programs for a balanced life.",
        emoji: "💆"
      },
      {
        name: "Technology",
        description: "Expert solutions for IT consulting, software development, and cloud integration.",
        emoji: "💻"
      },
      {
        name: "Real Estate & Housing",
        description: "Insights into property investment, home buying, and rental solutions.",
        emoji: "🏡"
      },
      {
        name: "Financial Services",
        description: "Tailored financial planning, investment advice, and wealth management.",
        emoji: "💰"
      },
      {
        name: "Lifestyle & Personal Growth",
        description: "Coaching and guidance for self-improvement and personal development.",
        emoji: "🌟"
      },
      {
        name: "Travel & Hospitality",
        description: "Exclusive travel planning, hotel bookings, and vacation packages.",
        emoji: "✈️"
      },
      {
        name: "Miscellaneous",
        description: "Other unique consulting services tailored to your needs.",
        emoji: "🔍"
      }
    ];

    await Category.deleteMany({});
    
    const categoriesWithSlugs = categoriesData.map(cat => ({
      ...cat,
      slug: createSlug(cat.name)
    }));

    const result = await Category.insertMany(categoriesWithSlugs);

    return NextResponse.json({
      success: true,
      message: 'Categories seeded successfully',
      count: result.length
    });

  } catch (error) {
    console.error('Error seeding categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed categories' },
      { status: 500 }
    );
  }
}