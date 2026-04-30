'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type AuthMode = 'signup' | 'login' | 'reset'

type AuthFormProps = {
  mode: AuthMode
}

const modeCopy = {
  signup: {
    tagline: "your brain isn't broken 💛",
    heading: 'Create your account',
    primary: 'Create my account ✨',
  },
  login: {
    tagline: 'welcome back 🌸',
    heading: 'Log back in',
    primary: 'Log in 💛',
  },
  reset: {
    tagline: 'no worries 💛',
    heading: 'Forgot your password?',
    primary: 'Send reset link',
  },
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const copy = modeCopy[mode]

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return

      if (data.session) {
        router.replace('/dashboard')
        return
      }

      setCheckingSession(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.replace('/dashboard')
      }
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [router])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: name,
            },
          },
        })

        if (signUpError) throw signUpError
        if (data.session) {
          router.push('/dashboard')
          return
        }

        setMessage('Account created. Check your email to confirm it before logging in.')
        return
      }

      if (mode === 'login') {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (loginError) throw loginError
        router.push('/dashboard')
        return
      }

      const redirectTo = `${window.location.origin}/login`
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      if (resetError) throw resetError
      setMessage(`Check your inbox. We sent a reset link to ${email}.`)
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-shell" aria-label={copy.heading}>
        <div className="auth-panel">
          {checkingSession ? (
            <p className="auth-loading">Checking your session...</p>
          ) : (
            <>
          {mode === 'reset' && (
            <Link className="auth-back" href="/login">
              ← Back to login
            </Link>
          )}

          <Link className="auth-logo" href="/">
            tiny<span>step</span>
          </Link>
          <p className="auth-tagline">{copy.tagline}</p>
          <h1 className="auth-heading">{copy.heading}</h1>

          <button className="auth-google-placeholder" type="button" disabled>
            <GoogleIcon />
            Continue with Google
            <span>Coming soon</span>
          </button>

          <div className="auth-divider">
            <span />
            <strong>or</strong>
            <span />
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <>
                <label htmlFor="name">Your name</label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Sarah"
                  value={name}
                  onChange={event => setName(event.target.value)}
                  required
                />
              </>
            )}

            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
            />

            {mode !== 'reset' && (
              <>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  minLength={6}
                  required
                />
              </>
            )}

            {mode === 'login' && (
              <Link className="auth-forgot" href="/reset">
                Forgot password?
              </Link>
            )}

            {error && <p className="auth-error">{error}</p>}
            {message && <p className="auth-success">{message}</p>}

            <button className="auth-primary" type="submit" disabled={loading}>
              {loading ? 'One tiny second...' : copy.primary}
            </button>
          </form>

          {mode === 'signup' && (
            <>
              <p className="auth-link-text">
                Already have one? <Link href="/login">Log in</Link>
              </p>
              <p className="auth-terms">
                By signing up you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
                No spam. Ever.
              </p>
            </>
          )}

          {mode === 'login' && (
            <>
              <p className="auth-link-text">
                Don&apos;t have an account? <Link href="/signup">Sign up free</Link>
              </p>
              <div className="auth-trial-note">
                <strong>🎉 7 days free</strong>
                <span>No credit card needed to start</span>
              </div>
            </>
          )}

          {mode === 'reset' && (
            <p className="auth-link-text">
              Remembered it? <Link href="/login">Log in</Link>
            </p>
          )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}
