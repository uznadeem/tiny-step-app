'use client'

import { useState } from 'react'

type LaunchSummary = {
  attempted: number
  sent: number
  failed: number
  batchLimit: number
  failures?: Array<{ id: string; email: string; error: string }>
}

export default function AdminLaunchButton() {
  const [sending, setSending] = useState(false)
  const [summary, setSummary] = useState<LaunchSummary | null>(null)
  const [error, setError] = useState('')

  const sendLaunchEmail = async () => {
    const confirmed = window.confirm(
      'Send the launch email to every subscribed waitlist user who has not received it yet?'
    )

    if (!confirmed) return

    try {
      setSending(true)
      setError('')
      setSummary(null)

      const response = await fetch('/admin/launch', {
        method: 'POST',
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || 'Launch email request failed.')
      }

      setSummary({
        attempted: data.attempted ?? 0,
        sent: data.sent ?? 0,
        failed: data.failed ?? 0,
        batchLimit: data.batchLimit ?? 0,
        failures: data.failures,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Launch email request failed.')
    } finally {
      setSending(false)
    }
  }

  return (
    <article className="admin-launch-card">
      <div>
        <span>Launch Email</span>
        <h2>Open the doors</h2>
        <p>Send the launch announcement to subscribed waitlist users who have not received it yet.</p>
      </div>

      <button type="button" onClick={sendLaunchEmail} disabled={sending}>
        {sending ? 'Sending...' : 'Launch app'}
      </button>

      {summary && (
        <p className={summary.failed ? 'admin-launch-result warning' : 'admin-launch-result'}>
          Sent {summary.sent} of {summary.attempted}. {summary.failed ? `${summary.failed} failed.` : 'All clear.'}
          {summary.attempted === summary.batchLimit ? ' Batch limit reached; run again for the next batch.' : ''}
        </p>
      )}

      {error && <p className="admin-launch-result warning">{error}</p>}
    </article>
  )
}
