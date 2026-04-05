import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { listingId } = await request.json()
  if (!listingId) return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 })

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    // Guest User logic using cookies
    let savedIds: string[] = []
    try {
      const existingCookie = cookieStore.get('guest_saved_listings')?.value
      if (existingCookie) savedIds = JSON.parse(existingCookie)
    } catch(e) {}
    
    const isSaved = savedIds.includes(listingId)
    if (isSaved) {
      savedIds = savedIds.filter(id => id !== listingId)
    } else {
      savedIds.push(listingId)
    }
    
    const response = NextResponse.json({ saved: !isSaved })
    // Securely set long-lived browser cookie to remember saved posts
    response.cookies.set('guest_saved_listings', JSON.stringify(savedIds), { maxAge: 60 * 60 * 24 * 365, path: '/' })
    return response
  }

  // Toggle Save Logic
  const { data: existing } = await supabase
    .from('saved_listings')
    .select('id')
    .eq('user_id', user.id)
    .eq('listing_id', listingId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('saved_listings')
      .delete()
      .eq('id', existing.id)
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ saved: false })
  } else {
    const { error } = await supabase
      .from('saved_listings')
      .insert({ user_id: user.id, listing_id: listingId })
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ saved: true })
  }
}

// GET can be used to check if a single listing is saved, but we'll often do that on the client or via a join.
// For simplicity, we can have a check endpoint.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const listingId = searchParams.get('listingId')
  if (!listingId) return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 })

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    // Check locally in cookie
    let savedIds: string[] = []
    try {
      const existingCookie = cookieStore.get('guest_saved_listings')?.value
      if (existingCookie) savedIds = JSON.parse(existingCookie)
    } catch(e) {}
    return NextResponse.json({ isSaved: savedIds.includes(listingId) })
  }

  const { data } = await supabase
    .from('saved_listings')
    .select('id')
    .eq('user_id', user.id)
    .eq('listing_id', listingId)
    .maybeSingle()

  return NextResponse.json({ isSaved: !!data })
}
