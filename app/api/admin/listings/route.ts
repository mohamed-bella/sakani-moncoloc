import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'

// GET /api/admin/listings — all listings for moderation (any status)
export async function GET(request: Request) {
  const result = await requireAdmin()
  if (result instanceof NextResponse) return result
  const { supabase } = result

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') // 'active' | 'closed' | 'all'
  const city = searchParams.get('city')
  const q = searchParams.get('q')

  let query = supabase
    .from('listings')
    .select(`
      id, type, title, description, city, neighborhood, price,
      gender_preference, photos, status, view_count,
      whatsapp_click_count, created_at, user_id,
      profiles!listings_user_id_fkey (
        name,
        whatsapp,
        is_banned
      )
    `)
    .order('created_at', { ascending: false })
    .limit(200)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  if (city && city !== 'all') {
    query = query.eq('city', city)
  }
  if (q && q.trim()) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
  }

  const { data: listings, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ listings })
}

// PATCH /api/admin/listings — change listing status
export async function PATCH(request: Request) {
  const result = await requireAdmin()
  if (result instanceof NextResponse) return result
  const { supabase } = result

  try {
    const { listingId, action } = await request.json()

    if (!listingId || !action) {
      return NextResponse.json({ error: 'Missing listingId or action' }, { status: 400 })
    }

    if (action === 'close') {
      await supabase.from('listings').update({ status: 'closed', locked_by_admin: true }).eq('id', listingId)
    } else if (action === 'reopen' || action === 'approve') {
      await supabase.from('listings').update({ status: 'active', locked_by_admin: false }).eq('id', listingId)
    } else if (action === 'delete') {
      await supabase.from('listings').delete().eq('id', listingId)
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
