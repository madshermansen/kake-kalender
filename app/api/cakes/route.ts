import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  return Boolean(session?.user)
}

export async function GET() {
  const result = await db.execute(sql`SELECT id, cake_date, person_name, notes FROM cake_events ORDER BY cake_date ASC, created_at ASC`)
  return NextResponse.json(result.rows)
}

export async function POST(request: Request) {
  const body = await request.json()
  const action = typeof body.action === 'string' ? body.action : 'cake'

  if (action === 'suggestion') {
    const cakeDate = typeof body.cakeDate === 'string' ? body.cakeDate : ''
    const personName = typeof body.personName === 'string' ? body.personName.trim() : ''
    const reason = typeof body.reason === 'string' ? body.reason.trim() : ''
    if (!cakeDate || !personName || !reason || personName.length > 100 || reason.length > 500) return NextResponse.json({ error: 'Please provide a date, name, and reason.' }, { status: 400 })
    const result = await db.execute(sql`INSERT INTO cake_suggestions (cake_date, person_name, reason) VALUES (${cakeDate}, ${personName}, ${reason}) RETURNING id, cake_date, person_name, reason, status, created_at`)
    return NextResponse.json(result.rows[0], { status: 201 })
  }

  if (!(await isAdmin())) return NextResponse.json({ error: 'Admin sign-in required.' }, { status: 401 })
  const cakeDate = typeof body.cakeDate === 'string' ? body.cakeDate : ''
  const personName = typeof body.personName === 'string' ? body.personName.trim() : ''
  const notes = typeof body.notes === 'string' ? body.notes.trim() : ''
  if (!cakeDate || !personName || personName.length > 100) return NextResponse.json({ error: 'Please provide a date and a name.' }, { status: 400 })
  const result = await db.execute(sql`INSERT INTO cake_events (cake_date, person_name, notes) VALUES (${cakeDate}, ${personName}, ${notes || null}) RETURNING id, cake_date, person_name, notes`)
  return NextResponse.json(result.rows[0], { status: 201 })
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Admin sign-in required.' }, { status: 401 })
  const { id, status } = await request.json()
  if (typeof id !== 'string' || !['accepted', 'rejected'].includes(status)) return NextResponse.json({ error: 'Invalid suggestion update.' }, { status: 400 })
  if (status === 'accepted') {
    const result = await db.execute(sql`UPDATE cake_suggestions SET status = 'accepted', reviewed_at = NOW() WHERE id = ${id} AND status = 'pending' RETURNING cake_date, person_name, reason`)
    const suggestion = result.rows[0]
    if (suggestion) {
      const cake = await db.execute(sql`INSERT INTO cake_events (cake_date, person_name, notes) VALUES (${suggestion.cake_date}, ${suggestion.person_name}, ${suggestion.reason}) RETURNING id, cake_date, person_name, notes`)
      return NextResponse.json({ suggestion: { ...suggestion, status: 'accepted' }, cake: cake.rows[0] })
    }
  } else {
    await db.execute(sql`UPDATE cake_suggestions SET status = 'rejected', reviewed_at = NOW() WHERE id = ${id} AND status = 'pending'`)
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Admin sign-in required.' }, { status: 401 })
  const { id } = await request.json()
  if (typeof id !== 'string') return NextResponse.json({ error: 'Invalid cake id.' }, { status: 400 })
  await db.execute(sql`DELETE FROM cake_events WHERE id = ${id}`)
  return NextResponse.json({ ok: true })
}

export async function getSuggestionsForPage() {
  return db.execute(sql`SELECT id, cake_date, person_name, reason, status, created_at FROM cake_suggestions ORDER BY created_at DESC`)
}
