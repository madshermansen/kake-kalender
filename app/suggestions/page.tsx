import { CakeCalendar } from '@/components/cake-calendar'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function SuggestionsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const result = await db.execute(sql`SELECT id, cake_date, person_name, notes FROM cake_events ORDER BY cake_date ASC, created_at ASC`)
  const suggestions = session?.user ? await db.execute(sql`SELECT id, cake_date, person_name, reason, status FROM cake_suggestions ORDER BY created_at DESC`) : { rows: [] }
  return <CakeCalendar page="suggestions" initialEvents={result.rows as never[]} initialSuggestions={suggestions.rows as never[]} isAdmin={Boolean(session?.user)} />
}
