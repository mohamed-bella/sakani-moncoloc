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

  let listings = []

  if (!user) {
    // 1) Guest path: read from cookies
    let savedIds: string[] = []
    try {
      const existingCookie = cookieStore.get('guest_saved_listings')?.value
      if (existingCookie) savedIds = JSON.parse(existingCookie)
    } catch(e) {}

    if (savedIds.length === 0) {
      return NextResponse.json({ listings: [] })
    }

    const { data: rawListings, error } = await supabase
      .from('listings')
      .select('id, type, title, description, city, neighborhood, price, gender_preference, photos, status, view_count, created_at, user_id')
      .in('id', savedIds)
      .eq('status', 'active')
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    listings = rawListings

  } else {
    // 2) Authenticated path: Join saved_listings with listings
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
    listings = data.map((d: any) => d.listing).filter(Boolean)
  }
  
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
