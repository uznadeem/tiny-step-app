'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

const ENERGY_LEVELS = [
  { label: '🪫 Running on fumes', value: 1, color: '#f87171' },
  { label: '😴 Low but here', value: 2, color: '#fb923c' },
  { label: '✨ Medium energy', value: 3, color: '#facc15' },
  { label: '⚡ Feeling good', value: 4, color: '#4ade80' },
  { label: '🔥 Hyperfocus mode', value: 5, color: '#60a5fa' },
]

const AFFIRMATIONS = [
  "You started. That's everything. 💛",
  'One tiny step is still a step. 🌱',
  'Your brain works differently, not wrongly. ✨',
  'Progress > perfection, always. 🌸',
  'Done is better than perfect. 💪',
  "You're doing amazing, seriously. 🦋",
  'Celebrate every single checkbox. 🎉',
]

type Step = {
  id?: string
  text: string
  time: number
  tip?: string | null
  stuckAdvice?: string | null
  done: boolean
}

type ProfilePreferences = {
  confettiOnCompletion: boolean
  defaultEnergy: number
}

const DEFAULT_PROFILE_PREFERENCES: ProfilePreferences = {
  confettiOnCompletion: true,
  defaultEnergy: 3,
}

type ConfettiPiece = {
  id: number
  left: number
  size: number
  delay: number
  duration: number
  rotate: number
  round: boolean
}

const CONFETTI_PIECES: ConfettiPiece[] = Array.from({ length: 28 }, (_, id) => {
  const seed = id + 1

  return {
    id,
    left: (seed * 37) % 100,
    size: 6 + ((seed * 11) % 8),
    delay: ((seed * 7) % 5) / 10,
    duration: 1.5 + ((seed * 13) % 20) / 10,
    rotate: (seed * 53) % 360,
    round: seed % 2 === 0,
  }
})

function normalizePlannerPreferences(value: unknown): ProfilePreferences {
  if (!value || typeof value !== 'object') return DEFAULT_PROFILE_PREFERENCES

  const preferences = value as Partial<ProfilePreferences>

  return {
    confettiOnCompletion:
      typeof preferences.confettiOnCompletion === 'boolean'
        ? preferences.confettiOnCompletion
        : DEFAULT_PROFILE_PREFERENCES.confettiOnCompletion,
    defaultEnergy:
      typeof preferences.defaultEnergy === 'number' && ENERGY_LEVELS.some(level => level.value === preferences.defaultEnergy)
        ? preferences.defaultEnergy
        : DEFAULT_PROFILE_PREFERENCES.defaultEnergy,
  }
}

function makeSteps(task: string, energy: number | null): Step[] {
  const tinyStart = energy && energy <= 2 ? 'Sit near the task and take one slow breath' : 'Open or gather the thing you need'
  const taskLabel = task.trim().replace(/\s+/g, ' ')

  return [
    {
      text: tinyStart,
      time: 1,
      tip: "Make this so small it almost feels silly. That's the point.",
      stuckAdvice: 'If even this feels too much, only put your hand on the nearest object related to the task. Touching it counts as starting.',
      done: false,
    },
    {
      text: `Look at "${taskLabel}" for two minutes`,
      time: 2,
      tip: 'No solving yet. Just let your brain meet the task.',
      stuckAdvice: 'Set a two-minute timer and give yourself permission to stop when it rings. Your job is only to look, not to finish.',
      done: false,
    },
    {
      text: 'Write the next obvious action in plain words',
      time: 3,
      tip: 'Use a timer if your brain likes a boundary.',
      stuckAdvice: 'Start the sentence with “next I can...” and write the messiest version. It does not need to be clever or complete.',
      done: false,
    },
    {
      text: 'Do only that next action',
      time: energy && energy >= 4 ? 5 : 3,
      tip: 'Music, a drink, or a body double can help.',
      stuckAdvice: 'Shrink the action to the first 20 seconds. You are allowed to stop after that, and the start still counts.',
      done: false,
    },
    {
      text: 'Pause and decide the next tiny move',
      time: 2,
      tip: null,
      stuckAdvice: 'Look at what changed, then choose one tiny follow-up. If your brain blanks, repeat the previous step once.',
      done: false,
    },
  ]
}

function getAffirmation(seed: string) {
  const total = seed.split('').reduce((sum, character) => sum + character.charCodeAt(0), 0)
  return AFFIRMATIONS[total % AFFIRMATIONS.length]
}

