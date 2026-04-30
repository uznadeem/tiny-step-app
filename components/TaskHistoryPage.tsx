'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

type SubtaskStatus = 'pending' | 'completed'
type HistoryFilter = 'all' | 'completed' | 'in_progress'

type HistorySubtask = {
  id: string
  description: string
  status: SubtaskStatus
  sort_order: number
  time_minutes: number | null
  tip: string | null
  stuck_advice: string | null
  completed_at: string | null
}

type HistoryTask = {
  id: string
  input_text: string
  energy_level: number | null
  brain_dump: string | null
  created_at: string
  subtasks: HistorySubtask[]
}

function isTaskCompleted(task: HistoryTask) {
  return task.subtasks.length > 0 && task.subtasks.every(subtask => subtask.status === 'completed')
}

function formatRelativeDate(value: string) {
  const date = new Date(value)
  const today = new Date()
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diffDays = Math.round((todayOnly.getTime() - dateOnly.getTime()) / 86400000)

  if (diffDays <= 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function TaskHistoryPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [tasks, setTasks] = useState<HistoryTask[]>([])
  const [filter, setFilter] = useState<HistoryFilter>('all')
  const [expandedTaskId, setExpandedTaskId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadHistory = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) {
        router.replace('/login')
        return
      }

      const [{ data: profile }, { data: taskRows, error: historyError }] = await Promise.all([
        supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('tasks')
          .select(`
            id,
            input_text,
            energy_level,
            brain_dump,
            created_at,
            subtasks (
              id,
              description,
              status,
              sort_order,
              time_minutes,
              tip,
              stuck_advice,
              completed_at
            )
          `)
          .order('created_at', { ascending: false }),
      ])

      if (!active) return

      setDisplayName(profile?.display_name || user.user_metadata?.display_name || 'Tinystep friend')
      setTasks(
        (taskRows || []).map(task => ({
          ...task,
          subtasks: [...(task.subtasks || [])].sort((a, b) => a.sort_order - b.sort_order),
        })) as HistoryTask[]
      )
      setError(historyError ? historyError.message : '')
      setLoading(false)
    }

    loadHistory()

    return () => {
      active = false
    }
  }, [router])

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const completed = isTaskCompleted(task)
      if (filter === 'completed') return completed
      if (filter === 'in_progress') return !completed
      return true
    })
  }, [filter, tasks])

  const completedThisMonth = useMemo(() => {
    const now = new Date()

    return tasks.filter(task => {
      if (!isTaskCompleted(task)) return false

      const latestCompletion = task.subtasks
        .map(subtask => subtask.completed_at)
        .filter((value): value is string => Boolean(value))
        .sort()
        .at(-1)

      if (!latestCompletion) return false

      const completedAt = new Date(latestCompletion)
      return completedAt.getMonth() === now.getMonth() && completedAt.getFullYear() === now.getFullYear()
    }).length
  }, [tasks])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find(item => item.id === taskId)
    const subtask = task?.subtasks.find(item => item.id === subtaskId)

    if (!subtask) return

    const nextStatus: SubtaskStatus = subtask.status === 'completed' ? 'pending' : 'completed'
    const nextCompletedAt = nextStatus === 'completed' ? new Date().toISOString() : null
    const previousTasks = tasks

    setTasks(current =>
      current.map(item =>
        item.id === taskId
          ? {
              ...item,
              subtasks: item.subtasks.map(step =>
                step.id === subtaskId
                  ? { ...step, status: nextStatus, completed_at: nextCompletedAt }
                  : step
              ),
            }
          : item
      )
    )

    const { error: updateError } = await supabase
      .from('subtasks')
      .update({
        status: nextStatus,
        completed_at: nextCompletedAt,
      })
      .eq('id', subtaskId)

    if (updateError) {
      setTasks(previousTasks)
      setError(updateError.message)
    } else {
      setError('')
    }
  }

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-loading">Loading task history...</div>
      </main>
    )
  }

  return (
    <main className="profile-page">
      <section className="profile-shell">
        <div className="profile-window">
          <aside className="profile-sidebar">
            <Link className="profile-logo" href="/dashboard">tiny<span>step</span></Link>
            <div className="profile-avatar">🌸</div>
            <h1>{displayName}</h1>
            <p>⭐ Yearly plan</p>

            <nav className="profile-nav" aria-label="Task history">
              <Link href="/profile"><span>⚙️</span> Preferences</Link>
              <Link className="active" href="/history"><span>✅</span> Task History</Link>
              <button type="button" disabled><span>💳</span> Billing</button>
              <button className="logout" type="button" onClick={handleSignOut}><span>🚪</span> Log out</button>
            </nav>
          </aside>

          <section className="profile-content history-content">
            <div className="history-heading">
              <h2>Task History</h2>
              <div className="history-filters" aria-label="Filter tasks">
                <button className={filter === 'all' ? 'active all' : ''} type="button" onClick={() => setFilter('all')}>All</button>
                <button className={filter === 'completed' ? 'active completed' : ''} type="button" onClick={() => setFilter('completed')}>Completed</button>
                <button className={filter === 'in_progress' ? 'active progress' : ''} type="button" onClick={() => setFilter('in_progress')}>In progress</button>
              </div>
            </div>

            {error && <p className="profile-error">{error}</p>}

            <div className="history-list">
              {filteredTasks.map(task => {
                const completed = isTaskCompleted(task)
                const doneCount = task.subtasks.filter(subtask => subtask.status === 'completed').length
                const expanded = expandedTaskId === task.id

                return (
                  <article className={`history-task${expanded ? ' expanded' : ''}`} key={task.id}>
                    <button
                      className="history-task-row"
                      type="button"
                      onClick={() => setExpandedTaskId(current => (current === task.id ? '' : task.id))}
                      aria-expanded={expanded}
                    >
                      <span className={`history-dot${completed ? ' done' : ''}`} />
                      <strong>{task.input_text}</strong>
                      <span className="history-progress">{doneCount}/{task.subtasks.length}</span>
                      <time>{formatRelativeDate(task.created_at)}</time>
                    </button>

                    {expanded && (
                      <div className="history-subtasks">
                        {task.subtasks.map(subtask => (
                          <div className={`history-subtask${subtask.status === 'completed' ? ' done' : ''}`} key={subtask.id}>
                            <button
                              type="button"
                              onClick={() => toggleSubtask(task.id, subtask.id)}
                              aria-label={subtask.status === 'completed' ? 'Mark subtask incomplete' : 'Mark subtask complete'}
                            >
                              {subtask.status === 'completed' ? '✓' : subtask.sort_order}
                            </button>
                            <div>
                              <p>{subtask.description}</p>
                              {subtask.time_minutes && <small>⏱ ~{subtask.time_minutes} min</small>}
                              {subtask.tip && <em>💡 {subtask.tip}</em>}
                              {subtask.stuck_advice && <em>😵‍💫 {subtask.stuck_advice}</em>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                )
              })}
            </div>

            {!filteredTasks.length && (
              <p className="history-empty">
                {filter === 'all' ? 'No saved tasks yet. Make something tiny from the dashboard first.' : 'No tasks in this filter yet.'}
              </p>
            )}

            {!!tasks.length && <p className="history-monthly">{completedThisMonth} tasks completed this month 🎉</p>}
          </section>
        </div>
      </section>
    </main>
  )
}
