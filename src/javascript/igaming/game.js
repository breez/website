// The crash game behind /igaming.
//
// One rocket, one multiplier, one decision per round. Canvas 2D, no libraries,
// no page-specific DOM assumptions beyond the canvas it is handed, so the same
// module can be mounted anywhere (see embed.js).
//
// The page lands on a settled frame: the last round's curve, already crashed,
// with nothing moving. The loop only runs while a round is actually in the
// air, which keeps a parked tab at zero cost and means there is no attract
// mode to explain away.

// m(t) = e^(k*t). k is tuned so 2x arrives at ~3.5s and 10x at ~11.6s, which
// is the pace a crash player expects: long enough to hesitate, short enough
// that three rounds fit inside a scroll.
const GROWTH_K = Math.LN2 / 3.5

// The frame the page opens on. Fixed, so the hero is good by construction.
const OPENING_CRASH = 4.31

// Breez Casino's palette, taken off their marquee: bulb gold, neon blue, hot
// pink. Nothing here is a Breez brand color, because this has to read as an
// operator's game rather than as the site it is sitting on.
const COLOR = {
  hot: '#FFC22E',
  hotSoft: 'rgba(255, 194, 46, 0.26)',
  hotFill: 'rgba(255, 194, 46, 0.12)',
  bust: '#FF3D6E',
  bustSoft: 'rgba(255, 61, 110, 0.24)',
  spent: '#8C4A63',
  spentSoft: 'rgba(255, 61, 110, 0.10)',
  flame: '#FF7A3D',
  porthole: '#2E7DFF',
  grid: 'rgba(174, 148, 255, 0.13)',
  gridText: 'rgba(196, 178, 255, 0.45)',
  star: '#FFFFFF',
  white: '#FFFFFF',
}

// A fixed starfield: the sky is the same every load and nothing loops.
function makeStars(count, w, h, seed) {
  let t = seed
  const rnd = () => {
    t = (t * 1664525 + 1013904223) % 4294967296
    return t / 4294967296
  }
  const out = []
  for (let i = 0; i < count; i += 1) {
    out.push({ x: rnd() * w, y: rnd() * h, r: 0.4 + rnd() * 1.3, a: 0.12 + rnd() * 0.5 })
  }
  return out
}

// A round's crash point. The classic crash curve (1/(1-r)) with a house edge,
// then a mild exponent to thin the tail: 20x+ should be a story, not a Tuesday.
// Capped at 40x so no round can outlast the visitor's patience.
function drawCrashPoint() {
  const r = Math.random()
  const raw = (1 - 0.03) / Math.pow(1 - r, 0.86)
  return Math.min(40, Math.max(1, Math.floor(raw * 100) / 100))
}

const multiplierAt = (t) => Math.exp(GROWTH_K * t)
const timeOf = (m) => Math.log(m) / GROWTH_K

