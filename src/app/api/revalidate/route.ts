import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    // Revalidate all consultancy related paths
    revalidatePath('/consultancies');
    revalidatePath('/categories');
    revalidatePath('/consultancy/[id]', 'page');
    revalidatePath('/category/[category]', 'page');
    
    // Revalidate tags
    revalidateTag('consultancies');
    revalidateTag('consultancy');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cache revalidated' 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to revalidate cache' 
    }, { status: 500 });
  }
}