'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CakeSlice, Dices } from 'lucide-react'

const cakeTypes = [
  { name: 'Chocolate fudge', emoji: '🍫', note: 'Rich, gooey, and always a crowd-pleaser.' },
  { name: 'Victoria sponge', emoji: '🍓', note: 'Light sponge, jam, and a little bit of joy.' },
  { name: 'Carrot cake', emoji: '🥕', note: 'Spiced, comforting, and crowned with cream cheese frosting.' },
  { name: 'Lemon drizzle', emoji: '🍋', note: 'Bright, zingy, and perfect with a cup of tea.' },
  { name: 'Red velvet', emoji: '❤️', note: 'Soft, velvety, and made for celebrations.' },
  { name: 'Coffee & walnut', emoji: '☕', note: 'A grown-up classic with a lovely little crunch.' },
  { name: 'Funfetti', emoji: '🎉', note: 'Colourful, cheerful, and impossible not to smile at.' },
  { name: 'Cheesecake', emoji: '🧀', note: 'Creamy, cool, and ready for a biscuit base.' },
]

export function CakeSpinner() {
  const [selected, setSelected] = useState(cakeTypes[0])
  const [isSpinning, setIsSpinning] = useState(false)
  const [reelPosition, setReelPosition] = useState(0)
  // Keep a generous runway so repeated spins never run past the rendered cards.
  const reelItems = Array.from({ length: 40 }, () => cakeTypes).flat()
  const cardStep = 156

  function spin() {
    if (isSpinning) return

    // Always travel through a full run of cards before easing onto the winner.
    const winnerIndex = reelPosition + 32 + Math.floor(Math.random() * cakeTypes.length)
    setIsSpinning(true)
    setReelPosition(winnerIndex)
    window.setTimeout(() => {
      setSelected(cakeTypes[winnerIndex % cakeTypes.length])
      setIsSpinning(false)
    }, 3200)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-12">
        <nav className="mb-8 flex w-full items-center gap-6 border-b border-border pb-3" aria-label="Cake calendar pages">
          <Link href="/" className="text-sm font-bold text-muted-foreground transition hover:text-foreground">Calendar</Link>
          <Link href="/leaderboard" className="text-sm font-bold text-muted-foreground transition hover:text-foreground">Leaderboard</Link>
          <Link href="/suggestions" className="text-sm font-bold text-muted-foreground transition hover:text-foreground">Suggestions</Link>
          <Link href="/cake-spinner" className="text-sm font-bold text-primary">Cake spinner</Link>
        </nav>

        <header className="mx-auto mb-8 max-w-2xl text-center">
          <p className="mb-2 font-mono text-xs font-bold uppercase tracking-[0.22em] text-primary">A little help deciding</p>
          <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">What cake should we have? <span aria-hidden="true">🎂</span></h1>
          <p className="mt-3 text-muted-foreground">Let the cake spinner choose your next sweet treat.</p>
        </header>

        <section className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-8" aria-live="polite">
          <div className="mb-5 flex items-center justify-between"><span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Cake case #001</span><span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-primary">Rare dessert drop</span></div>
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-[#241c20] px-3 py-7 shadow-inner sm:px-8 sm:py-10">
            <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-1 -translate-x-1/2 bg-primary shadow-[0_0_18px_rgba(218,74,112,0.9)]" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 -translate-x-1/2 border-x-8 border-transparent border-t-0 border-b-[14px] border-b-primary" aria-hidden="true" />
            <div className="flex gap-3 transition-transform duration-[3200ms] ease-[cubic-bezier(0.12,0.8,0.18,1)]" style={{ transform: `translateX(calc(50% - 72px - ${reelPosition * cardStep}px))` }}>
              {reelItems.map((cake, index) => <div key={`${cake.name}-${index}`} className="flex h-32 w-36 min-w-36 flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#35292e] text-center text-white shadow-lg sm:h-36"><span className="text-5xl" aria-hidden="true">{cake.emoji}</span><span className="max-w-28 text-xs font-bold leading-tight">{cake.name}</span></div>)}
            </div>
          </div>
          <div className="mt-7 text-center"><p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{isSpinning ? 'Opening case...' : 'Case opened'}</p><h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">{selected.name}</h2><p className="mx-auto mt-2 max-w-md text-muted-foreground">{selected.note}</p><button type="button" onClick={spin} disabled={isSpinning} className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-wait disabled:opacity-70"><Dices data-icon="inline-start" /> {isSpinning ? 'Unboxing...' : 'Open cake case'}</button></div>
        </section>

        <section className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-2" aria-label="Cake ideas">
          {cakeTypes.map((cake) => <div key={cake.name} className={`flex items-center gap-3 rounded-2xl border p-4 transition ${selected.name === cake.name ? 'border-primary/40 bg-accent' : 'border-border bg-card'}`}><span className="text-2xl" aria-hidden="true">{cake.emoji}</span><span className="text-sm font-semibold">{cake.name}</span></div>)}
        </section>

        <div className="mt-8 flex justify-center gap-2 text-sm text-muted-foreground"><CakeSlice className="text-primary" /> No wrong answers, only cake.</div>
      </div>
    </main>
  )
}
