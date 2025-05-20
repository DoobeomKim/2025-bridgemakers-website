import { NextResponse } from 'next/server';
import { instagramService } from '@/lib/instagram';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Instagram configuration is missing' },
        { status: 500 }
      );
    }

    const posts = await instagramService.getFeed(6);
    
    if (!posts || posts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No Instagram posts found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Instagram feed' },
      { status: 500 }
    );
  }
} 