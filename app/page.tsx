import { CakeCalendar } from '@/components/cake-calendar'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })
  const result = await db.execute(sql`SELECT id, cake_date, person_name, notes FROM cake_events ORDER BY cake_date ASC, created_at ASC`)
  const suggestions = session?.user ? await db.execute(sql`SELECT id, cake_date, person_name, reason, status, created_at FROM cake_suggestions ORDER BY created_at DESC`) : { rows: [] }
  return <CakeCalendar initialEvents={result.rows as { id: string; cake_date: string; person_name: string; notes: string | null }[]} initialSuggestions={suggestions.rows as { id: string; cake_date: string; person_name: string; reason: string; status: string }[]} isAdmin={Boolean(session?.user)} />
}
