import { type AdminWaitlistRow, formatAdminDateTime } from '@/lib/server/admin-data'

type AdminWaitlistTableProps = {
  waitlistRows: AdminWaitlistRow[]
}

export default function AdminWaitlistTable({ waitlistRows }: AdminWaitlistTableProps) {
  return (
    <div className="admin-table-block">
      <div className="admin-section-head">
        <span>Waitlist</span>
        <h2>Waitlist Users</h2>
        <p>People who joined the Tinystep waitlist and their email send status.</p>
      </div>

      <section className="admin-table-card admin-waitlist-table">
        <div className="admin-table-head">
          <span>First Name</span>
          <span>Email</span>
          <span>Welcome Sent At</span>
          <span>Followup Sent At</span>
          <span>Launch Sent At</span>
          <span>Status</span>
        </div>
        {waitlistRows.map(subscriber => (
          <div className="admin-table-row" key={subscriber.id}>
            <strong>{subscriber.firstName}</strong>
            <span>{subscriber.email}</span>
            <span>{formatAdminDateTime(subscriber.welcomeSentAt)}</span>
            <span>{formatAdminDateTime(subscriber.followupSentAt)}</span>
            <span>{formatAdminDateTime(subscriber.launchSentAt)}</span>
            <em className={subscriber.status.toLowerCase()}>{subscriber.status}</em>
          </div>
        ))}
        {!waitlistRows.length && <p className="admin-empty">No waitlist users yet.</p>}
      </section>
    </div>
  )
}
