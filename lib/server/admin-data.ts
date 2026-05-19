import { createSupabaseAdminClient } from '@/lib/server/supabase-admin'

export type AdminProfile = {
  id: string
  email: string | null
  display_name: string | null
  status: 'trial' | 'active' | 'inactive'
  stripe_subscription_id: string | null
  plan_interval: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean | null
  stripe_status: string | null
  created_at: string
}

export type AdminSubtask = {
  description: string
  status: string
  sort_order: number
  completed_at: string | null
}

export type AdminTask = {
  id: string
  user_id: string
  input_text: string
  energy_level: number | null
  created_at: string
  subtasks: AdminSubtask[]
}

export type AdminUserRow = {
  id: string
  email: string
  plan: string
  tasksDone: number
  totalTasks: number
  status: 'Trial' | 'Active' | 'Inactive'
}

export type AdminTaskRow = {
  id: string
  inputText: string
  userEmail: string
  progress: string
  status: 'Completed' | 'In progress'
  createdAt: string
}

export type AdminEmailLog = {
  id: string
  email: string
  email_type: string
  sent_at: string
}

export type AdminEmailRow = {
  id: string
  email: string
  emailType: string
  sentAt: string
}

export type AdminWaitlistSubscriber = {
  id: string
  first_name: string | null
  email: string
  welcome_sent_at: string | null
  followup_sent_at: string | null
  launch_sent_at: string | null
  status: string
}

export type AdminWaitlistRow = {
  id: string
  firstName: string
  email: string
  welcomeSentAt: string | null
  followupSentAt: string | null
  launchSentAt: string | null
  status: string
}

export type AdminRevenueRow = {
  id: string
  customer: string
  plan: string
  mrr: number
  status: 'Trial' | 'Active' | 'Inactive'
  stripeStatus: string
  renewsOrEndsAt: string | null
  cancelAtPeriodEnd: boolean
}

export type AdminOverviewStats = {
  totalUsers: number
  signupsThisWeek: number
  payingUsers: number
  payingUsersThisWeek: number
  mrr: number
  mrrAddedThisWeek: number
  churnRate: number
  annualPaidUsers: number
  monthlyPaidUsers: number
  annualPlanPercent: number
  monthlyPlanPercent: number
  trialUsers: number
  trialPercent: number
}

const PROFILE_STATUS_LABELS: Record<AdminProfile['status'], AdminUserRow['status']> = {
  trial: 'Trial',
  active: 'Active',
  inactive: 'Inactive',
}

const MONTHLY_PRICE = 7
const ANNUAL_PRICE = 49

function isCurrentPaidProfile(profile: AdminProfile) {
  if (profile.status !== 'active' || !profile.stripe_subscription_id) {
    return false
  }

  if (!profile.current_period_end) {
    return profile.stripe_status === 'active' || profile.stripe_status === 'trialing'
  }

  return new Date(profile.current_period_end).getTime() > Date.now()
}

function hasHadPaidSubscription(profile: AdminProfile) {
  return Boolean(profile.stripe_subscription_id)
}

function isCurrentWeekDate(value: string) {
  const date = new Date(value)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  return date.getTime() >= sevenDaysAgo.getTime()
}

function getPlanLabel(profile: AdminProfile) {
  if (profile.plan_interval === 'annual') return 'Annual'
  if (profile.plan_interval === 'monthly') return 'Monthly'
  if (profile.status === 'trial') return 'Trial'

  return 'No plan'
}

function getMonthlyRecurringRevenue(profile: AdminProfile) {
  if (!isCurrentPaidProfile(profile)) return 0
  if (profile.plan_interval === 'annual') return ANNUAL_PRICE / 12
  if (profile.plan_interval === 'monthly') return MONTHLY_PRICE

  return 0
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function isCompletedTask(task: AdminTask) {
  return task.subtasks.length > 0 && task.subtasks.every(subtask => subtask.status === 'completed')
}

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getLastSevenDays() {
  const today = new Date()

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))

    return {
      key: formatDateKey(date),
      label: date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 1),
    }
  })
}

