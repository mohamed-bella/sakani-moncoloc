import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = await createServiceClient()
    
    // Fetch all active listings' cities and neighborhoods
    const { data, error } = await supabaseAdmin
      .from('listings')
      .select('city, neighborhood')
      .eq('status', 'active')

    if (error) {
      throw error
    }

    // Aggregate counts and neighborhoods
    const counts: Record<string, number> = {};
    const neighborhoods: Record<string, Set<string>> = {};
    
    for (const row of data || []) {
      if (row.city) {
        counts[row.city] = (counts[row.city] || 0) + 1;
        
        if (row.neighborhood) {
          if (!neighborhoods[row.city]) {
            neighborhoods[row.city] = new Set();
          }
          neighborhoods[row.city].add(row.neighborhood);
        }
      }
    }

    const neighborhoodsArray: Record<string, string[]> = {};
    for (const city in neighborhoods) {
      neighborhoodsArray[city] = Array.from(neighborhoods[city]);
    }

    return NextResponse.json({ counts, neighborhoods: neighborhoodsArray })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
