'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { CakeSlice, Coins, Dices, Flame, LockKeyhole, Sparkles } from 'lucide-react'

const STORAGE_KEY = 'kakekalender-gamification'
const SPIN_COST = 5
const MAX_DAILY_COINS = 25

type Rarity = 'Vanlig' | 'Uvanlig' | 'Sjelden' | 'Legendarisk'
type Cake = { name: string; emoji: string; note: string; rarity: Rarity }
type GameState = { coins: number; streak: number; lastCheckIn: string; inventory: Record<string, number> }

const cakeTypes: Cake[] = [
  { name: 'Sjokoladefondant', emoji: '🍫', note: 'Rich, gooey, and always a crowd-pleaser.', rarity: 'Vanlig' },
  { name: 'Victoria sponge', emoji: '🍓', note: 'Light sponge, jam, and a little bit of joy.', rarity: 'Vanlig' },
  { name: 'Carrot cake', emoji: '🥕', note: 'Spiced, comforting, and crowned with cream cheese frosting.', rarity: 'Uvanlig' },
  { name: 'Lemon drizzle', emoji: '🍋', note: 'Bright, zingy, and perfect with a cup of tea.', rarity: 'Uvanlig' },
  { name: 'Red velvet', emoji: '❤️', note: 'Soft, velvety, and made for celebrations.', rarity: 'Sjelden' },
  { name: 'Coffee & walnut', emoji: '☕', note: 'A grown-up classic with a lovely little crunch.', rarity: 'Sjelden' },
  { name: 'Funfetti', emoji: '🎉', note: 'Colourful, cheerful, and impossible not to smile at.', rarity: 'Legendarisk' },
  { name: 'Cheesecake', emoji: '🧀', note: 'Creamy, cool, and ready for a biscuit base.', rarity: 'Vanlig' },
]

const rarityStyles: Record<Rarity, string> = {
  Vanlig: 'border-border bg-muted/40 text-muted-foreground',
  Uvanlig: 'border-sky-300/50 bg-sky-50 text-sky-700',
  Sjelden: 'border-violet-300/50 bg-violet-50 text-violet-700',
  Legendarisk: 'border-amber-300/60 bg-amber-50 text-amber-700',
}

const emptyState: GameState = { coins: 0, streak: 0, lastCheckIn: '', inventory: {} }

function today() {
  return new Date().toISOString().slice(0, 10)
}

function daysBetween(first: string, second: string) {
  return Math.round((new Date(second).getTime() - new Date(first).getTime()) / 86400000)
}

function pickCake() {
  const roll = Math.random()
  const rarity: Rarity = roll < 0.55 ? 'Vanlig' : roll < 0.83 ? 'Uvanlig' : roll < 0.95 ? 'Sjelden' : 'Legendarisk'
  const pool = cakeTypes.filter((cake) => cake.rarity === rarity)
  return pool[Math.floor(Math.random() * pool.length)]
}

