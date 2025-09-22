import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Consultancy from '../../../models/Consultancy';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const sampleConsultancies = [
      {
        name: "TechSolutions Pro",
        rating: 4.8,
        reviews: 156,
        image: "/api/placeholder/300/200",
        category: "Technology",
        description: "Leading IT consulting firm specializing in cloud migration, software development, and digital transformation. We help businesses leverage cutting-edge technology to drive growth and efficiency.",
        location: "Mumbai, Maharashtra",
        expertise: ["Cloud Computing", "Software Development", "Digital Transformation", "Cybersecurity"],
        price: "₹2,500/hr",
        whyChooseUs: [
          "15+ years of industry experience",
          "Certified cloud architects and developers",
          "24/7 technical support",
          "Proven track record with 500+ successful projects"
        ],
        availability: {
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          hours: "9:00 AM - 6:00 PM"
        },
        contact: {
          phone: "+91-9876543210",
          email: "contact@techsolutionspro.com",
          website: "https://techsolutionspro.com",
          password: "hashedpassword123"
        },
        status: "verified",
        verification: {
          emailVerified: true,
          phoneVerified: true
        }
      },
      {
        name: "Digital Innovation Hub",
        rating: 4.6,
        reviews: 89,
        image: "/api/placeholder/300/200",
        category: "Technology",
        description: "Innovative technology consultancy focused on AI, machine learning, and automation solutions. We transform businesses through intelligent technology implementations.",
        location: "Bangalore, Karnataka",
        expertise: ["Artificial Intelligence", "Machine Learning", "Automation", "Data Analytics"],
        price: "₹3,000/hr",
        whyChooseUs: [
          "AI/ML specialists with PhD qualifications",
          "Custom automation solutions",
          "ROI-focused implementations",
          "Post-deployment support and training"
        ],
        availability: {
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          hours: "10:00 AM - 7:00 PM"
        },
        contact: {
          phone: "+91-9876543211",
          email: "info@digitalinnovationhub.com",
          website: "https://digitalinnovationhub.com",
          password: "hashedpassword124"
        },
        status: "verified",
        verification: {
          emailVerified: true,
          phoneVerified: true
        }
      },
      {
        name: "CyberSecure Consultants",
        rating: 4.9,
        reviews: 203,
        image: "/api/placeholder/300/200",
        category: "Technology",
        description: "Premier cybersecurity consulting firm providing comprehensive security assessments, penetration testing, and compliance solutions for enterprises.",
        location: "Delhi, NCR",
        expertise: ["Cybersecurity", "Penetration Testing", "Compliance", "Risk Assessment"],
        price: "₹4,000/hr",
        whyChooseUs: [
          "Certified ethical hackers and security experts",
          "ISO 27001 and SOC 2 compliance specialists",
          "24/7 incident response team",
          "Government and enterprise clientele"
        ],
        availability: {
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          hours: "9:00 AM - 8:00 PM"
        },
        contact: {
          phone: "+91-9876543212",
          email: "security@cybersecureconsultants.com",
          website: "https://cybersecureconsultants.com",
          password: "hashedpassword125"
        },
        status: "verified",
        verification: {
          emailVerified: true,
          phoneVerified: true
        }
      }
    ];

    // Clear existing consultancies
    await Consultancy.deleteMany({});
    
    // Insert sample consultancies
    const result = await Consultancy.insertMany(sampleConsultancies);

    return NextResponse.json({
      success: true,
      message: 'Sample consultancies seeded successfully',
      count: result.length,
      consultancies: result
    });

  } catch (error) {
    console.error('Error seeding consultancies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed consultancies' },
      { status: 500 }
    );
  }
}