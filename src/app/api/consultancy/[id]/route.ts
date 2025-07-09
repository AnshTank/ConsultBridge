import { NextRequest, NextResponse } from 'next/server';
import { consultancyData } from '../../../../../data/consultancyData';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Try to find consultancy by ID in sample data
    let foundConsultancy = null;
    
    // Check each category
    Object.entries(consultancyData).forEach(([category, consultancies]) => {
      // Check each consultancy in the category
      consultancies.forEach((consultancy) => {
        // Check if category matches the ID
        if (consultancy.category.toLowerCase().replace(/\\s+/g, '-') === id.toLowerCase()) {
          foundConsultancy = {
            ...consultancy,
            id: id
          };
        }
      });
    });
    
    if (foundConsultancy) {
      return NextResponse.json({ 
        success: true, 
        data: foundConsultancy
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Consultancy not found'
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching consultancy:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch consultancy'
    }, { status: 500 });
  }
}