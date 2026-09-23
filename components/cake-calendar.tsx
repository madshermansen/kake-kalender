'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CakeSlice, ChevronLeft, ChevronRight, LogIn, LogOut, Plus, Trash2 } from 'lucide-react'
import { signOut } from '@/lib/auth-client'

type CakeEvent = { id: string; cake_date: string; person_name: string; notes: string | null }
type CakeSuggestion = { id: string; cake_date: string; person_name: string; reason: string; status: string }

const monthNames = ['Januar','Februar','Mars','April','Mai','Juni','Juli','August','September','Oktober','November','Desember']
const weekDays = ['Man','Tir','Ons','Tor','Fre','Lør','Søn']

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function daysBetween(startDate: string, endDate: string) {
  const start = Date.UTC(Number(startDate.slice(0, 4)), Number(startDate.slice(5, 7)) - 1, Number(startDate.slice(8, 10)))
  const end = Date.UTC(Number(endDate.slice(0, 4)), Number(endDate.slice(5, 7)) - 1, Number(endDate.slice(8, 10)))
  return Math.floor((end - start) / 86400000)
}

export function CakeCalendar({ initialEvents, initialSuggestions, isAdmin, page = 'calendar' }: { initialEvents: CakeEvent[]; initialSuggestions: CakeSuggestion[]; isAdmin: boolean; page?: 'calendar' | 'leaderboard' | 'suggestions' }) {
  const router = useRouter()
  const today = new Date()
  const [events, setEvents] = useState(initialEvents)
  const [suggestions, setSuggestions] = useState(initialSuggestions)
  const [suggestionName, setSuggestionName] = useState('')
  const [suggestionReason, setSuggestionReason] = useState('')
  const [isSuggesting, setIsSuggesting] = useState(page === 'suggestions')
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
  const todayKey = localDateKey(today)
  const upcoming = events.filter((event) => event.cake_date >= todayKey).sort((a, b) => a.cake_date.localeCompare(b.cake_date))
  const pastEvents = events.filter((event) => event.cake_date <= todayKey).sort((a, b) => b.cake_date.localeCompare(a.cake_date))
  const lastCakeDay = pastEvents[0]
  const daysSinceLastCake = lastCakeDay ? daysBetween(lastCakeDay.cake_date, todayKey) : null
  const todayEvents = events.filter((event) => event.cake_date === todayKey)
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
        <nav className="mb-8 flex w-full flex-wrap items-center gap-x-6 gap-y-3 border-b border-border pb-3" aria-label="Cake calendar pages"><Link href="/" className={`text-sm font-bold transition ${page === 'calendar' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Kalender</Link><Link href="/leaderboard" className={`text-sm font-bold transition ${page === 'leaderboard' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Toppliste</Link><Link href="/suggestions" className={`text-sm font-bold transition ${page === 'suggestions' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Forslag</Link><Link href="/cake-spinner" className="text-sm font-bold text-muted-foreground transition hover:text-foreground">Kakespinner</Link></nav>
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 font-mono text-xs font-bold uppercase tracking-[0.22em] text-primary">Den søte planen</p>
            <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">Kakekalender <span aria-hidden="true">🍰</span></h1>
            <p className="mt-3 max-w-xl text-muted-foreground">Et enkelt sted å se hvem som tar med kake neste gang.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">{isAdmin ? <><span className="rounded-full bg-accent px-4 py-2 text-sm font-semibold">Adminmodus</span><button onClick={async () => { await signOut(); router.refresh() }} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold"><LogOut size={16} /> Logg ut</button><button onClick={() => setIsAdding(true)} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90"><Plus size={18} /> Legg til kakedag</button></> : <><Link href="/suggestions" className="rounded-full border border-primary px-3 py-2 text-xs font-bold text-primary transition hover:bg-accent">Foreslå en kake</Link><a href="/sign-in" className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold"><LogIn size={16} /> Adminpålogging</a></>}</div>
        </header>

        <div className="mb-8 grid gap-4 sm:grid-cols-[minmax(0,1.5fr)_minmax(220px,0.5fr)]">
          <section className={`rounded-2xl border p-5 ${todayEvents.length ? 'border-primary/30 bg-accent' : 'border-border bg-card'}`} aria-live="polite">
            <div className="flex items-center gap-4"><span className="flex size-12 items-center justify-center rounded-xl bg-background text-2xl">{todayEvents.length ? '🎉' : '☕'}</span><div><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">I dag · {today.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</p><p className="mt-1 text-lg font-semibold">{todayEvents.length ? `${todayEvents.map((event) => event.person_name).join(' & ')} ${todayEvents.length === 1 ? 'is' : 'are'} bringing cake!` : 'Ingen kake er planlagt i dag.'}</p></div></div>
          </section>
          <section className="rounded-2xl border border-border bg-card p-5" aria-label="Dager siden siste kakedag">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Siden siste kakedag</p>
            {daysSinceLastCake === null ? <p className="mt-2 text-lg font-semibold">Ingen kakedager ennå</p> : <><p className="mt-1 font-serif text-4xl font-bold text-primary">{daysSinceLastCake}</p><p className="text-sm text-muted-foreground">{daysSinceLastCake === 1 ? 'dag' : 'dager'}</p></>}
          </section>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:items-start">
          <section className={`${page === 'calendar' ? 'block' : 'hidden'} order-1 w-full rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5`}>
            <div className="mb-6 flex items-center justify-between"><button aria-label="Forrige måned" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="rounded-full p-2 hover:bg-muted"><ChevronLeft /></button><h2 className="font-serif text-2xl font-bold">{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</h2><button aria-label="Neste måned" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="rounded-full p-2 hover:bg-muted"><ChevronRight /></button></div>
            <div className="grid grid-cols-7 gap-2 text-center">{weekDays.map((day) => <div key={day} className="pb-3 font-mono text-xs font-bold uppercase text-muted-foreground">{day}</div>)}{days.map((day, index) => { const key = day ? localDateKey(day) : `empty-${index}`; const dayEvents = day ? events.filter((event) => event.cake_date === key) : []; const isWeekend = day ? day.getDay() === 0 || day.getDay() === 5 || day.getDay() === 6 : false; return <button key={key} disabled={!day} onClick={() => day && setSelectedDate(key)} className={`min-h-12 rounded-xl p-1.5 text-left transition ${day && selectedDate === key ? 'bg-primary text-primary-foreground' : isWeekend ? 'bg-muted/70 text-muted-foreground hover:bg-muted' : 'hover:bg-muted'} ${day && key === localDateKey(today) ? 'ring-2 ring-primary ring-offset-2 ring-offset-card' : ''} ${!day ? 'cursor-default' : ''}`}><span className="text-sm font-semibold">{day?.getDate()}</span>{dayEvents.map((event) => <span key={event.id} className={`mt-2 block truncate text-xs ${selectedDate === key ? 'text-primary-foreground/80' : isWeekend ? 'text-muted-foreground' : 'text-primary'}`} title={event.person_name}><span aria-hidden="true">🍰 </span>{event.person_name}</span>)}</button> })}</div>
          </section>

          <aside className="order-2 flex flex-col gap-6">
            <section className={`${page === 'calendar' ? 'block' : 'hidden'} rounded-2xl border border-border bg-card p-6 shadow-sm`}><div className="mb-5 flex items-center justify-between"><div><p className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Kommer snart</p><h2 className="mt-1 font-serif text-2xl font-bold">Neste kakestykker</h2></div><CakeSlice className="text-primary" /></div>{upcoming.length ? <div className="flex flex-col gap-4">{upcoming.slice(0, 6).map((event) => <div key={event.id} className="group flex items-start gap-3"><div className="min-w-12 rounded-lg bg-accent px-2 py-2 text-center"><span className="block text-xs font-bold uppercase text-muted-foreground">{new Date(`${event.cake_date}T12:00:00`).toLocaleDateString(undefined, { month: 'short' })}</span><span className="block text-xl font-bold">{new Date(`${event.cake_date}T12:00:00`).getDate()}</span></div><div className="min-w-0 flex-1"><p className="font-semibold">{event.person_name}</p><p className="truncate text-sm text-muted-foreground">{event.notes || 'Kakedag!'}</p></div>{isAdmin && <button aria-label={`Remove ${event.person_name}`} onClick={() => removeCake(event.id)} className="invisible rounded p-1 text-muted-foreground hover:text-destructive group-hover:visible"><Trash2 size={16} /></button>}</div>)}</div> : <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">Ingen kommende kakedager ennå. Legg til den første!</p>}</section>
            <section className={`${page === 'leaderboard' ? 'block' : 'hidden'} rounded-2xl border border-border bg-card p-6 shadow-sm`}><div className="mb-5"><p className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Kakegjengen</p><h2 className="mt-1 font-serif text-2xl font-bold">Toppliste for kakebakere</h2><p className="mt-1 text-sm text-muted-foreground">Hvem har delt flest kakestykker?</p></div>{leaderboard.length ? <ol className="flex flex-col gap-3">{leaderboard.map((entry, index) => { const rank = leaderboard.findIndex((candidate) => candidate.cakes === entry.cakes) + 1; return <li key={entry.name.toLocaleLowerCase()} className="flex items-center gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold">{rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}</span><span className="min-w-0 flex-1 truncate font-semibold">{entry.name}</span><span className="text-sm font-bold text-primary">{entry.cakes} {entry.cakes === 1 ? 'cake' : 'cakes'}</span></li> })}</ol> : <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">The leaderboard will appear after the first cake day.</p>}</section>
          </aside>

        {selectedEvents.length > 0 && <section className="order-5 rounded-2xl border border-border bg-card p-6"><p className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Selected day</p><h2 className="mt-1 font-serif text-2xl font-bold">{new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h2><div className="mt-4 flex flex-wrap gap-3">{selectedEvents.map((event) => <div key={event.id} className="rounded-xl bg-accent px-4 py-3"><p className="font-semibold">🍰 {event.person_name}</p>{event.notes && <p className="mt-1 text-sm text-muted-foreground">{event.notes}</p>}</div>)}</div></section>}

        {page === 'suggestions' && <section className="order-2 rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2"><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-xs font-bold uppercase tracking-wider text-primary">Har du en søt idé?</p><h2 className="mt-1 font-serif text-2xl font-bold">Foreslå en kake day</h2><p className="mt-1 text-sm text-muted-foreground">Fortell admin hvem som bør ta med kake, og hvorfor.</p></div><button type="button" onClick={() => setIsSuggesting((current) => !current)} className="shrink-0 rounded-full border border-border px-4 py-2 text-sm font-bold transition hover:bg-muted">{isSuggesting ? 'Hide form' : 'Foreslå en kake'}</button></div>{isSuggesting && <form onSubmit={submitSuggestion} className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2"><label className="flex flex-col gap-2 text-sm font-semibold">Date<input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} required className="rounded-lg border border-input bg-background px-3 py-2 font-normal" /></label><label className="flex flex-col gap-2 text-sm font-semibold">Navnet ditt<input value={suggestionName} onChange={(event) => setSuggestionName(event.target.value)} required className="rounded-lg border border-input bg-background px-3 py-2 font-normal" /></label><label className="flex flex-col gap-2 text-sm font-semibold sm:col-span-2">Begrunnelse<textarea value={suggestionReason} onChange={(event) => setSuggestionReason(event.target.value)} placeholder="Bursdag, teamfeiring eller bare fordi ..." required rows={3} className="rounded-lg border border-input bg-background px-3 py-2 font-normal" /></label><div className="flex justify-end sm:col-span-2"><button className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Send forslag</button></div></form>}</section>}

        {isAdmin && <section className="order-6 rounded-2xl border border-border bg-card p-6 shadow-sm"><div className="mb-5"><p className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Adminbehandling</p><h2 className="mt-1 font-serif text-2xl font-bold">Kakeforslag</h2></div>{suggestions.filter((item) => item.status === 'pending').length ? <div className="flex flex-col gap-3">{suggestions.filter((item) => item.status === 'pending').map((item) => <div key={item.id} className="flex flex-col gap-3 rounded-xl bg-muted p-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="font-semibold">{item.person_name} · {new Date(`${item.cake_date}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p><p className="text-sm text-muted-foreground">{item.reason}</p></div><div className="flex gap-2"><button onClick={() => reviewSuggestion(item.id, 'accepted')} className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Godta</button><button onClick={() => reviewSuggestion(item.id, 'rejected')} className="rounded-full border border-border px-4 py-2 text-sm font-bold">Avslå</button></div></div>)}</div> : <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">No pending suggestions.</p>}</section>}
        </div>

        {isAdmin && isAdding && <div className="fixed inset-0 z-10 flex items-center justify-center bg-foreground/30 p-5" role="dialog" aria-modal="true" aria-labelledby="add-cake-title"><form onSubmit={addCake} className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"><div className="mb-6 flex items-start justify-between"><div><p className="font-mono text-xs font-bold uppercase tracking-wider text-primary">New cake day</p><h2 id="add-cake-title" className="mt-1 font-serif text-2xl font-bold">Hvem tar med kake?</h2></div><button type="button" onClick={() => setIsAdding(false)} className="text-2xl text-muted-foreground" aria-label="Close">×</button></div><label className="flex flex-col gap-2 text-sm font-semibold">Date<input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} required className="rounded-lg border border-input bg-background px-3 py-2 font-normal" /></label><label className="mt-4 flex flex-col gap-2 text-sm font-semibold">Person&apos;s name<input autoFocus value={personName} onChange={(event) => setPersonName(event.target.value)} placeholder="e.g. Sam" required className="rounded-lg border border-input bg-background px-3 py-2 font-normal" /></label><label className="mt-4 flex flex-col gap-2 text-sm font-semibold">Note <span className="font-normal text-muted-foreground">(optional)</span><input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Chocolate, homemade..." className="rounded-lg border border-input bg-background px-3 py-2 font-normal" /></label><button className="mt-6 w-full rounded-full bg-primary px-4 py-3 font-bold text-primary-foreground">Lagre kakedag</button></form></div>}
      </div>
    </main>
  )
}