export function CakeSpinner() {
  const [game, setGame] = useState<GameState>(emptyState)
  const [selected, setSelected] = useState(cakeTypes[0])
  const [isSpinning, setIsSpinning] = useState(false)
  const [reelPosition, setReelPosition] = useState(0)
  const [checkedIn, setCheckedIn] = useState(false)
  const reelItems = useMemo(() => Array.from({ length: 40 }, () => cakeTypes).flat(), [])
  const cardStep = 156

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    const current = saved ? { ...emptyState, ...JSON.parse(saved) } : emptyState
    const date = today()
    if (current.lastCheckIn !== date) {
      const streak = current.lastCheckIn && daysBetween(current.lastCheckIn, date) === 1 ? Math.min(current.streak + 1, 8) : 1
      const reward = Math.min(10 + (streak - 1) * 2, MAX_DAILY_COINS)
      current.coins += reward
      current.streak = streak
      current.lastCheckIn = date
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
      setCheckedIn(true)
    }
    setGame(current)
  }, [])

  function spin() {
    if (isSpinning || game.coins < SPIN_COST) return
    const winner = pickCake()
    const winnerIndex = reelPosition + 32 + cakeTypes.indexOf(winner)
    const nextGame = { ...game, coins: game.coins - SPIN_COST, inventory: { ...game.inventory, [winner.name]: (game.inventory[winner.name] ?? 0) + 1 } }
    setIsSpinning(true)
    setGame(nextGame)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextGame))
    setReelPosition(winnerIndex)
    window.setTimeout(() => { setSelected(winner); setIsSpinning(false) }, 3200)
  }

  const ownedCakes = cakeTypes.filter((cake) => game.inventory[cake.name])
  const dailyReward = Math.min(10 + Math.max(game.streak - 1, 0) * 2, MAX_DAILY_COINS)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-12">
        <nav className="mb-8 flex w-full items-center gap-6 border-b border-border pb-3" aria-label="Cake calendar pages">
          <Link href="/" className="text-sm font-bold text-muted-foreground transition hover:text-foreground">Kalender</Link>
          <Link href="/leaderboard" className="text-sm font-bold text-muted-foreground transition hover:text-foreground">Toppliste</Link>
          <Link href="/suggestions" className="text-sm font-bold text-muted-foreground transition hover:text-foreground">Forslag</Link>
          <Link href="/cake-spinner" className="text-sm font-bold text-primary">Kakespinner</Link>
        </nav>

        <header className="mx-auto mb-8 max-w-2xl text-center">
          <p className="mb-2 font-mono text-xs font-bold uppercase tracking-[0.22em] text-primary">Litt hjelp til å velge</p>
          <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">Hvilken kake skal vi ha? <span aria-hidden="true">🎂</span></h1>
          <p className="mt-3 text-muted-foreground">Sjekk inn hver dag, samle mynter og lås opp hele kakesamlingen.</p>
        </header>

        <section className="mx-auto mb-8 grid max-w-4xl gap-3 sm:grid-cols-3" aria-label="Spillstatus">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><div className="flex items-center gap-2 text-sm font-bold text-amber-700"><Coins data-icon="inline-start" /> Mynter</div><p className="mt-1 text-3xl font-black text-amber-900">{game.coins}</p><p className="text-xs text-amber-700">5 mynter per spinn</p></div>
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4"><div className="flex items-center gap-2 text-sm font-bold text-orange-700"><Flame data-icon="inline-start" /> Innsjekkingsrekke</div><p className="mt-1 text-3xl font-black text-orange-900">{game.streak} dager</p><p className="text-xs text-orange-700">{checkedIn ? `+${dailyReward} mynter i dag` : 'Kom tilbake i morgen'}</p></div>
          <div className="rounded-2xl border border-border bg-card p-4"><div className="flex items-center gap-2 text-sm font-bold text-muted-foreground"><Sparkles data-icon="inline-start" /> Samling</div><p className="mt-1 text-3xl font-black">{ownedCakes.length}<span className="text-lg text-muted-foreground"> / {cakeTypes.length}</span></p><p className="text-xs text-muted-foreground">ulike kaker funnet</p></div>
        </section>

        <section className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-8" aria-live="polite">
          <div className="mb-5 flex items-center justify-between"><span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Kakekasse #001</span><span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-primary">Dagens belønning: {dailyReward} mynter</span></div>
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-[#241c20] px-3 py-7 shadow-inner sm:px-8 sm:py-10">
            <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-1 -translate-x-1/2 bg-primary shadow-[0_0_18px_rgba(218,74,112,0.9)]" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 -translate-x-1/2 border-x-8 border-transparent border-t-0 border-b-[14px] border-b-primary" aria-hidden="true" />
            <div className="flex gap-3 transition-transform duration-[3200ms] ease-[cubic-bezier(0.12,0.8,0.18,1)]" style={{ transform: `translateX(calc(50% - 72px - ${reelPosition * cardStep}px))` }}>
              {reelItems.map((cake, index) => <div key={`${cake.name}-${index}`} className="flex h-32 w-36 min-w-36 flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#35292e] text-center text-white shadow-lg sm:h-36"><span className="text-5xl" aria-hidden="true">{cake.emoji}</span><span className="max-w-28 text-xs font-bold leading-tight">{cake.name}</span></div>)}
            </div>
          </div>
          <div className="mt-7 text-center"><p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{isSpinning ? 'Åpner kasse ...' : 'Kasse åpnet'}</p><h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">{selected.name}</h2><p className="mx-auto mt-2 max-w-md text-muted-foreground">{selected.note}</p><button type="button" onClick={spin} disabled={isSpinning || game.coins < SPIN_COST} className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"><Dices data-icon="inline-start" /> {isSpinning ? 'Pakker ut ...' : game.coins < SPIN_COST ? `Trenger ${SPIN_COST} mynter` : `Spinn for ${SPIN_COST} mynter`}</button></div>
        </section>

        <section className="mx-auto mt-8 max-w-4xl rounded-3xl border border-border bg-card p-5 sm:p-8" aria-labelledby="inventory-heading">
          <div className="mb-5 flex items-center justify-between"><div><h2 id="inventory-heading" className="font-serif text-2xl font-bold">Kakesamlingen</h2><p className="mt-1 text-sm text-muted-foreground">Sjeldenheten avgjør hvor ofte kaken dukker opp.</p></div><LockKeyhole className="text-muted-foreground" aria-hidden="true" /></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{cakeTypes.map((cake) => <div key={cake.name} className={`rounded-2xl border p-4 ${game.inventory[cake.name] ? rarityStyles[cake.rarity] : 'border-border bg-muted/20 opacity-50'}`}><div className="flex items-start justify-between"><span className="text-3xl" aria-hidden="true">{game.inventory[cake.name] ? cake.emoji : '？'}</span><span className="text-xs font-bold">{game.inventory[cake.name] ? `×${game.inventory[cake.name]}` : 'Låst'}</span></div><p className="mt-3 text-sm font-bold">{cake.name}</p><p className="mt-1 text-xs font-medium">{cake.rarity}</p></div>)}</div>
        </section>

        <div className="mt-8 flex justify-center gap-2 text-sm text-muted-foreground"><CakeSlice className="text-primary" /> Kom innom hver dag for flere mynter.</div>
      </div>
    </main>
  )
}