export function createGame(canvas, options = {}) {
  const ctx = canvas.getContext('2d', { alpha: true })
  const listeners = new Map()
  const reduced = !!options.reduced

  let W = 0
  let H = 0
  let dpr = 1

  // IDLE is a still frame of the round that just ended. FLYING is the only
  // state that animates; CRASHED is the short wreck before it settles back.
  let phase = 'IDLE'

  let roundStart = 0
  let elapsed = timeOf(OPENING_CRASH)
  let multiplier = OPENING_CRASH
  let crashPoint = OPENING_CRASH
  let stake = 0
  let cashedAt = 0
  let busted = true

  // View scale. The head of the curve is held at a fixed point on screen and
  // the axes grow underneath it, so the rocket always looks about to go
  // vertical no matter how far the round has run.
  let viewT = 4
  let viewM = 2

  let flash = 0
  let shake = 0
  let cashPulse = 0
  let stars = []
  const particles = []
  const shards = []

  let raf = 0
  let last = 0
  let running = false
  let holdUntil = 0

  const emit = (name, detail) => {
    const set = listeners.get(name)
    if (set) set.forEach((fn) => fn(detail))
  }

  function on(name, fn) {
    if (!listeners.has(name)) listeners.set(name, new Set())
    listeners.get(name).add(fn)
    return () => listeners.get(name).delete(fn)
  }

  function resize() {
    const rect = canvas.getBoundingClientRect()
    // Cap at 2x: beyond that the extra pixels cost frames on a mid-range
    // phone and buy nothing the eye can see on a hairline curve.
    dpr = Math.min(2, window.devicePixelRatio || 1)
    W = Math.max(1, Math.round(rect.width))
    H = Math.max(1, Math.round(rect.height))
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    stars = makeStars(Math.round((W * H) / 9000), W, H, 20260826)
  }

  // The canvas fills the board. The only chrome over it is the round-history
  // strip along the top, so the padding just has to clear that and leave a
  // gutter on the right for the multiplier axis.
  const pad = () => {
    const narrow = W < 700
    return {
      l: narrow ? 18 : 30,
      r: narrow ? 46 : 76,
      t: narrow ? 54 : 62,
      b: narrow ? 20 : 28,
    }
  }

  function project(t, m) {
    const p = pad()
    const w = Math.max(1, W - p.l - p.r)
    const h = Math.max(1, H - p.t - p.b)
    return {
      x: p.l + (t / viewT) * w,
      y: H - p.b - ((m - 1) / Math.max(0.0001, viewM - 1)) * h,
    }
  }

  function targetView() {
    // Hold the head at ~80% across and ~74% up. Floors keep the very start of
    // a round from being a vertical wall at 1.00x.
    return {
      t: Math.max(4, elapsed / 0.8),
      m: Math.max(1.9, 1 + (multiplier - 1) / 0.74),
    }
  }

  function snapView() {
    const tv = targetView()
    viewT = tv.t
    viewM = tv.m
  }

  function startLoop() {
    if (running) return
    running = true
    last = performance.now()
    raf = requestAnimationFrame(step)
  }

  function stopLoop() {
    running = false
    cancelAnimationFrame(raf)
  }

  function settle() {
    phase = 'IDLE'
    shards.length = 0
    particles.length = 0
    flash = 0
    shake = 0
    cashPulse = 0
    // The round's result stays on the board until the next launch: the curve
    // it reached and the multiplier it stopped at. That is what the player
    // reads before deciding the next bet.
    multiplier = crashPoint
    elapsed = timeOf(crashPoint)
    snapView()
    stopLoop()
    draw()
    emit('idle', { at: crashPoint, busted })
  }

  function crash() {
    busted = phase === 'FLYING' && !cashedAt
    phase = 'CRASHED'
    holdUntil = performance.now() + (reduced ? 700 : 1500)
    if (!reduced) {
      flash = 1
      shake = 1
      spawnShards()
    }
    emit('crash', { at: crashPoint, busted, stake })
    if (busted) stake = 0
  }

  function spawnShards() {
    // The trail breaks up rather than vanishing: the round leaves a wreck.
    const steps = 16
    for (let i = 0; i < steps; i += 1) {
      const t0 = (i / steps) * elapsed
      const t1 = ((i + 1) / steps) * elapsed
      const a = project(t0, multiplierAt(t0))
      const b = project(t1, multiplierAt(t1))
      shards.push({
        x0: a.x, y0: a.y, x1: b.x, y1: b.y,
        vx: (Math.random() - 0.5) * 60 + 20,
        vy: (Math.random() - 0.5) * 60 - 30,
        life: 1,
      })
    }
  }

  function step(now) {
    const raw = now - last
    const dt = Math.min(0.05, raw / 1000 || 0)
    last = now

    if (raw > 400 && phase === 'FLYING') {
      // The loop stalled mid-round. Push the round forward by the gap so it
      // resumes where the visitor left it, and put the axes straight where
      // they belong instead of racing to catch up.
      roundStart = Math.min(now, roundStart + raw)
      holdUntil += raw
      elapsed = Math.max(0, (now - roundStart) / 1000)
      multiplier = multiplierAt(elapsed)
      snapView()
    }

    if (phase === 'FLYING') {
      elapsed = Math.max(0, (now - roundStart) / 1000)
      multiplier = multiplierAt(elapsed)
      if (multiplier >= crashPoint) {
        multiplier = crashPoint
        elapsed = timeOf(crashPoint)
        crash()
      } else {
        emit('tick', { multiplier, elapsed })
        if (!reduced && Math.random() < 0.55) spawnParticle()
      }
    } else if (phase === 'CRASHED' && now >= holdUntil) {
      settle()
      return
    }

    // Ease the axes toward their target so growth reads as the world zooming
    // out, not as the curve jumping.
    const tv = targetView()
    const k = 1 - Math.pow(0.0001, dt)
    viewT += (tv.t - viewT) * k
    viewM += (tv.m - viewM) * k

    if (flash > 0) flash = Math.max(0, flash - dt / 0.13)
    if (shake > 0) shake = Math.max(0, shake - dt / 0.2)
    if (cashPulse > 0) cashPulse = Math.max(0, cashPulse - dt / 0.5)
    stepParticles(dt)
    stepShards(dt)

    draw()
    if (running) raf = requestAnimationFrame(step)
  }

  function spawnParticle() {
    const head = project(elapsed, multiplier)
    particles.push({
      x: head.x, y: head.y,
      vx: -40 - Math.random() * 70,
      vy: 26 + Math.random() * 60,
      life: 1,
      r: 0.8 + Math.random() * 1.6,
    })
    if (particles.length > 70) particles.shift()
  }

  function stepParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i]
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.life -= dt / 0.85
      if (p.life <= 0) particles.splice(i, 1)
    }
  }

  function stepShards(dt) {
    for (let i = shards.length - 1; i >= 0; i -= 1) {
      const s = shards[i]
      s.x0 += s.vx * dt; s.x1 += s.vx * dt
      s.y0 += s.vy * dt; s.y1 += s.vy * dt
      s.vy += 220 * dt
      s.life -= dt / 0.75
      if (s.life <= 0) shards.splice(i, 1)
    }
  }

  // ---- drawing ------------------------------------------------------------

  const strokeFor = () => {
    if (phase === 'FLYING') return COLOR.hot
    if (phase === 'CRASHED') return COLOR.bust
    return busted ? COLOR.spent : COLOR.hot
  }

  function drawStars() {
    if (!stars.length) return
    ctx.save()
    ctx.fillStyle = COLOR.star
    for (const st of stars) {
      ctx.globalAlpha = st.a
      ctx.beginPath()
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  function niceStep(range) {
    const steps = [0.25, 0.5, 1, 2, 5, 10, 20, 50]
    for (const s of steps) if (range / s <= 5) return s
    return 100
  }

  function drawGrid() {
    const p = pad()
    const step = niceStep(viewM - 1)
    ctx.save()
    ctx.lineWidth = 1
    ctx.strokeStyle = COLOR.grid
    ctx.fillStyle = COLOR.gridText
    ctx.font = `600 ${W < 560 ? 9 : 10}px Inter, system-ui, sans-serif`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'

    for (let m = 1 + step; m < viewM; m += step) {
      const { y } = project(0, m)
      if (y < p.t - 20) break
      ctx.beginPath()
      ctx.moveTo(p.l, Math.round(y) + 0.5)
      ctx.lineTo(W - p.r, Math.round(y) + 0.5)
      ctx.stroke()
      ctx.fillText(`${m % 1 ? m.toFixed(2) : m}x`, W - p.r + 9, y)
    }

    const base = project(0, 1)
    ctx.strokeStyle = 'rgba(174,148,255,0.3)'
    ctx.beginPath()
    ctx.moveTo(p.l, Math.round(base.y) + 0.5)
    ctx.lineTo(W - p.r, Math.round(base.y) + 0.5)
    ctx.stroke()
    ctx.restore()
  }

  function curvePath(upTo) {
    const steps = 90
    ctx.beginPath()
    for (let i = 0; i <= steps; i += 1) {
      const t = (i / steps) * upTo
      const { x, y } = project(t, multiplierAt(t))
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
  }

  function drawTrail() {
    if (elapsed <= 0) return
    const stroke = strokeFor()
    const halo = phase === 'CRASHED' ? COLOR.bustSoft
      : phase === 'FLYING' || !busted ? COLOR.hotSoft : COLOR.spentSoft

    // Two passes instead of shadowBlur: a wide, faint pass for the halo and a
    // hairline on top. Cheaper than a blur and it keeps the line crisp.
    if (!reduced) {
      ctx.save()
      ctx.strokeStyle = halo
      ctx.lineWidth = 10
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      curvePath(elapsed)
      ctx.stroke()
      ctx.restore()
    }

    ctx.save()
    ctx.strokeStyle = stroke
    ctx.lineWidth = 2.4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    curvePath(elapsed)
    ctx.stroke()

    // The area under the curve, barely there, to give the climb some mass.
    const p = pad()
    const head = project(elapsed, multiplier)
    const grad = ctx.createLinearGradient(0, head.y, 0, H - p.b)
    grad.addColorStop(0, phase === 'FLYING' || (!busted && phase === 'IDLE')
      ? COLOR.hotFill : 'rgba(255, 61, 110, 0.07)')
    grad.addColorStop(1, 'rgba(255, 194, 46, 0)')
    curvePath(elapsed)
    ctx.lineTo(head.x, H - p.b)
    ctx.lineTo(project(0, 1).x, H - p.b)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()
    ctx.restore()
  }

  function drawRocket() {
    const head = project(elapsed, multiplier)
    const back = Math.max(0, elapsed - 0.08)
    const prev = project(back, multiplierAt(back))
    const angle = Math.atan2(head.y - prev.y, head.x - prev.x)

    ctx.save()
    ctx.translate(head.x, head.y)
    ctx.rotate(angle)
    // The rocket is the thing the genre is named after, so it needs to be
    // legible at a glance rather than a speck on the end of a line.
    ctx.scale(1.45, 1.45)

    if (!reduced) {
      ctx.beginPath()
      ctx.arc(0, 0, 16, 0, Math.PI * 2)
      ctx.fillStyle = phase === 'FLYING' ? COLOR.hotSoft : 'rgba(174,148,255,0.12)'
      ctx.fill()
    }

    const dead = phase === 'IDLE' && busted
    const skin = dead ? COLOR.spent : COLOR.white

    // Exhaust, only while it is climbing. The length wobbles off the round
    // clock rather than Math.random, so it flickers without jittering.
    if (phase === 'FLYING' && !reduced) {
      const wob = 8 + Math.sin(elapsed * 34) * 2.6 + Math.sin(elapsed * 61) * 1.4
      const flame = ctx.createLinearGradient(-8, 0, -8 - wob, 0)
      flame.addColorStop(0, COLOR.hot)
      flame.addColorStop(0.55, COLOR.flame)
      flame.addColorStop(1, 'rgba(255, 61, 110, 0)')
      ctx.beginPath()
      ctx.moveTo(-8, -3.4)
      ctx.lineTo(-8 - wob, 0)
      ctx.lineTo(-8, 3.4)
      ctx.closePath()
      ctx.fillStyle = flame
      ctx.fill()
    }

    // Fins.
    ctx.beginPath()
    ctx.moveTo(-3, -4.2)
    ctx.lineTo(-9.5, -9.5)
    ctx.lineTo(-8, -3.6)
    ctx.closePath()
    ctx.moveTo(-3, 4.2)
    ctx.lineTo(-9.5, 9.5)
    ctx.lineTo(-8, 3.6)
    ctx.closePath()
    ctx.fillStyle = dead ? COLOR.spent : COLOR.bust
    ctx.fill()

    // Body and nose.
    ctx.beginPath()
    ctx.moveTo(13.5, 0)
    ctx.quadraticCurveTo(6, -5, -8, -4.4)
    ctx.lineTo(-8, 4.4)
    ctx.quadraticCurveTo(6, 5, 13.5, 0)
    ctx.closePath()
    ctx.fillStyle = skin
    ctx.fill()

    // Porthole.
    ctx.beginPath()
    ctx.arc(3.2, 0, 2.1, 0, Math.PI * 2)
    ctx.fillStyle = dead ? 'rgba(0,0,0,0.32)' : COLOR.porthole
    ctx.fill()
    ctx.restore()

    if (cashPulse > 0) {
      ctx.save()
      const r = 16 + (1 - cashPulse) * 46
      ctx.beginPath()
      ctx.arc(head.x, head.y, r, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(42,204,128,${cashPulse * 0.75})`
      ctx.lineWidth = 2.5
      ctx.stroke()
      ctx.restore()
    }
  }

  function drawParticles() {
    if (!particles.length) return
    ctx.save()
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life) * 0.75
      ctx.fillStyle = COLOR.hot
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  function drawShards() {
    if (!shards.length) return
    ctx.save()
    ctx.lineWidth = 2.4
    ctx.lineCap = 'round'
    for (const s of shards) {
      ctx.globalAlpha = Math.max(0, s.life)
      ctx.strokeStyle = COLOR.bust
      ctx.beginPath()
      ctx.moveTo(s.x0, s.y0)
      ctx.lineTo(s.x1, s.y1)
      ctx.stroke()
    }
    ctx.restore()
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)

    if (shake > 0) {
      const s = shake * shake * 9
      ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s)
    }

    drawStars()
    drawGrid()

    if (shards.length) {
      drawShards()
    } else {
      drawTrail()
      drawParticles()
      drawRocket()
    }

    if (flash > 0) {
      ctx.save()
      ctx.globalAlpha = flash * 0.26
      ctx.fillStyle = COLOR.white
      ctx.fillRect(-40, -40, W + 80, H + 80)
      ctx.restore()
    }
  }

  // ---- public surface -----------------------------------------------------

  // The page opens on a still frame of the round that just ended. Nothing
  // moves until the visitor launches one of their own.
  function start() {
    resize()
    phase = 'IDLE'
    busted = false
    crashPoint = OPENING_CRASH
    multiplier = 1
    elapsed = 0
    snapView()
    draw()
    emit('idle', { at: multiplier, busted })
  }

  function launch(amount) {
    if (phase !== 'IDLE') return false
    stake = amount
    cashedAt = 0
    busted = false
    particles.length = 0
    shards.length = 0
    crashPoint = drawCrashPoint()
    roundStart = performance.now()
    last = roundStart
    elapsed = 0
    multiplier = 1
    viewT = 4
    viewM = 2
    phase = 'FLYING'
    emit('round', { crashPoint })
    startLoop()
    return true
  }

  function cashOut() {
    if (phase !== 'FLYING' || cashedAt) return 0
    cashedAt = multiplier
    if (!reduced) cashPulse = 1
    const won = stake * cashedAt
    emit('cashout', { multiplier: cashedAt, stake, won })
    stake = 0
    return won
  }

  const onResize = () => { resize(); snapView(); draw() }
  window.addEventListener('resize', onResize)
  if (document.fonts && document.fonts.ready) {
    // Axis labels are canvas text, so they need a redraw once Inter lands.
    document.fonts.ready.then(() => draw()).catch(() => {})
  }

  return {
    start,
    stop: stopLoop,
    launch,
    cashOut,
    redraw() { resize(); snapView(); draw() },
    on,
    get phase() { return phase },
    get multiplier() { return multiplier },
    get busted() { return busted },
    get isRunning() { return running },
    destroy() {
      stopLoop()
      window.removeEventListener('resize', onResize)
      listeners.clear()
    },
  }
}
