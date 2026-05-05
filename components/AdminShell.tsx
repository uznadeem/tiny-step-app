import Link from 'next/link'
import type { ReactNode } from 'react'

type AdminShellProps = {
  active: 'overview' | 'users' | 'tasks'
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
              <button type="button" disabled><span>📧</span> Emails</button>
            </nav>
          </aside>

          {children}
        </div>
      </section>
    </main>
  )
}