export function buildSignupCounts(profiles: AdminProfile[]) {
  const days = getLastSevenDays()
  const countsByDay = new Map(days.map(day => [day.key, 0]))

  profiles.forEach(profile => {
    const dayKey = formatDateKey(new Date(profile.created_at))
    if (countsByDay.has(dayKey)) {
      countsByDay.set(dayKey, (countsByDay.get(dayKey) || 0) + 1)
    }
  })

  const counts = days.map(day => countsByDay.get(day.key) || 0)
  const maxCount = Math.max(...counts, 1)

  return days.map((day, index) => ({
    label: day.label,
    date: day.key,
    count: counts[index],
    height: counts[index] ? Math.max(12, Math.round((counts[index] / maxCount) * 90)) : 0,
  }))
}

export function buildUserRows(profiles: AdminProfile[], tasks: AdminTask[]) {
  const tasksByUser = new Map<string, AdminTask[]>()

  tasks.forEach(task => {
    tasksByUser.set(task.user_id, [...(tasksByUser.get(task.user_id) || []), task])
  })

  return profiles.map((profile): AdminUserRow => {
    const userTasks = tasksByUser.get(profile.id) || []
    const tasksDone = userTasks.filter(isCompletedTask).length

    return {
      id: profile.id,
      email: profile.email || profile.display_name || 'Unknown user',
      plan: getPlanLabel(profile),
      tasksDone,
      totalTasks: userTasks.length,
      status: PROFILE_STATUS_LABELS[profile.status] || 'Trial',
    }
  })
}

export function buildTaskRows(profiles: AdminProfile[], tasks: AdminTask[]) {
  const emailByUser = new Map(profiles.map(profile => [profile.id, profile.email || profile.display_name || 'Unknown user']))

  return tasks.map((task): AdminTaskRow => {
    const completedCount = task.subtasks.filter(subtask => subtask.status === 'completed').length

    return {
      id: task.id,
      inputText: task.input_text,
      userEmail: emailByUser.get(task.user_id) || 'Unknown user',
      progress: `${completedCount}/${task.subtasks.length}`,
      status: isCompletedTask(task) ? 'Completed' : 'In progress',
      createdAt: task.created_at,
    }
  })
}

export function buildEmailRows(emailLogs: AdminEmailLog[]) {
  return emailLogs.map((log): AdminEmailRow => ({
    id: log.id,
    email: log.email,
    emailType: log.email_type,
    sentAt: log.sent_at,
  }))
}

export function buildWaitlistRows(waitlistSubscribers: AdminWaitlistSubscriber[]) {
  return waitlistSubscribers.map((subscriber): AdminWaitlistRow => ({
    id: subscriber.id,
    firstName: subscriber.first_name || '—',
    email: subscriber.email,
    welcomeSentAt: subscriber.welcome_sent_at,
    followupSentAt: subscriber.followup_sent_at,
    launchSentAt: subscriber.launch_sent_at,
    status: subscriber.status,
  }))
}

export function buildRevenueRows(profiles: AdminProfile[]) {
  return profiles
    .filter(profile => profile.stripe_subscription_id || profile.status === 'active')
    .map((profile): AdminRevenueRow => ({
      id: profile.id,
      customer: profile.email || profile.display_name || 'Unknown user',
      plan: getPlanLabel(profile),
      mrr: getMonthlyRecurringRevenue(profile),
      status: PROFILE_STATUS_LABELS[profile.status] || 'Trial',
      stripeStatus: profile.stripe_status || 'none',
      renewsOrEndsAt: profile.current_period_end,
      cancelAtPeriodEnd: Boolean(profile.cancel_at_period_end),
    }))
}

