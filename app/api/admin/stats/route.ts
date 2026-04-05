import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'

// GET /api/admin/stats — platform-wide statistics
export async function GET() {
  const result = await requireAdmin()
  if (result instanceof NextResponse) return result
  const { supabase } = result

  const [
    { count: totalListings },
    { count: activeListings },
    { count: totalUsers },
    { count: bannedUsers },
    { count: pendingReports },
    { count: totalReports },
  ] = await Promise.all([
    supabase.from('listings').select('*', { count: 'exact', head: true }),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_banned', true),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reports').select('*', { count: 'exact', head: true }),
  ])

  return NextResponse.json({
    stats: {
      totalListings: totalListings ?? 0,
      activeListings: activeListings ?? 0,
      closedListings: (totalListings ?? 0) - (activeListings ?? 0),
      totalUsers: totalUsers ?? 0,
      bannedUsers: bannedUsers ?? 0,
      pendingReports: pendingReports ?? 0,
      totalReports: totalReports ?? 0,
    }
  })
}
