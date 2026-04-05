import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  // Deduplication: Check if user already viewed this listing recently
  const cookieName = `v_${id}`
  if (cookieStore.get(cookieName)) {
    return NextResponse.json({ success: true, cached: true })
  }

  // Call the public RPC function (increment_view_count)
  const { error } = await supabase.rpc('increment_view_count', { listing_id: id })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Set cookie for 24 hours
  const response = NextResponse.json({ success: true })
  response.cookies.set(cookieName, '1', { maxAge: 60 * 60 * 24, path: '/' })
  return response
}
