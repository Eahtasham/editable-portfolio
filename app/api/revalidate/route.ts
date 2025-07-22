// app/api/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    // Check for secret to confirm this is a valid request
    const secret = request.nextUrl.searchParams.get('secret');
    
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Get the path to revalidate from the request body
    const body = await request.json().catch(() => ({}));
    const path = body.path || '/';
    
    // This will clear the cache and regenerate the page
    revalidatePath(path);
    
    return NextResponse.json({ 
      revalidated: true, 
      path,
      timestamp: new Date().toISOString() 
    });
  } catch (err) {
    return NextResponse.json({ 
      message: 'Error revalidating',
      error: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Optional: Allow GET requests with query params
export async function GET(request: NextRequest) {
  try {
    const secret = request.nextUrl.searchParams.get('secret');
    const path = request.nextUrl.searchParams.get('path') || '/';
    
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    revalidatePath(path);
    
    return NextResponse.json({ 
      revalidated: true, 
      path,
      timestamp: new Date().toISOString() 
    });
  } catch (err) {
    return NextResponse.json({ 
      message: 'Error revalidating',
      error: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}