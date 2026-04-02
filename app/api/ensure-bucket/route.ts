import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Use service role key to manage storage policies
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const photosExists = buckets?.some((b) => b.name === 'PHOTOS')

    if (!photosExists) {
      await supabase.storage.createBucket('PHOTOS', {
        public: true,
        fileSizeLimit: 20 * 1024 * 1024,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
