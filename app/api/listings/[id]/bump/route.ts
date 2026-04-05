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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch listing to verify ownership and check cooldown
  const { data: listing, error: fetchError } = await supabase
    .from('listings')
    .select('user_id, bumped_at')
    .eq('id', id)
    .single()

  if (fetchError || !listing) {
    return NextResponse.json({ error: 'إعلان غير موجود' }, { status: 404 })
  }

  if (listing.user_id !== user.id) {
    return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })
  }

  // Check 12-hour cooldown
  if (listing.bumped_at) {
    const lastBumpTime = new Date(listing.bumped_at).getTime()
    const now = new Date().getTime()
    const cooldownHours = 12
    const hoursSinceBump = (now - lastBumpTime) / (1000 * 60 * 60)

    if (hoursSinceBump < cooldownHours) {
      const remainingHours = Math.ceil(cooldownHours - hoursSinceBump)
      return NextResponse.json({ 
        error: `من فضلك انتظر ${remainingHours} ساعات قبل رفع الإعلان مرة أخرى.` 
      }, { status: 429 })
    }
  }

  // Execute Bump
  const { error: updateError } = await supabase
    .from('listings')
    .update({ bumped_at: new Date().toISOString() })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: 'حدث خطأ أثناء التحديث' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