export function formatAdminDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatAdminDateTime(value: string | null) {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function buildOverviewStats(profiles: AdminProfile[]): AdminOverviewStats {
  const paidProfiles = profiles.filter(isCurrentPaidProfile)
  const weeklyProfiles = profiles.filter(profile => isCurrentWeekDate(profile.created_at))
  const weeklyPaidProfiles = weeklyProfiles.filter(isCurrentPaidProfile)
  const annualPaidUsers = paidProfiles.filter(profile => profile.plan_interval === 'annual').length
  const monthlyPaidUsers = paidProfiles.filter(profile => profile.plan_interval === 'monthly').length
  const paidPlanCount = annualPaidUsers + monthlyPaidUsers
  const inactivePaidUsers = profiles.filter(
    profile => profile.status === 'inactive' && hasHadPaidSubscription(profile)
  ).length
  const churnDenominator = paidProfiles.length + inactivePaidUsers
  const trialUsers = profiles.filter(profile => profile.status === 'trial').length

  return {
    totalUsers: profiles.length,
    signupsThisWeek: weeklyProfiles.length,
    payingUsers: paidProfiles.length,
    payingUsersThisWeek: weeklyPaidProfiles.length,
    mrr: Math.round(paidProfiles.reduce((sum, profile) => sum + getMonthlyRecurringRevenue(profile), 0)),
    mrrAddedThisWeek: Math.round(weeklyPaidProfiles.reduce((sum, profile) => sum + getMonthlyRecurringRevenue(profile), 0)),
    churnRate: churnDenominator ? Math.round((inactivePaidUsers / churnDenominator) * 1000) / 10 : 0,
    annualPaidUsers,
    monthlyPaidUsers,
    annualPlanPercent: paidPlanCount ? Math.round((annualPaidUsers / paidPlanCount) * 100) : 0,
    monthlyPlanPercent: paidPlanCount ? Math.round((monthlyPaidUsers / paidPlanCount) * 100) : 0,
    trialUsers,
    trialPercent: profiles.length ? Math.round((trialUsers / profiles.length) * 100) : 0,
  }
}

export async function getAdminData() {
  const supabase = createSupabaseAdminClient()

  const [
    { data: profiles, error: profilesError },
    { data: tasks, error: tasksError },
    { data: emailLogs, error: emailLogsError },
    { data: waitlistSubscribers, error: waitlistSubscribersError },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, email, display_name, status, stripe_subscription_id, plan_interval, current_period_end, cancel_at_period_end, stripe_status, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('tasks')
      .select(`
        id,
        user_id,
        input_text,
        energy_level,
        created_at,
        subtasks (
          description,
          status,
          sort_order,
          completed_at
        )
      `)
      .order('created_at', { ascending: false }),
    supabase
      .from('email_logs')
      .select('id, email, email_type, sent_at')
      .order('sent_at', { ascending: false })
      .limit(100),
    supabase
      .from('waitlist_subscribers')
      .select('id, first_name, email, welcome_sent_at, followup_sent_at, launch_sent_at, status')
      .order('email', { ascending: true }),
  ])

  if (profilesError || tasksError || emailLogsError || waitlistSubscribersError) {
    throw new Error(
      profilesError?.message ||
      tasksError?.message ||
      emailLogsError?.message ||
      waitlistSubscribersError?.message ||
      'Unable to load admin data.'
    )
  }

  const profileRows = (profiles || []) as AdminProfile[]
  const taskRows = (tasks || []).map(task => ({
    ...task,
    subtasks: [...(task.subtasks || [])].sort((a, b) => a.sort_order - b.sort_order),
  })) as AdminTask[]

  return {
    profiles: profileRows,
    tasks: taskRows,
    emailRows: buildEmailRows((emailLogs || []) as AdminEmailLog[]),
    waitlistRows: buildWaitlistRows((waitlistSubscribers || []) as AdminWaitlistSubscriber[]),
    signupBars: buildSignupCounts(profileRows),
    overviewStats: buildOverviewStats(profileRows),
    users: buildUserRows(profileRows, taskRows),
    revenueRows: buildRevenueRows(profileRows),
    taskRows: buildTaskRows(profileRows, taskRows),
  }
}
