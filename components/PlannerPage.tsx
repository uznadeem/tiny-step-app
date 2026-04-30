'use client'

import Link from 'next/link'
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
  text: string
  time: number
  tip?: string | null
  done: boolean
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

function makeSteps(task: string, energy: number | null): Step[] {
  const tinyStart = energy && energy <= 2 ? 'Sit near the task and take one slow breath' : 'Open or gather the thing you need'
  const taskLabel = task.trim().replace(/\s+/g, ' ')

  return [
    { text: tinyStart, time: 1, tip: "Make this so small it almost feels silly. That's the point.", done: false },
    { text: `Look at "${taskLabel}" for two minutes`, time: 2, tip: 'No solving yet. Just let your brain meet the task.', done: false },
    { text: 'Write the next obvious action in plain words', time: 3, tip: 'Use a timer if your brain likes a boundary.', done: false },
    { text: 'Do only that next action', time: energy && energy >= 4 ? 5 : 3, tip: 'Music, a drink, or a body double can help.', done: false },
    { text: 'Pause and decide the next tiny move', time: 2, tip: null, done: false },
  ]
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
  const [energy, setEnergy] = useState<number | null>(null)
  const [task, setTask] = useState('')
  const [taskName, setTaskName] = useState('')
  const [steps, setSteps] = useState<Step[]>([])
  const [loading, setLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [affirmation, setAffirmation] = useState('')
  const [brainDump, setBrainDump] = useState('')
  const [showBrainDump, setShowBrainDump] = useState(false)
  const [stuckAdvice, setStuckAdvice] = useState('')

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      if (!data.session) {
        router.replace('/login')
        return
      }
      setCheckingSession(false)
    })

    return () => {
      active = false
    }
  }, [router])

  const doneCount = steps.filter(step => step.done).length
  const progress = steps.length ? Math.round((doneCount / steps.length) * 100) : 0

  const triggerConfetti = () => {
    setShowConfetti(true)
    window.setTimeout(() => setShowConfetti(false), 3000)
  }

  const handleBreakdown = async () => {
    if (!task.trim()) return
    setLoading(true)
    setSteps([])
    setTaskName(task.trim())
    setStuckAdvice('')

    window.setTimeout(() => {
      setSteps(makeSteps(task, energy))
      setAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)])
      setTask('')
      setLoading(false)
    }, 450)
  }

  const handleToggle = (index: number) => {
    const updated = steps.map((step, stepIndex) => (stepIndex === index ? { ...step, done: !step.done } : step))
    setSteps(updated)

    if (!steps[index].done && updated.every(step => step.done)) {
      triggerConfetti()
    }
  }

  const resetPlanner = () => {
    setSteps([])
    setTaskName('')
    setStuckAdvice('')
    setAffirmation('')
    setEnergy(null)
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleStuck = () => {
    const remaining = steps.find(step => !step.done)?.text
    setStuckAdvice(
      remaining
        ? `Shrink it again: do only the first 20 seconds of "${remaining}". You are allowed to stop after that, and starting still counts. 💛`
        : "Take a breath and notice that you're already further than when you started. Tiny wins count."
    )
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

      <section className="planner-shell">
        <header className="planner-topbar">
          <Link className="planner-brand" href="/">
            tiny<span>step</span>
          </Link>
          <button type="button" onClick={handleSignOut}>Log out</button>
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
                  onDelete={stepIndex => setSteps(current => current.filter((_, indexToKeep) => indexToKeep !== stepIndex))}
                />
              ))}
            </div>

            {!stuckAdvice && doneCount < steps.length && (
              <button className="planner-stuck" type="button" onClick={handleStuck}>
                😵‍💫 I&apos;m stuck — help me get unstuck
              </button>
            )}

            {stuckAdvice && (
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
