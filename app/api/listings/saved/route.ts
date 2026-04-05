import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch saved listings joined with the listings table
  // Using RLS: If a listing is closed (status != active), 
  // it won't be returned unless the user is the owner.
  // This is okay as long as we handle it on the frontend.
  // If we want to show 'Closed' markers for OTHERS' listings, we need a service role.
  const { data, error } = await supabase
    .from('saved_listings')
    .select(`
      id,
      created_at,
      listing:listings (
        id, type, title, description, city, neighborhood, price, gender_preference, photos, status, view_count, created_at, user_id
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const listings = data.map((d: any) => d.listing).filter(Boolean)
  
  // Attach profiles like in the main listing route
  const userIds = [...new Set(listings.map((l: any) => l.user_id))]
  const supabaseAdmin = await createServiceClient()
  const { data: profilesData } = await supabaseAdmin
    .from('profiles')
    .select('id, last_seen_at')
    .in('id', userIds)

  const profilesMap = new Map(profilesData?.map((p: any) => [p.id, p]) || [])

  const enrichedData = listings.map((l: any) => ({
    ...l,
    profiles: profilesMap.get(l.user_id) || null
  }))

  return NextResponse.json({ listings: enrichedData })
}
