import AdminShell from '@/components/AdminShell'
import { formatAdminDate, formatCurrency, getAdminData } from '@/lib/server/admin-data'

export const dynamic = 'force-dynamic'

export default async function AdminRevenuePage() {
  const { overviewStats, revenueRows } = await getAdminData()
  const annualRunRate = overviewStats.mrr * 12

  return (
    <AdminShell active="revenue">
      <section className="admin-content">
        <div className="admin-section-head">
          <span>Revenue</span>
          <h2>Billing Overview</h2>
          <p>Subscription revenue from active Stripe-backed profiles.</p>
        </div>

        <div className="admin-stats">
          <article>
            <span>MRR</span>
            <strong>{formatCurrency(overviewStats.mrr)}</strong>
            <em className="up">↑ +{formatCurrency(overviewStats.mrrAddedThisWeek)}</em>
          </article>
          <article>
            <span>ARR</span>
            <strong>{formatCurrency(annualRunRate)}</strong>
            <em className="up">Projected from MRR</em>
          </article>
          <article>
            <span>Paying</span>
            <strong>{overviewStats.payingUsers}</strong>
            <em className="up">↑ +{overviewStats.payingUsersThisWeek} this week</em>
          </article>
          <article>
            <span>Churn</span>
            <strong>{overviewStats.churnRate}%</strong>
            <em className={overviewStats.churnRate > 0 ? 'down' : 'up'}>
              {overviewStats.churnRate > 0 ? 'Needs attention' : 'No churn yet'}
            </em>
          </article>
        </div>

        <div className="admin-charts">
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
              <strong>Paid users <span>{overviewStats.payingUsers}</span></strong>
              <small>{overviewStats.annualPaidUsers} annual · {overviewStats.monthlyPaidUsers} monthly</small>
            </footer>
          </article>

          <article className="admin-chart-card admin-plan-card">
            <h2>Trial funnel</h2>
            <div>
              <p><span>Trial users</span><strong>{overviewStats.trialPercent}%</strong></p>
              <div><span style={{ width: `${overviewStats.trialPercent}%` }} /></div>
            </div>
            <footer>
              <strong>Free trial <span>{overviewStats.trialUsers} users</span></strong>
              <small>Convert these users before trial expiry.</small>
            </footer>
          </article>
        </div>

        <section className="admin-table-card admin-revenue-table">
          <div className="admin-table-head">
            <span>Customer</span>
            <span>Plan</span>
            <span>MRR</span>
            <span>Status</span>
            <span>Renews / Ends</span>
          </div>
          {revenueRows.map(row => (
            <div className="admin-table-row" key={row.id}>
              <strong>{row.customer}</strong>
              <span>{row.plan}</span>
              <span>{formatCurrency(row.mrr)}</span>
              <em className={row.status.toLowerCase()}>{row.cancelAtPeriodEnd ? 'Cancels soon' : row.status}</em>
              <span>{row.renewsOrEndsAt ? formatAdminDate(row.renewsOrEndsAt) : '—'}</span>
            </div>
          ))}
          {!revenueRows.length && <p className="admin-empty">No paid subscriptions yet.</p>}
        </section>
      </section>
    </AdminShell>
  )
}
