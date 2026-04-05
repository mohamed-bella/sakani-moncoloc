import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { ListingSchema } from '@/lib/validations'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city')
  const type = searchParams.get('type')
  const gender = searchParams.get('genderPreference')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const q = searchParams.get('q')
  const neighborhood = searchParams.get('neighborhood')
  
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  let query = supabase
    .from('listings')
    .select('id, type, title, description, city, neighborhood, price, gender_preference, photos, status, view_count, created_at, user_id, bumped_at, tags')
    .eq('status', 'active')
    .order('bumped_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (city && city !== 'all') {
    query = query.eq('city', city)
  }
  if (neighborhood && neighborhood !== 'all') {
    query = query.eq('neighborhood', neighborhood)
  }
  if (type && type !== 'all') {
    query = query.eq('type', type)
  }
  if (gender && gender !== 'all') {
    query = query.eq('gender_preference', gender)
  }
  
  if (minPrice && parseInt(minPrice) > 0) {
    query = query.gte('price', parseInt(minPrice))
  }
  if (maxPrice && parseInt(maxPrice) > 0) {
    query = query.lte('price', parseInt(maxPrice))
  }
  
  if (q && q.trim().length > 0) {
    // websearch config allows for more natural search terms
    query = query.textSearch('fts', q, { config: 'simple', type: 'websearch' })
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Admin Side-load to attach host activity safely without exposing personal profiles
  const userIds = [...new Set(data.map((l: any) => l.user_id))]
  const supabaseAdmin = await createServiceClient()
  const { data: profilesData } = await supabaseAdmin
    .from('profiles')
    .select('id, last_seen_at')
    .in('id', userIds)

  const profilesMap = new Map(profilesData?.map((p: any) => [p.id, p]) || [])

  const enrichedData = data.map((l: any) => {
    // We don't want to expose user_id in public API responses if not needed,
    // but the frontend uses it, so we leave it. Or we just attach profiles.
    return {
      ...l,
      profiles: profilesMap.get(l.user_id) || null
    }
  })

  return NextResponse.json({ listings: enrichedData })
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  // If user exists, do integrity/ban/spam checks. If guest, skip these.
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, is_banned')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile) {
      return NextResponse.json({ error: 'لم يتم العثور على ملف شخصي.' }, { status: 403 })
    }

    if (profile.is_banned) {
      return NextResponse.json({ error: 'تم تعليق حسابك. لا يمكنك نشر إعلانات.' }, { status: 403 })
    }

    const { data: recentListings } = await supabase
      .from('listings')
      .select('created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3)

    if (recentListings && recentListings.length > 0) {
      const lastPostTime = new Date(recentListings[0].created_at).getTime()
      const now = new Date().getTime()
      const cooldownMinutes = 10 
      
      if (now - lastPostTime < cooldownMinutes * 60 * 1000) {
        return NextResponse.json({ error: `من فضلك انتظر ${cooldownMinutes} دقائق قبل نشر إعلان آخر لحماية المجتمع من السبام.` }, { status: 429 })
      }

      const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000
      const dailyPosts = recentListings.filter(l => new Date(l.created_at).getTime() > twentyFourHoursAgo)
      if (dailyPosts.length >= 3) {
        return NextResponse.json({ error: 'لقد وصلت للحد الأقصى للنشر المسموح به اليوم (3 إعلانات كل 24 ساعة).' }, { status: 429 })
      }
    }
  }

  try {
    const body = await request.json()
    const validData = ListingSchema.parse(body)
    
    const photos = Array.isArray(body.photos) ? body.photos : []

    // Use admin client to bypass RLS since guests have no valid session user_id
    const supabaseAdmin = await createServiceClient()
    
    // Default guest poster id is null
    const posterId = user ? user.id : null

    const { data, error } = await supabaseAdmin
      .from('listings')
      .insert({
        user_id: posterId,
        ...validData,
        photos,
        status: 'active',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ listing: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
