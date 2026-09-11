'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ADMIN_EMAIL, ADMIN_USERNAME } from '@/lib/admin'
import { authClient } from '@/lib/auth-client'

export default function SignInPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    const email = username.trim().toLowerCase() === ADMIN_USERNAME ? ADMIN_EMAIL : `${username.trim().toLowerCase()}@cakecalendar.local`
    let result = await authClient.signIn.email({ email, password })
    if (result.error && username.trim().toLowerCase() === ADMIN_USERNAME && password === 'ray-of-fernie') {
      const created = await authClient.signUp.email({ email: ADMIN_EMAIL, password, name: 'Fernande' })
      if (!created.error) result = await authClient.signIn.email({ email: ADMIN_EMAIL, password })
    }
    setLoading(false)
    if (result.error) { setError('That username or password is not correct.'); return }
    router.push('/')
    router.refresh()
  }

  return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10 text-foreground"><form onSubmit={handleSubmit} className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-sm"><p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-primary">Cake Calendar</p><h1 className="mt-3 font-serif text-4xl font-bold">Admin sign in</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Sign in to add and manage cake days. Everyone else can still view the calendar.</p><label className="mt-8 flex flex-col gap-2 text-sm font-semibold">Username<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required className="rounded-xl border border-input bg-background px-3 py-3 font-normal" placeholder="fernande" /></label><label className="mt-4 flex flex-col gap-2 text-sm font-semibold">Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required className="rounded-xl border border-input bg-background px-3 py-3 font-normal" /></label>{error && <p role="alert" className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<button disabled={loading} className="mt-6 w-full rounded-full bg-primary px-4 py-3 font-bold text-primary-foreground disabled:opacity-60">{loading ? 'Signing in…' : 'Sign in'}</button><a href="/" className="mt-5 block text-center text-sm text-muted-foreground underline">Back to calendar</a></form></main>
}
