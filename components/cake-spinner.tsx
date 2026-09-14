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

  function spin() {
    setIsSpinning(true)
    window.setTimeout(() => {
      let next = cakeTypes[Math.floor(Math.random() * cakeTypes.length)]
      if (cakeTypes.length > 1 && next.name === selected.name) next = cakeTypes[(cakeTypes.findIndex((cake) => cake.name === next.name) + 1) % cakeTypes.length]
      setSelected(next)
      setIsSpinning(false)
    }, 650)
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

        <section className="mx-auto max-w-2xl rounded-3xl border border-primary/20 bg-card p-6 text-center shadow-sm sm:p-10" aria-live="polite">
          <div className={`mx-auto flex size-36 items-center justify-center rounded-full bg-accent text-7xl shadow-inner transition-transform duration-700 sm:size-44 sm:text-8xl ${isSpinning ? 'animate-spin' : ''}`} aria-hidden="true">{selected.emoji}</div>
          <p className="mt-8 font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Your cake pick</p>
          <h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">{selected.name}</h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">{selected.note}</p>
          <button type="button" onClick={spin} disabled={isSpinning} className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-wait disabled:opacity-70">
            <Dices data-icon="inline-start" /> {isSpinning ? 'Spinning...' : 'Spin again'}
          </button>
        </section>

        <section className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-2" aria-label="Cake ideas">
          {cakeTypes.map((cake) => <div key={cake.name} className={`flex items-center gap-3 rounded-2xl border p-4 transition ${selected.name === cake.name ? 'border-primary/40 bg-accent' : 'border-border bg-card'}`}><span className="text-2xl" aria-hidden="true">{cake.emoji}</span><span className="text-sm font-semibold">{cake.name}</span></div>)}
        </section>

        <div className="mt-8 flex justify-center gap-2 text-sm text-muted-foreground"><CakeSlice className="text-primary" /> No wrong answers, only cake.</div>
      </div>
    </main>
  )
}
