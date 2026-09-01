'use client'

import { useEffect, useMemo, useState } from 'react'

type Tab = 'live' | 'breakdown' | 'twin'

const logPoints = [
  [-20, 'Habit model confidence crossed threshold — entering pre-game window'],
  [-14, 'Checking home Wi-Fi signature for this time slot'],
  [-11, 'Charging strategy selected: health-safe top-up to 100%'],
  [-8, 'Background processes trimmed, RAM reclaimed'],
  [-5, 'Pre-cooling started — device 3°C below idle baseline'],
  [-1, 'Preferred BGMI graphics + sensitivity profile pre-loaded'],
  [0, 'BGMI launched — Focus Mode active, Sentinel monitoring live'],
  [25, 'Session stable — no risk detected'],
  [45, 'Thermal trajectory model flags rising throttle risk'],
  [70, 'Throttle risk window reached'],
] as const

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value))
}

function formatClock(t: number) {
  const total = 20 * 60 + t
  const hours = Math.floor(total / 60) % 24
  const minutes = ((total % 60) + 60) % 60
  const hour = hours % 12 || 12
  return `${hour}:${String(minutes).padStart(2, '0')} PM`
}

function getMetrics(t: number, routingAt: number | null) {
  const battery = clamp(t < -2 ? 61 + 39 * clamp((t + 20) / 18) : 100 - Math.max(0, t) * 0.32)
  const thermal = t < -2 ? 34 - 3 * clamp((t + 20) / 18) : (() => {
    const slope = routingAt !== null && t > routingAt ? 0.075 : 0.155
    return routingAt !== null && t > routingAt ? 31 + 0.155 * routingAt + slope * (t - routingAt) : 31 + 0.155 * Math.max(0, t)
  })()
  const network = clamp(t < -3 ? 68 + 8 * clamp((t + 20) / 17) : 94 + Math.sin(t / 6) * 3)
  const memoryUsed = clamp(t < -1 ? 58 - 36 * clamp((t + 20) / 19) : 22 + Math.max(0, t) * 0.22)
  const thermalReadiness = clamp(100 - (thermal - 30) * 4.2)
  const memoryReadiness = 100 - memoryUsed
  const chargingReadiness = t < -1 ? 70 + 25 * clamp((t + 20) / 19) : 92
  const score = Math.round(0.25 * battery + 0.25 * thermalReadiness + 0.2 * network + 0.15 * memoryReadiness + 0.15 * chargingReadiness)
  return { battery, thermal, network, memoryReadiness, thermalReadiness, chargingReadiness, score }
}

function ReadinessBar({ label, value, suffix = '', tone = 'signal' }: { label: string; value: number; suffix?: string; tone?: string }) {
  return <div className="stat-row"><div className="stat-head"><span>{label}</span><span>{value.toFixed(0)}{suffix}</span></div><div className="bar"><i className={tone} style={{ width: `${value}%` }} /></div></div>
}

export default function Page() {
  const [time, setTime] = useState(-20)
  const [tab, setTab] = useState<Tab>('live')
  const [routingAt, setRoutingAt] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [fired, setFired] = useState<number[]>([])
  const metrics = useMemo(() => getMetrics(time, routingAt), [time, routingAt])

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => setTime((current) => current >= 90 ? (setPlaying(false), current) : current + 1), 180)
    return () => window.clearInterval(timer)
  }, [playing])

  useEffect(() => {
    setFired((current) => [...current, ...logPoints.filter(([point]) => time >= point && !current.includes(point)).map(([point]) => point)])
  }, [time])

  function reset() {
    setPlaying(false); setTime(-20); setRoutingAt(null); setFired([])
  }

  const phase = time < 0 ? 'Pre-game window' : time < 45 ? 'Live session' : 'Risk window'
  const throttleIn = Math.max(0, Math.round((55 - metrics.thermalReadiness) / 0.65))
  const live = time >= 0
  const tone = metrics.thermalReadiness < 45 ? 'danger' : metrics.thermalReadiness < 70 ? 'warn' : 'signal'

  return <main className="sentinel-shell"><div className="wrap">
    <header><div className="brand"><div className="mark" aria-hidden="true" /><div className="brand-text">iQOO <span>Sentinel AI</span></div></div><p>Interactive prototype — drag the clock to see the phone prepare for an 8:00 PM BGMI session before it starts, then hold through the throttle-risk window.</p></header>
    <div className="hero">
      <section className="pitch"><h1>Ready <em>before</em><br />you tap play.</h1><p>Sentinel AI learns when you game and prepares the device in advance — clearing memory, verifying the network, pre-cooling, and choosing a charge strategy — then keeps forecasting risk through the session instead of reacting to it.</p>
        <div className="controls"><div className="row-label"><b>{formatClock(time)}</b><span>{phase}</span></div><input aria-label="Simulation time" type="range" min="-20" max="90" value={time} onChange={(event) => setTime(Number(event.target.value))} /><div className="btnrow"><button className="primary" onClick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Run demo'}</button><button onClick={reset}>Reset</button></div><div className="log">{fired.slice(-8).reverse().map((point) => <div className="entry" key={point}><span className="t">{formatClock(point)}</span><span>{logPoints.find(([p]) => p === point)?.[1]}</span></div>)}</div></div>
      </section>
      <section className="phone-stage"><div className="phone"><div className="screen"><div className="notch" /><div className="statusbar"><span>{formatClock(time).replace(' PM', '')}</span><span>iQOO 15 Pro · Game Space</span></div><div className="tabs" role="tablist">{(['live', 'breakdown', 'twin'] as Tab[]).map((item) => <button key={item} role="tab" aria-selected={tab === item} className={`tab ${tab === item ? 'active' : ''}`} onClick={() => setTab(item)}>{item === 'twin' ? 'Digital Twin' : item[0].toUpperCase() + item.slice(1)}</button>)}</div>
        <div className="screen-body">{tab === 'twin' ? <Twin /> : tab === 'breakdown' ? <Breakdown metrics={metrics} /> : <Live time={time} live={live} metrics={metrics} tone={tone} routingAt={routingAt} throttleIn={throttleIn} onRoute={() => setRoutingAt(time)} />}</div>
      </div></div></section>
    </div>
    <footer><span>Prototype for internal review — simulated telemetry, not live device data.</span><span>Gaming Readiness Score = 25% battery · 25% thermal · 20% network · 15% memory · 15% charging</span></footer>
  </div></main>
}

