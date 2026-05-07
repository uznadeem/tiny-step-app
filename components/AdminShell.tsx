import Link from 'next/link'
import type { ReactNode } from 'react'

type AdminShellProps = {
  active: 'overview' | 'users' | 'tasks' | 'emails'
  children: ReactNode
}

export default function AdminShell({ active, children }: AdminShellProps) {
  return (
    <main className="admin-page">
      <section className="admin-frame">
        <header className="admin-top">
          <h1>tiny<span>step</span> /admin</h1>
          <span>🔒 Private</span>
        </header>

        <div className="admin-layout">
          <aside className="admin-sidebar">
            <nav aria-label="Admin navigation">
              <Link className={active === 'overview' ? 'active' : ''} href="/admin"><span>📊</span> Overview</Link>
              <Link className={active === 'users' ? 'active' : ''} href="/admin/users"><span>👩</span> Users</Link>
              <button type="button" disabled><span>💳</span> Revenue</button>
              <Link className={active === 'tasks' ? 'active' : ''} href="/admin/tasks"><span>✅</span> Tasks</Link>
              <Link className={active === 'emails' ? 'active' : ''} href="/admin/emails"><span>📧</span> Emails</Link>
            </nav>
          </aside>

          {children}
        </div>
      </section>
    </main>
  )
}
