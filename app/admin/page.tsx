import AdminLaunchButton from '@/components/AdminLaunchButton'
import AdminShell from '@/components/AdminShell'
import { getAdminData, isCompletedTask } from '@/lib/server/admin-data'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const { profiles, tasks, signupBars, users } = await getAdminData()
  const activeUsers = new Set(tasks.map(task => task.user_id)).size
  const completedTasks = tasks.filter(isCompletedTask).length

  return (
    <AdminShell active="overview">
      <section className="admin-content" id="overview">
        <div className="admin-stats">
          <article>
            <span>Total Users</span>
            <strong>{profiles.length}</strong>
            <em className="up">↑ +{signupBars.reduce((sum, day) => sum + day.count, 0)} this week</em>
          </article>
          <article>
            <span>Paying</span>
            <strong>142</strong>
            <em className="up">↑ +8 this week</em>
          </article>
          <article>
            <span>MRR</span>
            <strong>$994</strong>
            <em className="up">↑ +$56</em>
          </article>
          <article>
            <span>Churn</span>
            <strong>3.2%</strong>
            <em className="down">↓ -0.4%</em>
          </article>
        </div>

        <div className="admin-charts">
          <article className="admin-chart-card">
            <h2>New signups (last 7 days)</h2>
            <div className="admin-bars" aria-label="New signups chart">
              {signupBars.map((bar, index) => (
                <div className="admin-bar-wrap" key={`${bar.label}-${index}`}>
                  <span className="admin-bar" style={{ height: `${bar.height}%` }} title={`${bar.count} signups`} />
                  <small>{bar.count}</small>
                  <strong>{bar.label}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="admin-chart-card admin-plan-card">
            <h2>Plan split</h2>
            <div>
              <p><span>Annual ($49)</span><strong>63%</strong></p>
              <div><span style={{ width: '63%' }} /></div>
            </div>
            <div>
              <p><span>Monthly ($7)</span><strong>37%</strong></p>
              <div><span className="coral" style={{ width: '37%' }} /></div>
            </div>
            <footer>
              <strong>Free trial <span>705 users</span></strong>
              <small>83% still in trial window</small>
            </footer>
          </article>
        </div>

        <AdminLaunchButton />

        <section className="admin-table-card">
          <div className="admin-table-head">
            <span>User</span>
            <span>Plan</span>
            <span>Tasks Done</span>
            <span>Status</span>
          </div>
          {users.slice(0, 5).map(user => (
            <div className="admin-table-row" key={user.id}>
              <strong>{user.email}</strong>
              <span>{user.plan}</span>
              <span>{user.tasksDone}</span>
              <em className={user.status.toLowerCase()}>{user.status}</em>
            </div>
          ))}
          {!users.length && <p className="admin-empty">No users yet.</p>}
        </section>

        <p className="admin-footnote">
          {completedTasks} completed tasks across {activeUsers} active users.
        </p>
      </section>
    </AdminShell>
  )
}
