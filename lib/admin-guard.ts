import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Verifies the requester is an authenticated admin.
 * Uses security-definer RPC functions to avoid RLS infinite recursion.
 * Returns { supabase, user } on success, or a NextResponse error.
 */
export async function requireAdmin() {
  const supabase = await createClient()

  // 1. Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Check is_banned via security-definer RPC (avoids RLS recursion)
  const { data: banned } = await supabase.rpc('is_banned')
  if (banned) {
    return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
  }

  // 3. Check is_admin via security-definer RPC
  const { data: admin } = await supabase.rpc('is_admin')
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden — Admin access required' }, { status: 403 })
  }

  return { supabase, user }
}
