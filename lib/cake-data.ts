import { unstable_cache } from 'next/cache'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export const getCakeEvents = unstable_cache(
  async () => {
    const result = await db.execute(sql`SELECT id, cake_date, person_name, notes FROM cake_events ORDER BY cake_date ASC, created_at ASC`)
    return result.rows as { id: string; cake_date: string; person_name: string; notes: string | null }[]
  },
  ['cake-events'],
  { revalidate: 30, tags: ['cake-events'] },
)

export const getCakeSuggestions = unstable_cache(
  async () => {
    const result = await db.execute(sql`SELECT id, cake_date, person_name, reason, status, created_at FROM cake_suggestions ORDER BY created_at DESC`)
    return result.rows as { id: string; cake_date: string; person_name: string; reason: string; status: string; created_at: string }[]
  },
  ['cake-suggestions'],
  { revalidate: 30, tags: ['cake-suggestions'] },
)
