import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting an article:', error);
    return NextResponse.json(
      { error: 'Failed to get an article' },
      { status: 500 }
    );
  }
}