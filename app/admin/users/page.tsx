import AdminShell from '@/components/AdminShell'
import AdminWaitlistTable from '@/components/AdminWaitlistTable'
import { getAdminData } from '@/lib/server/admin-data'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const { users, waitlistRows } = await getAdminData()

  return (
    <AdminShell active="users">
      <section className="admin-content">
        <div className="admin-section-head">
          <span>Users</span>
          <h2>All Users</h2>
          <p>Accounts created through email/password or Google OAuth.</p>
        </div>

        <section className="admin-table-card">
          <div className="admin-table-head">
            <span>User</span>
            <span>Plan</span>
            <span>Tasks Done</span>
            <span>Status</span>
          </div>
          {users.map(user => (
            <div className="admin-table-row" key={user.id}>
              <strong>{user.email}</strong>
              <span>{user.plan}</span>
              <span>{user.tasksDone}</span>
              <em className={user.status.toLowerCase()}>{user.status}</em>
            </div>
          ))}
          {!users.length && <p className="admin-empty">No users yet.</p>}
        </section>

        <AdminWaitlistTable waitlistRows={waitlistRows} />
      </section>
    </AdminShell>
  )
}
