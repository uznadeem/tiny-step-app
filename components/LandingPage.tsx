'use client'

import { useEffect, useRef, useState } from 'react'

export default function LandingPage() {
  const [count, setCount] = useState(847)
  const [finalSuccess, setFinalSuccess] = useState(false)
  const [heroEmail, setHeroEmail] = useState('')
  const [finalEmail, setFinalEmail] = useState('')
  const [heroBtnText, setHeroBtnText] = useState('Get early access →')
  const [heroBtnSuccess, setHeroBtnSuccess] = useState(false)
  const cursorRef = useRef<HTMLDivElement>(null)

  // Custom cursor
  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    const onMove = (e: MouseEvent) => {
      cursor.style.left = e.clientX + 'px'
      cursor.style.top = e.clientY + 'px'
    }

    const onEnter = () => cursor.classList.add('big')
    const onLeave = () => cursor.classList.remove('big')

    document.addEventListener('mousemove', onMove)
    document.querySelectorAll('a, button, input').forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.querySelectorAll('a, button, input').forEach(el => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
    }
  }, [])

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 80)
          }
        })
      },
      { threshold: 0.12 }
    )
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Animated counter
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setCount(c => c + Math.floor(Math.random() * 3) + 1)
      }
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const scrollToWaitlist = () => {
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCount(c => c + 1)
    setHeroBtnText("🎉 You're in!")
    setHeroBtnSuccess(true)
    setTimeout(() => {
      setHeroBtnText('Get early access →')
      setHeroBtnSuccess(false)
      setHeroEmail('')
    }, 3000)
  }

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCount(c => c + 1)
    setFinalSuccess(true)
  }

  return (
    <>
      <div className="cursor" ref={cursorRef} />

      {/* Nav */}
      <nav>
        <div className="logo">tiny<span>step</span></div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a href="#how">How it works</a>
          <a href="#pricing">Pricing</a>
          <a href="#waitlist" className="nav-cta">Join Waitlist</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid">
          <div>
            <div className="tag-pill">✨ Built for ADHD women</div>
            <h1>The planner that actually <em>gets</em> your brain</h1>
            <p className="hero-sub">
              Stop staring at your to-do list in paralysis. Tinystep breaks any task into tiny,
              dopamine-friendly steps — calibrated to your energy right now.
            </p>
            <form className="waitlist-form" onSubmit={handleHeroSubmit}>
              <input
                type="email"
                placeholder="your@email.com"
                required
                value={heroEmail}
                onChange={e => setHeroEmail(e.target.value)}
              />
              <button
                type="submit"
                className="btn-coral"
                style={heroBtnSuccess ? { background: '#10b981' } : {}}
                disabled={heroBtnSuccess}
              >
                {heroBtnText}
              </button>
            </form>
            <p className="hero-meta">
              <strong>{count.toLocaleString()} women</strong> already on the waitlist · Free to start
            </p>
          </div>

          <div className="hero-visual">
            <div className="phone-frame">
              <div className="phone-screen">
                <div className="phone-notch" />
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                  Current Mission
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#3b3054', marginBottom: '10px' }}>
                  Reply to that email 📧
                </div>
                <div className="app-progress-bar">
                  <div className="app-progress-fill" />
                </div>
                <div className="app-label">3 / 5 done</div>
                <div style={{ height: '10px' }} />
                {[
                  { done: true, text: 'Open your email app', time: '⏱ ~1 min' },
                  { done: true, text: 'Read the email once', time: '⏱ ~2 min' },
                  { done: true, text: 'Write 3 bullet points', time: '⏱ ~3 min' },
                  { done: false, text: 'Turn bullets into reply', time: '⏱ ~4 min' },
                  { done: false, text: 'Hit send 🎉', time: '⏱ ~1 min' },
                ].map((task, i) => (
                  <div key={i} className={`app-task-item${task.done ? ' done' : ''}`}>
                    <div className={`check ${task.done ? 'filled' : 'empty'}`} />
                    <div>
                      <div className={`task-text${task.done ? ' done' : ''}`}>{task.text}</div>
                      <div className="task-time">{task.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="badge badge-1">🎉 Task done!</div>
            <div className="badge badge-2">⚡ Energy check-in</div>
            <div className="badge badge-3">✓ No shame here</div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="pain-section">
        <div className="section-inner">
          <h2 className="pain-header reveal">Sound familiar? 👇</h2>
          <div className="pain-grid">
            {[
              { emoji: '😶‍🌫️', title: 'Task paralysis is REAL', desc: "You know what you need to do. You just... can't start. You've been \"about to\" do it for 3 hours." },
              { emoji: '📋', title: "Normal planners don't help", desc: "Bullet journals, productivity apps, GTD — designed by neurotypical people for neurotypical brains. Not yours." },
              { emoji: '⏰', title: 'Time blindness is exhausting', desc: "It's either \"I have all the time\" or \"how is it already 4pm\" — nothing in between. Tasks take forever or zero seconds." },
              { emoji: '💥', title: 'Overwhelm kills everything', desc: "The moment a task looks complicated, your brain says \"nope.\" Even when it would take 10 minutes." },
              { emoji: '🔋', title: 'Energy is unpredictable', desc: "Somedays you're a productivity machine. Other days brushing your teeth is the win. One planner can't handle both." },
              { emoji: '😞', title: 'The shame spiral is crushing', desc: "You couldn't do a simple task again. So you feel terrible. Which makes starting even harder. The loop is brutal." },
            ].map((item, i) => (
              <div key={i} className="pain-card reveal">
                <div className="pain-emoji">{item.emoji}</div>
                <div className="pain-title">{item.title}</div>
                <div className="pain-desc">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-section" id="how">
        <div className="section-inner">
          <span className="section-label reveal">How it works</span>
          <h2 className="section-title reveal">From &quot;I can&apos;t&quot; to done<br />in 4 tiny steps</h2>
          <div className="steps-grid">
            {[
              { bg: 'linear-gradient(135deg,#FFE8E8,#FFCDD2)', emoji: '🔋', title: 'Check your energy', desc: "Tell us how you're feeling right now — from \"running on fumes\" to \"hyperfocus mode.\" Steps adapt to your real capacity." },
              { bg: 'linear-gradient(135deg,#FFF8E1,#FFE0B2)', emoji: '💬', title: 'Dump the task', desc: "Type the thing that feels impossible. Any size — \"clean the house\" or \"reply to Karen's email.\" No judgment." },
              { bg: 'linear-gradient(135deg,#E8F5E9,#C8E6C9)', emoji: '✨', title: 'Get micro-steps', desc: 'AI breaks it into 4–7 tiny, achievable steps with time estimates. First step always takes under 60 seconds.' },
              { bg: 'linear-gradient(135deg,#EDE7F6,#D1C4E9)', emoji: '🎉', title: "Check 'em off", desc: 'Each checkbox is a little dopamine hit. Finish everything and get a proper celebration — you earned it.' },
            ].map((step, i) => (
              <div key={i} className="step-card reveal">
                <div className="step-num" style={{ background: step.bg }}>{step.emoji}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="section-inner">
          <span className="section-label reveal">Features</span>
          <h2 className="section-title reveal">Everything your ADHD<br />brain actually needs</h2>
          <div className="features-grid">
            {[
              { icon: '🧠', title: 'AI task breakdown', desc: 'Type any task, get it instantly broken into brain-friendly micro-steps with time estimates and ADHD-specific tips for each one.' },
              { icon: '🔋', title: 'Energy-aware planning', desc: "Check your energy level first. Steps get adjusted to what you can actually handle right now — not what you could handle on your best day." },
              { icon: '😵‍💫', title: '"I\'m stuck" button', desc: "Hit a wall? One tap gets you a personalized, compassionate unstuck tip. No lectures. Just the nudge you actually need." },
              { icon: '🧠✏️', title: 'Brain dump first', desc: "Clear the mental noise before you start. The brain dump space is just for you — unfiltered, unjudged, just... out of your head." },
              { icon: '🎉', title: 'Dopamine rewards', desc: "Confetti on completion. Rotating affirmations. Every checkbox is a win worth celebrating. Because you deserve it every time." },
              { icon: '💛', title: 'Zero shame design', desc: 'No streaks to break. No "you missed 3 days." No productivity shaming. Just warm support for the brain you actually have.' },
            ].map((f, i) => (
              <div key={i} className="feature-card reveal">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="section-inner">
          <span className="section-label reveal">Early testers say</span>
          <h2 className="section-title reveal">Words from our beta users</h2>
          <div className="testi-grid">
            {[
              { text: "I've tried every planner app. This is the first one that didn't make me feel worse about myself when I couldn't keep up. The tiny steps thing is genuinely magic for my brain.", name: 'Sarah K.', handle: 'ADHD diagnosed at 34', avatarBg: '#FFE8E8', avatarEmoji: '🌸' },
              { text: "The energy check-in is everything. I always wondered why I could crush tasks on Tuesday but couldn't reply to a text on Thursday. Now my planner finally understands that too.", name: 'Maya T.', handle: 'Mom of 2 with ADHD', avatarBg: '#E8F5E9', avatarEmoji: '🌱' },
              { text: "The \"I'm stuck\" button is my therapist's new favorite thing I've told her about. That one feature alone has gotten me unstuck more times this month than my entire bullet journal did all year.", name: 'Jordan R.', handle: 'Freelancer, ADHD + anxiety', avatarBg: '#EDE7F6', avatarEmoji: '💜' },
            ].map((t, i) => (
              <div key={i} className="testi-card reveal">
                <div className="stars">★★★★★</div>
                <p className="testi-text">{t.text}</p>
                <div className="testi-author">
                  <div className="testi-avatar" style={{ background: t.avatarBg }}>{t.avatarEmoji}</div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-handle">{t.handle}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing-section" id="pricing">
        <div className="section-inner" style={{ textAlign: 'center' }}>
          <span className="section-label reveal" style={{ display: 'block' }}>Pricing</span>
          <h2 className="section-title reveal" style={{ marginBottom: '12px' }}>Simple, accessible pricing</h2>
          <p className="reveal" style={{ color: 'rgba(45,27,78,0.5)', marginBottom: '40px', fontSize: '16px' }}>
            Early access waitlist members get 40% off forever 💛
          </p>
          <div className="pricing-cards reveal">
            <div className="pricing-card">
              <div className="plan-name">Monthly</div>
              <div className="price">$7</div>
              <div className="price-sub">per month</div>
              <ul className="price-features">
                {['Unlimited task breakdowns', 'Energy-aware planning', 'Brain dump + stuck support', 'All ADHD features'].map((f, i) => (
                  <li key={i}><span className="check-icon">✓</span> {f}</li>
                ))}
              </ul>
              <button className="btn-plum" onClick={scrollToWaitlist}>Join waitlist</button>
            </div>
            <div className="pricing-card featured">
              <div className="plan-name">Yearly</div>
              <div className="price" style={{ color: 'white' }}>$49</div>
              <div className="price-sub">per year · save 42%</div>
              <ul className="price-features">
                {['Everything in Monthly', 'Priority new features', 'Community access', 'Early access bonus content'].map((f, i) => (
                  <li key={i}><span className="check-icon">✓</span> {f}</li>
                ))}
              </ul>
              <button className="btn-white" onClick={scrollToWaitlist}>Join waitlist →</button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta" id="waitlist">
        {!finalSuccess ? (
          <div>
            <h2>Your brain isn&apos;t broken.<br />Your planner just was. 💛</h2>
            <p>Join 800+ women waiting for a planner that finally works with their ADHD brain.</p>
            <form className="final-form" onSubmit={handleFinalSubmit}>
              <input
                type="email"
                placeholder="your@email.com"
                required
                value={finalEmail}
                onChange={e => setFinalEmail(e.target.value)}
              />
              <button type="submit" className="btn-plum-solid">I&apos;m in →</button>
            </form>
            <p className="final-meta">No spam. No streak pressure. Just early access when we launch. ✨</p>
          </div>
        ) : (
          <div className="success-msg show">
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎉</div>
            <h3>You&apos;re on the list!</h3>
            <p>We&apos;ll email you the moment Tinystep launches. You&apos;ve officially done the first tiny step. 💛</p>
          </div>
        )}
      </section>

      <footer>
        <p style={{ fontSize: '18px', marginBottom: '8px' }}>
          tiny<strong style={{ color: '#FF4D4D' }}>step</strong>
        </p>
        <p>
          Made with love for brains that work differently 🧠 ·{' '}
          <a href="mailto:hello@tinystep.app" style={{ color: 'rgba(255,255,255,0.5)' }}>hello@tinystep.app</a>
        </p>
        <p style={{ marginTop: '8px' }}>
          © 2026 Tinystep ·{' '}
          <a href="#" style={{ color: 'rgba(255,255,255,0.35)' }}>Privacy</a> ·{' '}
          <a href="#" style={{ color: 'rgba(255,255,255,0.35)' }}>Terms</a>
        </p>
      </footer>
    </>
  )
}
