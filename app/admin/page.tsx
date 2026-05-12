import AdminLaunchButton from '@/components/AdminLaunchButton'
import AdminShell from '@/components/AdminShell'
import AdminWaitlistTable from '@/components/AdminWaitlistTable'
import { getAdminData, isCompletedTask } from '@/lib/server/admin-data'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const { tasks, signupBars, overviewStats, users, waitlistRows } = await getAdminData()
  const activeUsers = new Set(tasks.map(task => task.user_id)).size
  const completedTasks = tasks.filter(isCompletedTask).length

  return (
    <AdminShell active="overview">
      <section className="admin-content" id="overview">
        <div className="admin-stats">
          <article>
            <span>Total Users</span>
            <strong>{overviewStats.totalUsers}</strong>
            <em className="up">↑ +{overviewStats.signupsThisWeek} this week</em>
          </article>
          <article>
            <span>Paying</span>
            <strong>{overviewStats.payingUsers}</strong>
            <em className="up">↑ +{overviewStats.payingUsersThisWeek} this week</em>
          </article>
          <article>
            <span>MRR</span>
            <strong>${overviewStats.mrr}</strong>
            <em className="up">↑ +${overviewStats.mrrAddedThisWeek}</em>
          </article>
          <article>
            <span>Churn</span>
            <strong>{overviewStats.churnRate}%</strong>
            <em className={overviewStats.churnRate > 0 ? 'down' : 'up'}>
              {overviewStats.churnRate > 0 ? '↓' : '↑'} {overviewStats.churnRate}%
            </em>
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
              <p><span>Annual ($49)</span><strong>{overviewStats.annualPlanPercent}%</strong></p>
              <div><span style={{ width: `${overviewStats.annualPlanPercent}%` }} /></div>
            </div>
            <div>
              <p><span>Monthly ($7)</span><strong>{overviewStats.monthlyPlanPercent}%</strong></p>
              <div><span className="coral" style={{ width: `${overviewStats.monthlyPlanPercent}%` }} /></div>
            </div>
            <footer>
              <strong>Free trial <span>{overviewStats.trialUsers} users</span></strong>
              <small>{overviewStats.trialPercent}% still in trial window</small>
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

        <AdminWaitlistTable waitlistRows={waitlistRows} />
      </section>
    </AdminShell>
  )
}
