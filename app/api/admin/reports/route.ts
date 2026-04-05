import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'

// GET /api/admin/reports — fetch all reports with listing details
export async function GET() {
  const result = await requireAdmin()
  if (result instanceof NextResponse) return result
  const { supabase } = result

  const { data: reports, error } = await supabase
    .from('reports')
    .select(`
      *,
      listings (
        id,
        title,
        status,
        city,
        user_id
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ reports })
}

// PATCH /api/admin/reports — dismiss or close a listing
export async function PATCH(request: Request) {
  const result = await requireAdmin()
  if (result instanceof NextResponse) return result
  const { supabase, user } = result

  try {
    const { reportId, action, listingId } = await request.json()

    if (!reportId || !action) {
      return NextResponse.json({ error: 'Missing reportId or action' }, { status: 400 })
    }

    const now = new Date().toISOString()

    if (action === 'dismiss') {
      await supabase
        .from('reports')
        .update({ status: 'dismissed', resolved_by: user.id, resolved_at: now })
        .eq('id', reportId)

    } else if (action === 'close_listing') {
      if (!listingId) return NextResponse.json({ error: 'Missing listingId' }, { status: 400 })

      await supabase
        .from('reports')
        .update({ status: 'listing_closed', resolved_by: user.id, resolved_at: now })
        .eq('id', reportId)

      await supabase
        .from('listings')
        .update({ status: 'closed', locked_by_admin: true })
        .eq('id', listingId)

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
