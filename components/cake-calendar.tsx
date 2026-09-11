'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CakeSlice, ChevronLeft, ChevronRight, LogIn, LogOut, Plus, Trash2 } from 'lucide-react'
import { signOut } from '@/lib/auth-client'

type CakeEvent = { id: string; cake_date: string; person_name: string; notes: string | null }
type CakeSuggestion = { id: string; cake_date: string; person_name: string; reason: string; status: string }

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
const weekDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function CakeCalendar({ initialEvents, initialSuggestions, isAdmin }: { initialEvents: CakeEvent[]; initialSuggestions: CakeSuggestion[]; isAdmin: boolean }) {
  const router = useRouter()
  const today = new Date()
  const [events, setEvents] = useState(initialEvents)
  const [suggestions, setSuggestions] = useState(initialSuggestions)
  const [suggestionName, setSuggestionName] = useState('')
  const [suggestionReason, setSuggestionReason] = useState('')
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(localDateKey(today))
  const [personName, setPersonName] = useState('')
  const [notes, setNotes] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const days = useMemo(() => {
    const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
    const count = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()
    const mondayOffset = (first.getDay() + 6) % 7
    return [...Array(mondayOffset).fill(null), ...Array.from({ length: count }, (_, i) => new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1))]
  }, [viewDate])
  const upcoming = events.filter((event) => event.cake_date >= localDateKey(today)).sort((a, b) => a.cake_date.localeCompare(b.cake_date))
  const todayEvents = events.filter((event) => event.cake_date === localDateKey(today))
  const selectedEvents = events.filter((event) => event.cake_date === selectedDate)
  const leaderboard = useMemo(() => {
    const scores = new Map<string, { name: string; cakes: number }>()
    events.forEach((event) => {
      const name = event.person_name.trim()
      const key = name.toLocaleLowerCase()
      const current = scores.get(key)
      scores.set(key, { name: current?.name ?? name, cakes: (current?.cakes ?? 0) + 1 })
    })
    return [...scores.values()].sort((a, b) => b.cakes - a.cakes || a.name.localeCompare(b.name))
  }, [events])

  async function addCake(event: React.FormEvent) {
    event.preventDefault()
    if (!personName.trim()) return
    const response = await fetch('/api/cakes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cakeDate: selectedDate, personName, notes }) })
    if (!response.ok) return
    const created = await response.json()
    setEvents((current) => [...current, created])
    setPersonName(''); setNotes(''); setIsAdding(false)
  }

  async function submitSuggestion(event: React.FormEvent) {
    event.preventDefault()
    if (!suggestionName.trim() || !suggestionReason.trim()) return
    const response = await fetch('/api/cakes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'suggestion', cakeDate: selectedDate, personName: suggestionName, reason: suggestionReason }) })
    if (!response.ok) return
    setSuggestionName(''); setSuggestionReason(''); setIsSuggesting(false)
  }

  async function reviewSuggestion(id: string, status: 'accepted' | 'rejected') {
    const response = await fetch('/api/cakes', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    if (!response.ok) return
    const data = await response.json()
    setSuggestions((current) => current.map((item) => item.id === id ? { ...item, status } : item))
    if (data.cake) setEvents((current) => [...current, data.cake])
  }

  async function removeCake(id: string) {
    await fetch('/api/cakes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setEvents((current) => current.filter((event) => event.id !== id))
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-12">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 font-mono text-xs font-bold uppercase tracking-[0.22em] text-primary">The sweet schedule</p>
            <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">Cake Calendar <span aria-hidden="true">🍰</span></h1>
            <p className="mt-3 max-w-xl text-muted-foreground">A simple place to see who is bringing the cake next.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">{isAdmin ? <><span className="rounded-full bg-accent px-4 py-2 text-sm font-semibold">Admin mode</span><button onClick={async () => { await signOut(); router.refresh() }} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold"><LogOut size={16} /> Sign out</button><button onClick={() => setIsAdding(true)} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90"><Plus size={18} /> Add cake day</button></> : <a href="/sign-in" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-bold"><LogIn size={18} /> Admin sign in</a>}</div>
        </header>

        <section className={`mb-8 rounded-2xl border p-5 ${todayEvents.length ? 'border-primary/30 bg-accent' : 'border-border bg-card'}`} aria-live="polite">
          <div className="flex items-center gap-4"><span className="flex size-12 items-center justify-center rounded-xl bg-background text-2xl">{todayEvents.length ? '🎉' : '☕'}</span><div><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Today · {today.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</p><p className="mt-1 text-lg font-semibold">{todayEvents.length ? `${todayEvents.map((event) => event.person_name).join(' & ')} ${todayEvents.length === 1 ? 'is' : 'are'} bringing cake!` : 'No cake is scheduled today.'}</p></div></div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center justify-between"><button aria-label="Previous month" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="rounded-full p-2 hover:bg-muted"><ChevronLeft /></button><h2 className="font-serif text-2xl font-bold">{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</h2><button aria-label="Next month" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="rounded-full p-2 hover:bg-muted"><ChevronRight /></button></div>
            <div className="grid grid-cols-7 gap-1 text-center">{weekDays.map((day) => <div key={day} className="pb-3 font-mono text-xs font-bold uppercase text-muted-foreground">{day}</div>)}{days.map((day, index) => { const key = day ? localDateKey(day) : `empty-${index}`; const dayEvents = day ? events.filter((event) => event.cake_date === key) : []; const isWeekend = day ? day.getDay() === 0 || day.getDay() === 5 || day.getDay() === 6 : false; return <button key={key} disabled={!day} onClick={() => day && setSelectedDate(key)} className={`min-h-16 rounded-xl p-2 text-left transition ${day && selectedDate === key ? 'bg-primary text-primary-foreground' : isWeekend ? 'bg-muted/70 text-muted-foreground hover:bg-muted' : 'hover:bg-muted'} ${day && key === localDateKey(today) ? 'ring-2 ring-primary ring-offset-2 ring-offset-card' : ''} ${!day ? 'cursor-default' : ''}`}><span className="text-sm font-semibold">{day?.getDate()}</span>{dayEvents.map((event) => <span key={event.id} className={`mt-2 block truncate text-xs ${selectedDate === key ? 'text-primary-foreground/80' : isWeekend ? 'text-muted-foreground' : 'text-primary'}`} title={event.person_name}><span aria-hidden="true">🍰 </span>{event.person_name}</span>)}</button> })}</div>
          </section>

          <aside className="flex flex-col gap-8">
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm"><div className="mb-5 flex items-center justify-between"><div><p className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Coming up</p><h2 className="mt-1 font-serif text-2xl font-bold">Next slices</h2></div><CakeSlice className="text-primary" /></div>{upcoming.length ? <div className="flex flex-col gap-4">{upcoming.slice(0, 6).map((event) => <div key={event.id} className="group flex items-start gap-3"><div className="min-w-12 rounded-lg bg-accent px-2 py-2 text-center"><span className="block text-xs font-bold uppercase text-muted-foreground">{new Date(`${event.cake_date}T12:00:00`).toLocaleDateString(undefined, { month: 'short' })}</span><span className="block text-xl font-bold">{new Date(`${event.cake_date}T12:00:00`).getDate()}</span></div><div className="min-w-0 flex-1"><p className="font-semibold">{event.person_name}</p><p className="truncate text-sm text-muted-foreground">{event.notes || 'Cake day!'}</p></div>{isAdmin && <button aria-label={`Remove ${event.person_name}`} onClick={() => removeCake(event.id)} className="invisible rounded p-1 text-muted-foreground hover:text-destructive group-hover:visible"><Trash2 size={16} /></button>}</div>)}</div> : <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">No upcoming cake days yet. Add the first one!</p>}</section>
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm"><div className="mb-5"><p className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Cake crew</p><h2 className="mt-1 font-serif text-2xl font-bold">Bringer leaderboard</h2><p className="mt-1 text-sm text-muted-foreground">Who has shared the most slices?</p></div>{leaderboard.length ? <ol className="flex flex-col gap-3">{leaderboard.map((entry, index) => <li key={entry.name.toLocaleLowerCase()} className="flex items-center gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}</span><span className="min-w-0 flex-1 truncate font-semibold">{entry.name}</span><span className="text-sm font-bold text-primary">{entry.cakes} {entry.cakes === 1 ? 'cake' : 'cakes'}</span></li>)}</ol> : <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">The leaderboard will appear after the first cake day.</p>}</section>
          </aside>
        </div>

        {selectedEvents.length > 0 && <section className="mt-8 rounded-2xl border border-border bg-card p-6"><p className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Selected day</p><h2 className="mt-1 font-serif text-2xl font-bold">{new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h2><div className="mt-4 flex flex-wrap gap-3">{selectedEvents.map((event) => <div key={event.id} className="rounded-xl bg-accent px-4 py-3"><p className="font-semibold">🍰 {event.person_name}</p>{event.notes && <p className="mt-1 text-sm text-muted-foreground">{event.notes}</p>}</div>)}</div></section>}

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-mono text-xs font-bold uppercase tracking-wider text-primary">Have a sweet idea?</p><h2 className="mt-1 font-serif text-2xl font-bold">Suggest a cake day</h2><p className="mt-1 text-sm text-muted-foreground">Tell the admin who should bring cake and why.</p></div><button onClick={() => setIsSuggesting((value) => !value)} className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">{isSuggesting ? 'Close form' : 'Make a suggestion'}</button></div>{isSuggesting && <form onSubmit={submitSuggestion} className="mt-5 grid gap-4 rounded-xl bg-muted p-4 sm:grid-cols-2"><label className="flex flex-col gap-2 text-sm font-semibold">Date<input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} required className="rounded-lg border border-input bg-background px-3 py-2 font-normal" /></label><label className="flex flex-col gap-2 text-sm font-semibold">Your name<input value={suggestionName} onChange={(event) => setSuggestionName(event.target.value)} required className="rounded-lg border border-input bg-background px-3 py-2 font-normal" /></label><label className="flex flex-col gap-2 text-sm font-semibold sm:col-span-2">Reason<textarea value={suggestionReason} onChange={(event) => setSuggestionReason(event.target.value)} placeholder="Birthday, team celebration, or just because..." required rows={3} className="rounded-lg border border-input bg-background px-3 py-2 font-normal" /></label><button className="rounded-full bg-foreground px-5 py-3 text-sm font-bold text-background sm:col-span-2">Send suggestion</button></form>}</section>

        {isAdmin && <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm"><div className="mb-5"><p className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Admin review</p><h2 className="mt-1 font-serif text-2xl font-bold">Cake suggestions</h2></div>{suggestions.filter((item) => item.status === 'pending').length ? <div className="flex flex-col gap-3">{suggestions.filter((item) => item.status === 'pending').map((item) => <div key={item.id} className="flex flex-col gap-3 rounded-xl bg-muted p-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="font-semibold">{item.person_name} · {new Date(`${item.cake_date}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p><p className="text-sm text-muted-foreground">{item.reason}</p></div><div className="flex gap-2"><button onClick={() => reviewSuggestion(item.id, 'accepted')} className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Accept</button><button onClick={() => reviewSuggestion(item.id, 'rejected')} className="rounded-full border border-border px-4 py-2 text-sm font-bold">Decline</button></div></div>)}</div> : <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">No pending suggestions.</p>}</section>}

        {isAdmin && isAdding && <div className="fixed inset-0 z-10 flex items-center justify-center bg-foreground/30 p-5" role="dialog" aria-modal="true" aria-labelledby="add-cake-title"><form onSubmit={addCake} className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"><div className="mb-6 flex items-start justify-between"><div><p className="font-mono text-xs font-bold uppercase tracking-wider text-primary">New cake day</p><h2 id="add-cake-title" className="mt-1 font-serif text-2xl font-bold">Who&apos;s bringing cake?</h2></div><button type="button" onClick={() => setIsAdding(false)} className="text-2xl text-muted-foreground" aria-label="Close">×</button></div><label className="flex flex-col gap-2 text-sm font-semibold">Date<input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} required className="rounded-lg border border-input bg-background px-3 py-2 font-normal" /></label><label className="mt-4 flex flex-col gap-2 text-sm font-semibold">Person&apos;s name<input autoFocus value={personName} onChange={(event) => setPersonName(event.target.value)} placeholder="e.g. Sam" required className="rounded-lg border border-input bg-background px-3 py-2 font-normal" /></label><label className="mt-4 flex flex-col gap-2 text-sm font-semibold">Note <span className="font-normal text-muted-foreground">(optional)</span><input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Chocolate, homemade..." className="rounded-lg border border-input bg-background px-3 py-2 font-normal" /></label><button className="mt-6 w-full rounded-full bg-primary px-4 py-3 font-bold text-primary-foreground">Save cake day</button></form></div>}
      </div>
    </main>
  )
}
