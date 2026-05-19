'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  formatBillingDate,
  getBillingAccess,
  getTrialDaysRemaining,
  type BillingAccess,
  type BillingProfile,
} from '@/lib/billing'
import { supabase } from '@/lib/supabase/client'
import styles from './BillingPage.module.css'

type BillingState = {
  displayName: string
  access: BillingAccess
}

const EMPTY_BILLING_ACCESS = getBillingAccess(null)

function planLabel(plan: BillingAccess['planInterval']) {
  if (plan === 'monthly') return 'Monthly plan'
  if (plan === 'annual') return 'Annual plan'

  return 'No paid plan'
}

export default function BillingPage() {
  const router = useRouter()
  const [state, setState] = useState<BillingState | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutPlan, setCheckoutPlan] = useState<'monthly' | 'annual' | null>(null)
  const [openingPortal, setOpeningPortal] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadBilling = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) {
        router.replace('/login')
        return
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('display_name, status, plan_interval, trial_ends_at, current_period_end, cancel_at_period_end, stripe_status')
        .eq('id', user.id)
        .maybeSingle()

      if (!active) return

      if (profileError) {
        setError(profileError.message)
        setState({
          displayName: user.user_metadata?.display_name || 'Tinystep friend',
          access: EMPTY_BILLING_ACCESS,
        })
      } else {
        setState({
          displayName: data?.display_name || user.user_metadata?.display_name || 'Tinystep friend',
          access: getBillingAccess(data as BillingProfile | null),
        })
      }

      setLoading(false)
    }

    loadBilling()

    return () => {
      active = false
    }
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const startCheckout = async (plan: 'monthly' | 'annual') => {
    setCheckoutPlan(plan)
    setError('')

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token

      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      })

      const body = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(typeof body?.error === 'string' ? body.error : 'Unable to start checkout.')
      }

      if (typeof body?.url !== 'string') {
        throw new Error('Checkout URL was not returned.')
      }

      window.location.href = body.url
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Unable to start checkout.')
      setCheckoutPlan(null)
    }
  }

  const openBillingPortal = async () => {
    setOpeningPortal(true)
    setError('')

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token

      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const body = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(typeof body?.error === 'string' ? body.error : 'Unable to open billing portal.')
      }

      if (typeof body?.url !== 'string') {
        throw new Error('Billing portal URL was not returned.')
      }

      window.location.href = body.url
    } catch (portalError) {
      setError(portalError instanceof Error ? portalError.message : 'Unable to open billing portal.')
      setOpeningPortal(false)
    }
  }

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-loading">Loading billing...</div>
      </main>
    )
  }

  const access = state?.access || EMPTY_BILLING_ACCESS
  const trialDaysRemaining = getTrialDaysRemaining(access.trialEndsAt)
  const isActiveSubscription = access.status === 'active'
  const isTrial = access.status === 'trial' && trialDaysRemaining > 0
  const isLocked = !access.allowed
  const planPrice = access.planInterval === 'annual' ? '$49' : '$7'
  const planUnit = access.planInterval === 'annual' ? '/ year' : '/ month'

  return (
    <main className="profile-page">
      <section className="profile-shell">
        <div className="profile-window">
          <aside className="profile-sidebar">
            <Link className="profile-logo" href="/dashboard">tiny<span>step</span></Link>
            <div className="profile-avatar">🌸</div>
            <h1>{state?.displayName || 'Tinystep friend'}</h1>
            <p>{access.planInterval === 'annual' ? '⭐ Yearly plan' : access.planInterval === 'monthly' ? '⭐ Monthly plan' : '⭐ Trial plan'}</p>

            <nav className="profile-nav" aria-label="Billing">
              <Link href="/dashboard"><span>🏠</span> Home</Link>
              <Link href="/profile"><span>⚙️</span> Preferences</Link>
              <Link href="/history"><span>✅</span> Task History</Link>
              <Link className="active" href="/billing"><span>💳</span> Billing</Link>
              <button className="logout" type="button" onClick={handleSignOut}><span>🚪</span> Log out</button>
            </nav>
          </aside>

          <section className="profile-content">
            <div className={styles.heading}>
              <h2>Billing & Subscription</h2>
              <p>Choose the plan that keeps tiny steps available when you need them.</p>
            </div>

            {error && <p className="profile-error">{error}</p>}

            <section className={styles.statusCard}>
              <span className={styles.statusLabel}>Current Plan</span>
              <h3 className={styles.statusTitle}>
                {isActiveSubscription ? <>{planPrice} <span>{planUnit}</span></> : isTrial ? `${trialDaysRemaining} day trial` : 'Trial ended'}
              </h3>
              <p className={styles.statusCopy}>
                {isActiveSubscription
                  ? access.cancelAtPeriodEnd
                    ? `Your access stays active until ${formatBillingDate(access.currentPeriodEnd)}.`
                    : `Next billing period ends ${formatBillingDate(access.currentPeriodEnd)}.`
                  : isTrial
                    ? `Your free trial ends on ${formatBillingDate(access.trialEndsAt)}. Pick a plan anytime to keep going after that.`
                    : 'Choose a monthly or annual plan to continue using Tinystep.'}
              </p>
              {isActiveSubscription && (
                <div className={styles.statusActions}>
                  <button type="button" onClick={openBillingPortal} disabled={openingPortal}>
                    {openingPortal ? 'Opening...' : 'Manage billing'}
                  </button>
                  <button className={styles.secondaryAction} type="button" onClick={openBillingPortal} disabled={openingPortal}>
                    Cancel plan
                  </button>
                </div>
              )}
            </section>

            {isActiveSubscription ? (
              <>
                <section className={styles.portalCard}>
                  <h3>Payment method</h3>
                  <div className={styles.portalRow}>
                    <div>
                      <strong>Stripe managed</strong>
                      <p>Payment methods are securely handled in Stripe.</p>
                    </div>
                    <button type="button" onClick={openBillingPortal} disabled={openingPortal}>Update</button>
                  </div>
                </section>

                <section className={styles.portalCard}>
                  <h3>Invoice history</h3>
                  <div className={styles.invoiceRows}>
                    <div>
                      <span>{formatBillingDate(access.currentPeriodEnd)}</span>
                      <strong>{planLabel(access.planInterval)}</strong>
                      <em>{planPrice}.00</em>
                      <button type="button" onClick={openBillingPortal} disabled={openingPortal}>PDF</button>
                    </div>
                  </div>
                  <p>Open Stripe billing to view full invoice history.</p>
                </section>
              </>
            ) : (
              <>
                <div className={styles.plans}>
                  <article className={styles.planCard}>
                    <strong>Monthly</strong>
                    <div className={styles.price}>$7 <span>/ month</span></div>
                    <p>Flexible monthly access for tiny steps, task breakdowns, and stuck support.</p>
                    <button type="button" disabled={Boolean(checkoutPlan)} onClick={() => startCheckout('monthly')}>
                      {checkoutPlan === 'monthly' ? 'Opening checkout...' : 'Choose monthly'}
                    </button>
                  </article>

                  <article className={styles.planCard}>
                    <strong>Annual</strong>
                    <div className={styles.price}>$49 <span>/ year</span></div>
                    <p>Best value for steady support across the year, with the same full app access.</p>
                    <button type="button" disabled={Boolean(checkoutPlan)} onClick={() => startCheckout('annual')}>
                      {checkoutPlan === 'annual' ? 'Opening checkout...' : 'Choose annual'}
                    </button>
                  </article>
                </div>

                <section className={styles.detailsCard}>
                  <h3>Subscription details</h3>
                  <div className={styles.detailRows}>
                    <div>
                      <span>Status</span>
                      <strong>{isLocked ? 'Payment required' : 'Trial'}</strong>
                    </div>
                    <div>
                      <span>Plan</span>
                      <strong>{planLabel(access.planInterval)}</strong>
                    </div>
                    <div>
                      <span>Trial ends</span>
                      <strong>{formatBillingDate(access.trialEndsAt)}</strong>
                    </div>
                    <div>
                      <span>Current period ends</span>
                      <strong>{formatBillingDate(access.currentPeriodEnd)}</strong>
                    </div>
                  </div>
                </section>
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  )
}
