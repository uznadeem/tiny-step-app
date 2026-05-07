import AdminShell from '@/components/AdminShell'
import { formatAdminDate, getAdminData } from '@/lib/server/admin-data'

export const dynamic = 'force-dynamic'

export default async function AdminEmailsPage() {
  const { emailRows } = await getAdminData()

  return (
    <AdminShell active="emails">
      <section className="admin-content">
        <div className="admin-section-head">
          <span>Emails</span>
          <h2>Email Activity</h2>
          <p>Successful email sends from waitlist, launch, and weekly nudge flows.</p>
        </div>

        <section className="admin-table-card admin-email-table">
          <div className="admin-table-head">
            <span>Email</span>
            <span>Email Type</span>
            <span>Sent At</span>
          </div>
          {emailRows.map(email => (
            <div className="admin-table-row" key={email.id}>
              <strong>{email.email}</strong>
              <span>{email.emailType}</span>
              <span>{formatAdminDate(email.sentAt)}</span>
            </div>
          ))}
          {!emailRows.length && <p className="admin-empty">No emails sent yet.</p>}
        </section>
      </section>
    </AdminShell>
  )
}
