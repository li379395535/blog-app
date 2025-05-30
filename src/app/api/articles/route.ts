import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting all articles:', error);
    return NextResponse.json(
      { error: 'Failed to get all articles' },
      { status: 500 }
    );
  }
}