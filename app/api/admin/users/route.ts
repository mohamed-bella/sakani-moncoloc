import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { createServiceClient } from '@/lib/supabase/server'

// GET /api/admin/users — all registered users
export async function GET(request: Request) {
  const result = await requireAdmin()
  if (result instanceof NextResponse) return result

  // Use service client to read all profiles (bypasses RLS for admin use)
  const supabase = await createServiceClient()

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  let query = supabase
    .from('profiles')
    .select('id, name, whatsapp, is_admin, is_banned, ban_reason, created_at')
    .order('created_at', { ascending: false })
    .limit(500)

  if (q && q.trim()) {
    query = query.or(`name.ilike.%${q}%,whatsapp.ilike.%${q}%`)
  }

  const { data: users, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Also count listings per user
  const { data: listingCounts } = await supabase
    .from('listings')
    .select('user_id')

  const countMap: Record<string, number> = {}
  listingCounts?.forEach(l => {
    countMap[l.user_id] = (countMap[l.user_id] || 0) + 1
  })

  const enriched = users?.map(u => ({
    ...u,
    listing_count: countMap[u.id] || 0,
  }))

  return NextResponse.json({ users: enriched })
}

// PATCH /api/admin/users — ban/unban/promote user
export async function PATCH(request: Request) {
  const result = await requireAdmin()
  if (result instanceof NextResponse) return result
  const { user: adminUser } = result

  // Use service client to bypass RLS for admin operations
  const supabase = await createServiceClient()

  try {
    const { userId, action, reason } = await request.json()

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing userId or action' }, { status: 400 })
    }

    // Safety: admin cannot ban themselves
    if (userId === adminUser.id) {
      return NextResponse.json({ error: 'Admins cannot modify their own account' }, { status: 400 })
    }

    if (action === 'ban') {
      await supabase
        .from('profiles')
        .update({ is_banned: true, ban_reason: reason || 'انتهاك شروط الاستخدام' })
        .eq('id', userId)

    } else if (action === 'unban') {
      await supabase
        .from('profiles')
        .update({ is_banned: false, ban_reason: null })
        .eq('id', userId)

    } else if (action === 'promote') {
      await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', userId)

    } else if (action === 'demote') {
      await supabase
        .from('profiles')
        .update({ is_admin: false })
        .eq('id', userId)

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
