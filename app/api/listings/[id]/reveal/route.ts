import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { buildWhatsAppUrl } from '@/lib/utils'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Authenticated check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'يجب تسجيل الدخول لإظهار رقم التواصل' }, { status: 401 })

  // 2. Insert into reveals table which handles rate limiting via trigger
  const { error: revealError } = await supabase
    .from('contact_reveals')
    .insert({ user_id: user.id, listing_id: id })

  if (revealError) {
    if (revealError.message.includes('Rate limit exceeded')) {
      return NextResponse.json({ error: revealError.message }, { status: 429 })
    }
    return NextResponse.json({ error: 'فشل في إظهار رقم التواصل' }, { status: 500 })
  }

  // 3. Get the listing owner's specific number for this ad
  const { data: listing } = await supabase
    .from('listings')
    .select('user_id, title, whatsapp_number')
    .eq('id', id)
    .single()

  if (!listing) return NextResponse.json({ error: 'الإعلان غير موجود' }, { status: 404 })

  let targetNumber = listing.whatsapp_number

  if (!targetNumber) {
    // Fallback to profile whatsapp for older listings
    const supabaseAdmin = await createServiceClient()
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('whatsapp')
      .eq('id', listing.user_id)
      .single()
      
    targetNumber = profile?.whatsapp
  }

  if (!targetNumber) return NextResponse.json({ error: 'لم يتم العثور على رقم تواصل' }, { status: 404 })

  const url = buildWhatsAppUrl(targetNumber, listing.title)
  return NextResponse.json({ url })
}
