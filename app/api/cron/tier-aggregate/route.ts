import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { refreshAllCommunitySnapshots } from '@/lib/community-tier'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerSupabase()

  try {
    await refreshAllCommunitySnapshots(supabase)
    return NextResponse.json({ ok: true, refreshedAt: new Date().toISOString() })
  } catch (err) {
    console.error('[cron/tier-aggregate]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
