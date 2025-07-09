import { NextResponse } from 'next/server';

export async function GET() {
  // Mock consultancy profile data
  const mockProfile = {
    id: "mock-consultancy-1",
    name: "Strategic Business Partners",
    category: "Business Strategy",
    description: "We help businesses scale and optimize their operations through strategic consulting and innovative solutions.",
    location: "New York, NY",
    phone: "+1 (555) 123-4567",
    email: "contact@strategicbp.com",
    price: "$250/session",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60",
    expertise: ["Business Strategy", "Operations Management", "Market Analysis", "Growth Planning"],
    services: ["Strategic Planning", "Business Analysis", "Market Research", "Operational Consulting"],
    problemsSolved: ["Low Revenue Growth", "Operational Inefficiencies", "Market Entry Challenges", "Scaling Issues"],
    availability: {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      hours: "9:00 AM - 6:00 PM"
    }
  };

  return NextResponse.json({ profile: mockProfile });
}