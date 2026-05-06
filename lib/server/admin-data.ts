import { createSupabaseAdminClient } from '@/lib/server/supabase-admin'

export type AdminProfile = {
  id: string
  email: string | null
  display_name: string | null
  status: 'trial' | 'active' | 'inactive'
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

const PLAN_SEQUENCE = ['Annual', 'Monthly', 'Trial', 'Annual', 'Monthly']
const PROFILE_STATUS_LABELS: Record<AdminProfile['status'], AdminUserRow['status']> = {
  trial: 'Trial',
  active: 'Active',
  inactive: 'Inactive',
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

  return profiles.map((profile, index): AdminUserRow => {
    const userTasks = tasksByUser.get(profile.id) || []
    const tasksDone = userTasks.filter(isCompletedTask).length

    return {
      id: profile.id,
      email: profile.email || profile.display_name || 'Unknown user',
      plan: PLAN_SEQUENCE[index % PLAN_SEQUENCE.length],
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

export function formatAdminDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export async function getAdminData() {
  const supabase = createSupabaseAdminClient()

  const [{ data: profiles, error: profilesError }, { data: tasks, error: tasksError }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, email, display_name, status, created_at')
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
  ])

  if (profilesError || tasksError) {
    throw new Error(profilesError?.message || tasksError?.message || 'Unable to load admin data.')
  }

  const profileRows = (profiles || []) as AdminProfile[]
  const taskRows = (tasks || []).map(task => ({
    ...task,
    subtasks: [...(task.subtasks || [])].sort((a, b) => a.sort_order - b.sort_order),
  })) as AdminTask[]

  return {
    profiles: profileRows,
    tasks: taskRows,
    signupBars: buildSignupCounts(profileRows),
    users: buildUserRows(profileRows, taskRows),
    taskRows: buildTaskRows(profileRows, taskRows),
  }
}
