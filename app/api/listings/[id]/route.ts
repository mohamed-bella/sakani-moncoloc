import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  const supabase = await createClient()

  const { data: listingData, error: listingError } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single()

  if (listingError || !listingData) {
    return NextResponse.json({ error: 'إعلان غير موجود' }, { status: 404 })
  }

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch profile separately bypassing RLS since profiles only allow self-view by default
  const supabaseAdmin = await createServiceClient()
  
  // Security Feature: Only expose WhatsApp number via an explicit REVEAL action to prevent scraping
  const profileSelectQuery = 'name, last_seen_at, whatsapp' // We select it but we will filter it before returning
  
  const { data: profileData } = await supabaseAdmin
    .from('profiles')
    .select(profileSelectQuery)
    .eq('id', listingData.user_id)
    .single()

  const hasWhatsApp = !!profileData?.whatsapp
  if (profileData) {
    delete profileData.whatsapp // MASK THE NUMBER
  }

  return NextResponse.json({ 
    listing: { ...listingData, profiles: profileData ? { ...profileData, has_whatsapp: hasWhatsApp } : null } 
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    // Check if listing is locked by admin first, and verify ownership
    const { data: listing, error: checkError } = await supabase
      .from('listings')
      .select('locked_by_admin, user_id')
      .eq('id', id)
      .single()

    if (checkError) throw checkError
    
    // Explicit Authorization Check: block modifying non-authorized listings
    if (listing?.user_id !== user.id) {
       return NextResponse.json({ error: 'غير مصرح لك بتعديل هذا الإعلان' }, { status: 403 })
    }

    if (listing?.locked_by_admin) {
      return NextResponse.json({ error: 'تم إغلاق هذا الإعلان بواسطة الإدارة ولا يمكن تعديله. يرجى التواصل مع الدعم.' }, { status: 403 })
    }

    // Status update is common for PATCH
    const { status } = body
    
    // Check ownership is built into RLS, but we just verify it works
    const { data, error } = await supabase
      .from('listings')
      .update({ status: status === 'closed' ? 'closed' : 'active' })
      .eq('id', id)
      .eq('user_id', user.id) // secondary check alongside RLS
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ listing: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Delete listing (RLS ensures user is owner)
  // Deleting photos from storage is complex here, usually handled via trigger
  // or a server action since fetching the photos first is required.
  // For MVP, we'll try to just delete the listing
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