function Live({ time, live, metrics, tone, routingAt, throttleIn, onRoute }: any) {
  const risk = !live ? <div className="risk-box ok"><b>Preparing</b>Device will be ready by 8:00 PM. Current readiness {metrics.score}/100.</div> : metrics.thermalReadiness >= 70 ? <div className="risk-box ok"><b>Stable</b>No overheating or FPS-drop risk forecast in the next 30 minutes.</div> : metrics.thermalReadiness >= 45 ? <div className="risk-box risk"><b>Medium overheating probability</b>Forecast in ~{throttleIn} min. Suggested action: enable Smart Power Routing.</div> : <div className="risk-box bad"><b>High throttle risk</b>FPS instability likely within {throttleIn} min without intervention.</div>
  return <><div className={`phase-tag ${tone}`}>{live ? 'LIVE SESSION' : 'PRE-GAME WINDOW'}</div>{live && metrics.thermalReadiness < 65 && routingAt === null && <div className="glyph"><b>Throttle risk</b>~{throttleIn} min out. Tap below to route power.</div>}<div className="score-wrap"><div className="score-num">{metrics.score}<small>/100</small></div><div className="score-sub">Gaming Readiness Score — battery, thermal, network, memory, charging combined.</div></div>{risk}<ReadinessBar label="Thermal" value={metrics.thermalReadiness} suffix="°C" tone={tone} /><ReadinessBar label="Battery" value={metrics.battery} suffix="%" /><ReadinessBar label="Network" value={metrics.network} suffix="/100" tone="net" /><ReadinessBar label="Memory free" value={metrics.memoryReadiness} suffix="%" />{live && routingAt !== null && <button className="action-btn" disabled>Smart Power Routing — Active</button>}{live && routingAt === null && metrics.thermalReadiness < 65 && <button className="action-btn" onClick={onRoute}>Enable Smart Power Routing</button>}{!live && <><div className="divider" /><div className="checklist">{[[-14, 'Network verified'], [-11, 'Charging strategy set'], [-8, 'Background apps trimmed'], [-5, 'Device pre-cooled'], [-1, 'Game profile loaded']].map(([point, label]) => <div className={`cl-item ${time >= point ? 'done' : ''}`} key={label as string}><span className="cl-dot">{time >= point ? '✓' : ''}</span>{label}</div>)}</div></>}</>
}

function Breakdown({ metrics }: any) { return <><div className="phase-tag signal">READINESS BREAKDOWN</div><div className="score-wrap"><div className="score-num">{metrics.score}<small>/100</small></div><div className="score-sub">Weighted composite, recalculated every few minutes.</div></div><ReadinessBar label="Battery readiness · 25%" value={metrics.battery} /><ReadinessBar label="Thermal readiness · 25%" value={metrics.thermalReadiness} tone={metrics.thermalReadiness < 45 ? 'danger' : metrics.thermalReadiness < 70 ? 'warn' : 'signal'} /><ReadinessBar label="Network readiness · 20%" value={metrics.network} tone="net" /><ReadinessBar label="Memory readiness · 15%" value={metrics.memoryReadiness} /><ReadinessBar label="Charging readiness · 15%" value={metrics.chargingReadiness} /><div className="divider" /><div className="twin-note">Weights adjust to your behavior — plugged-in players are weighted more on thermal, mobile players more on battery.</div></> }
function Twin() { return <><div className="phase-tag signal">DIGITAL TWIN</div><div className="score-sub wide">28-day view of you and your device, learned from actual sessions — not a generic benchmark.</div>{['Habit — BGMI sessions detected 6 of 7 nights, 7:55–9:40 PM window, 87% schedule confidence.','Thermal — device’s sustained-load ceiling improved 8% this month after case-off sessions were logged.','Battery — sessions pre-charged before 7 PM run 34 min longer on average before any throttle risk.','Network — home Wi-Fi shows recurring congestion 8:30–9:00 PM; mobile data suggested as backup in that window.'].map((note) => <div className="twin-note" key={note}>{note}</div>)}<div className="divider" /><div className="score-sub wide">Twin data stays on-device. Nothing here leaves your phone.</div></> }
