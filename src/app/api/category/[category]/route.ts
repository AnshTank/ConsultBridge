import { NextRequest, NextResponse } from 'next/server';
import { consultancyData } from '../../../../../data/consultancyData';

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const category = params.category;
    
    // Convert category-name to category_name format if needed
    const normalizedCategory = category.replace(/-/g, '_');
    
    // Check if this category exists in our data
    if (consultancyData[normalizedCategory]) {
      // Return the consultancies in this category
      const categoryConsultancies = consultancyData[normalizedCategory].map((consultancy, index) => ({
        ...consultancy,
        id: `${normalizedCategory}-${index}`
      }));
      
      return NextResponse.json({ 
        success: true, 
        data: categoryConsultancies
      });
    } else if (consultancyData[category]) {
      // Try with original category name
      const categoryConsultancies = consultancyData[category].map((consultancy, index) => ({
        ...consultancy,
        id: `${category}-${index}`
      }));
      
      return NextResponse.json({ 
        success: true, 
        data: categoryConsultancies
      });
    } else {
      // If category not found, return empty array
      return NextResponse.json({ 
        success: false, 
        error: 'Category not found',
        availableCategories: Object.keys(consultancyData)
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching consultancies by category:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch consultancies by category'
    }, { status: 500 });
  }
}