function Confetti({ active }: { active: boolean }) {
  const colors = ['#FF6B6B', '#FFE66D', '#4ECDC4', '#C7B8EA', '#FF8B94', '#A8E6CF']

  if (!active) return null

  return (
    <div className="planner-confetti" aria-hidden="true">
      {CONFETTI_PIECES.map(piece => (
        <span
          key={piece.id}
          style={{
            left: `${piece.left}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            background: colors[piece.id % colors.length],
            borderRadius: piece.round ? '50%' : '2px',
            animationDuration: `${piece.duration}s`,
            animationDelay: `${piece.delay}s`,
            transform: `rotate(${piece.rotate}deg)`,
          }}
        />
      ))}
    </div>
  )
}

function StepItem({
  step,
  index,
  onToggle,
  onDelete,
}: {
  step: Step
  index: number
  onToggle: (index: number) => void
  onDelete: (index: number) => void
}) {
  return (
    <article className={`planner-step${step.done ? ' is-done' : ''}`}>
      <button className="planner-check" type="button" onClick={() => onToggle(index)} aria-label={step.done ? 'Mark step incomplete' : 'Mark step complete'}>
        {step.done && '✓'}
      </button>
      <div className="planner-step-copy">
        <p>{step.text}</p>
        <span>⏱ ~{step.time} min</span>
        {step.tip && <em>💡 {step.tip}</em>}
      </div>
      <button className="planner-delete" type="button" onClick={() => onDelete(index)} aria-label="Delete step">
        ×
      </button>
    </article>
  )
}

export default function PlannerPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [defaultEnergy, setDefaultEnergy] = useState(DEFAULT_PROFILE_PREFERENCES.defaultEnergy)
  const [confettiOnCompletion, setConfettiOnCompletion] = useState(DEFAULT_PROFILE_PREFERENCES.confettiOnCompletion)
  const [energy, setEnergy] = useState<number | null>(DEFAULT_PROFILE_PREFERENCES.defaultEnergy)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [task, setTask] = useState('')
  const [taskName, setTaskName] = useState('')
  const [steps, setSteps] = useState<Step[]>([])
  const [loading, setLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [affirmation, setAffirmation] = useState('')
  const [brainDump, setBrainDump] = useState('')
  const [showBrainDump, setShowBrainDump] = useState(false)
  const [stuck, setStuck] = useState(false)
  const [stuckAdvice, setStuckAdvice] = useState('')

  useEffect(() => {
    let active = true

    const loadPlanner = async () => {
      const { data } = await supabase.auth.getSession()
      if (!active) return

      if (!data.session) {
        router.replace('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, preferences')
        .eq('id', data.session.user.id)
        .maybeSingle()

      if (!active) return

      const plannerPreferences = normalizePlannerPreferences(profile?.preferences)
      setDefaultEnergy(plannerPreferences.defaultEnergy)
      setEnergy(plannerPreferences.defaultEnergy)
      setConfettiOnCompletion(plannerPreferences.confettiOnCompletion)
      setDisplayName(profile?.display_name || data.session.user.user_metadata?.display_name || 'Tinystep friend')
      setCheckingSession(false)
    }

    loadPlanner()

    return () => {
      active = false
    }
  }, [router])

  const doneCount = steps.filter(step => step.done).length
  const progress = steps.length ? Math.round((doneCount / steps.length) * 100) : 0

  const triggerConfetti = () => {
    if (!confettiOnCompletion) return

    setShowConfetti(true)
    window.setTimeout(() => setShowConfetti(false), 3000)
  }

  const handleBreakdown = async () => {
    if (!task.trim()) return
    const taskToBreakDown = task.trim()
    const fallbackSteps = makeSteps(taskToBreakDown, energy)

    setLoading(true)
    setSteps([])
    setTaskName(taskToBreakDown)
    setStuck(false)
    setStuckAdvice('')

    try {
      const { data } = await supabase.auth.getSession()
      const accessToken = data.session?.access_token

      if (!accessToken) {
        router.replace('/login')
        return
      }

      const response = await fetch('/api/planner/breakdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          task: taskToBreakDown,
          energy: energy || defaultEnergy,
          brainDump,
        }),
      })

      if (!response.ok) {
        throw new Error('Planner API request failed.')
      }

      const result = await response.json()

      const nextSteps = Array.isArray(result.steps)
        ? result.steps
            .map((step: Partial<Step>) => ({
              text: typeof step.text === 'string' ? step.text : '',
              time: typeof step.time === 'number' ? step.time : 2,
              tip: typeof step.tip === 'string' ? step.tip : null,
              stuckAdvice: typeof step.stuckAdvice === 'string' ? step.stuckAdvice : null,
              done: false,
            }))
            .filter((step: Step) => step.text.trim())
        : fallbackSteps

      const generatedSteps = nextSteps.length ? nextSteps : fallbackSteps
      const persistedSteps = await persistTask(taskToBreakDown, generatedSteps)
      setSteps(persistedSteps)
      setAffirmation(
        typeof result.affirmation === 'string' && result.affirmation.trim()
          ? result.affirmation.trim()
          : getAffirmation(taskToBreakDown)
      )
    } catch {
      const persistedSteps = await persistTask(taskToBreakDown, fallbackSteps)
      setSteps(persistedSteps)
      setAffirmation(getAffirmation(taskToBreakDown))
    } finally {
      setTask('')
      setLoading(false)
    }
  }

  const persistTask = async (inputText: string, generatedSteps: Step[]) => {
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData.session?.user.id

    if (!userId) {
      router.replace('/login')
      return generatedSteps
    }

    const { data: taskRow, error: taskError } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        input_text: inputText,
        energy_level: energy || defaultEnergy,
        brain_dump: brainDump.trim() || null,
      })
      .select('id')
      .single()

    if (taskError || !taskRow?.id) {
      return generatedSteps
    }

    const { data: subtaskRows, error: subtaskError } = await supabase
      .from('subtasks')
      .insert(
        generatedSteps.map((step, index) => ({
          task_id: taskRow.id,
          description: step.text,
          status: step.done ? 'completed' : 'pending',
          sort_order: index + 1,
          time_minutes: step.time,
          tip: step.tip || null,
          stuck_advice: step.stuckAdvice || null,
          completed_at: step.done ? new Date().toISOString() : null,
        }))
      )
      .select('id, sort_order')

    if (subtaskError || !subtaskRows) {
      await supabase
        .from('tasks')
        .delete()
        .eq('id', taskRow.id)

      return generatedSteps
    }

    return generatedSteps.map((step, index) => ({
      ...step,
      id: subtaskRows.find(row => row.sort_order === index + 1)?.id,
    }))
  }

  const handleToggle = async (index: number) => {
    const updated = steps.map((step, stepIndex) => (stepIndex === index ? { ...step, done: !step.done } : step))
    setSteps(updated)
    setStuck(false)
    setStuckAdvice('')

    const toggledStep = updated[index]
    const previousStep = steps[index]

    if (previousStep?.id) {
      const { error } = await supabase
        .from('subtasks')
        .update({
          status: toggledStep.done ? 'completed' : 'pending',
          completed_at: toggledStep.done ? new Date().toISOString() : null,
        })
        .eq('id', previousStep.id)

      if (error) {
        setSteps(steps)
        return
      }
    }

    if (!steps[index].done && updated.every(step => step.done)) {
      triggerConfetti()
    }
  }

  const resetPlanner = () => {
    setSteps([])
    setTaskName('')
    setStuck(false)
    setStuckAdvice('')
    setAffirmation('')
    setEnergy(defaultEnergy)
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleDeleteStep = async (index: number) => {
    const stepToDelete = steps[index]
    setStuck(false)
    setStuckAdvice('')
    setSteps(current => current.filter((_, indexToKeep) => indexToKeep !== index))

    if (stepToDelete?.id) {
      const { error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', stepToDelete.id)

      if (error) {
        setSteps(steps)
      }
    }
  }

  const handleStuck = () => {
    const nextStep = steps.find(step => !step.done)

    setStuck(true)
    setStuckAdvice(nextStep?.stuckAdvice || "Take a 5-minute walk and come back. Movement is magic for ADHD brains. You've got this!")
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (checkingSession) {
    return (
      <main className="planner-page">
        <div className="planner-loading">Opening your planner...</div>
      </main>
    )
  }

  return (
    <main className="planner-page">
      <Confetti active={showConfetti} />

      <button
        className="planner-menu-button"
        type="button"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={drawerOpen}
      >
        <Image src="/drawer-icon.png" alt="" width={24} height={24} />
      </button>

      {drawerOpen && <button className="planner-drawer-backdrop" type="button" aria-label="Close navigation menu" onClick={() => setDrawerOpen(false)} />}

      <aside className={`planner-drawer${drawerOpen ? ' is-open' : ''}`} aria-hidden={!drawerOpen}>
        <Link className="planner-drawer-logo" href="/dashboard" onClick={() => setDrawerOpen(false)}>tiny<span>step</span></Link>
        <div className="planner-drawer-avatar">🌸</div>
        <h2>{displayName}</h2>
        <p>⭐ Yearly plan</p>

        <nav className="planner-drawer-nav" aria-label="Dashboard menu">
          <Link href="/profile" onClick={() => setDrawerOpen(false)}><span>⚙️</span> Preferences</Link>
          <Link href="/history" onClick={() => setDrawerOpen(false)}><span>✅</span> Task History</Link>
          <button type="button" disabled><span>💳</span> Billing</button>
          <button className="logout" type="button" onClick={handleSignOut}><span>🚪</span> Log out</button>
        </nav>
      </aside>

      <section className="planner-shell">
        <header className="planner-topbar">
          <Link className="planner-brand" href="/">
            tiny<span>step</span>
          </Link>
        </header>

        <div className="planner-header">
          <div className="planner-flower">🌸</div>
          <h1 className="planner-title">Done For You, Bestie</h1>
          <p>tiny steps · big wins · zero shame ✨</p>
        </div>

        {!steps.length && (
          <>
            <section className="planner-card">
              <h2>First, how&apos;s your energy right now?</h2>
              <div className="energy-list">
                {ENERGY_LEVELS.map(level => (
                  <button
                    key={level.value}
                    type="button"
                    className={energy === level.value ? 'is-selected' : ''}
                    style={{ '--energy-color': level.color } as CSSProperties}
                    onClick={() => setEnergy(level.value)}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="planner-card">
              <h2>What&apos;s the task that feels impossible right now?</h2>
              <textarea
                ref={inputRef}
                value={task}
                onChange={event => setTask(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    handleBreakdown()
                  }
                }}
                placeholder="e.g. clean the kitchen, reply to that email, do my taxes..."
                rows={3}
              />
              <button className="planner-primary" type="button" disabled={!task.trim() || loading} onClick={handleBreakdown}>
                {loading ? '✨ Breaking it down...' : '✨ Make it tiny for me'}
              </button>
            </section>

            <section className="planner-brain">
              <button type="button" onClick={() => setShowBrainDump(value => !value)}>
                🧠 Brain dump first? (optional)
              </button>
              {showBrainDump && (
                <div>
                  <p>Dump everything in your head here. No judgment. It&apos;s just for you.</p>
                  <textarea
                    value={brainDump}
                    onChange={event => setBrainDump(event.target.value)}
                    placeholder="everything swirling around in there..."
                    rows={4}
                  />
                </div>
              )}
            </section>
          </>
        )}

        {!!steps.length && (
          <section className="planner-mission">
            <div className="planner-mission-head">
              <div>
                <span>Current Mission</span>
                <h2>{taskName}</h2>
              </div>
              <strong>
                {progress}%
                <small>{doneCount}/{steps.length} done</small>
              </strong>
            </div>
            <div className="planner-progress">
              <span style={{ width: `${progress}%` }} />
            </div>

            {affirmation && <p className="planner-affirmation">{affirmation}</p>}

            <div className="planner-steps">
              {steps.map((step, index) => (
                <StepItem
                  key={`${step.text}-${index}`}
                  step={step}
                  index={index}
                  onToggle={handleToggle}
                  onDelete={handleDeleteStep}
                />
              ))}
            </div>

            {!stuck && doneCount < steps.length && (
              <button className="planner-stuck" type="button" onClick={handleStuck}>
                😵‍💫 I&apos;m stuck — help me get unstuck
              </button>
            )}

            {stuck && (
              <div className="planner-advice">
                <strong>💛 You&apos;ve got this!</strong>
                <p>{stuckAdvice}</p>
              </div>
            )}

            <div className="planner-actions">
              {doneCount === steps.length && <div>🎉 You did it!! Incredible!</div>}
              <button type="button" onClick={resetPlanner}>{doneCount === steps.length ? 'New task ✨' : '← Start over'}</button>
            </div>
          </section>
        )}

        <p className="planner-footer">made with love for brains that work differently 🧠💛</p>
      </section>
    </main>
  )
}
