import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  try {
    const { category, details } = await request.json()

    const { error } = await supabase
      .from('reports')
      .insert({
        listing_id: id,
        user_id: user?.id || null,
        category,
        details,
        status: 'pending'
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err.message && err.message.includes('Rate limit exceeded')) {
      return NextResponse.json({ error: err.message }, { status: 429 })
    }
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
