// The session around the game: balance, stake, launch, cash out, history.
//
// This is where the argument of the page lives. The visitor arrives at a game
// with nothing in it: the bet controls are dead and one button works. The
// deposit is the thing that turns the machine on.

const HISTORY_MAX = 8
const fmt = (n) => n.toFixed(2)

export function createHud(root, game, options = {}) {
  if (!root || !game) return null

  const reduced = !!options.reduced
  const openCashier = options.openCashier || (() => {})
  const onLayout = options.onLayout || (() => {})

  const q = (sel) => root.querySelector(sel)
  const balanceEl = q('[data-ig-balance]')
  const multiplierEl = q('[data-ig-multiplier]')
  const stateEl = q('[data-ig-state]')
  const stakeEl = q('[data-ig-stake]')
  const launchBtn = q('[data-ig-launch]')
  const cashBtn = q('[data-ig-cashout]')
  // The multiplier rides on the button so it reads as a bet being collected
  // at a price, not as money being withdrawn from an account.
  const cashAtEl = q('[data-ig-cashout-at]')
  const depositBtn = q('[data-ig-deposit]')
  const historyEl = q('[data-ig-history]')
  const resultEl = q('[data-ig-result]')
  const stakeMinus = q('[data-ig-stake-minus]')
  const stakePlus = q('[data-ig-stake-plus]')

  let balance = 0
  let stake = 5
  let funded = false
  // READY belongs to the opening frame only. Once a round has been played the
  // board shows what it crashed at, because that is the context for the next
  // bet.
  let hasPlayed = false
  let countRaf = 0
  let cueShown = false
  let cueTimer = 0

  const emitCue = () => {
    if (cueShown) return
    cueShown = true
    root.dispatchEvent(new CustomEvent('ig:cue', { bubbles: true }))
  }

  // ---- painting -----------------------------------------------------------

  function paintBalance(value) {
    if (balanceEl) balanceEl.textContent = fmt(value)
  }

  function countBalanceTo(target) {
    cancelAnimationFrame(countRaf)
    if (reduced) { balance = target; paintBalance(balance); paintControls(); return }
    const from = balance
    const delta = target - from
    const dur = 900
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur)
      // Ease-out exponential, so the number arrives with weight and settles
      // rather than sliding to a stop.
      const eased = 1 - Math.pow(2, -10 * p)
      balance = from + delta * (p === 1 ? 1 : eased)
      paintBalance(balance)
      if (p < 1) countRaf = requestAnimationFrame(tick)
      else { balance = target; paintBalance(balance); paintControls() }
    }
    countRaf = requestAnimationFrame(tick)
  }

  function paintMultiplier(value, tone) {
    if (!multiplierEl) return
    multiplierEl.textContent = `${value.toFixed(2)}x`
    multiplierEl.className = `ig-mult${tone ? ` --${tone}` : ''}`
  }

  function setReady() {
    if (!multiplierEl) return
    // The landing state names the thing. "Live" is avoided on purpose: in
    // iGaming it means live dealer, and in payments it means production
    // rather than sandbox, so it would read as real money.
    multiplierEl.textContent = 'Demo Mode'
    multiplierEl.className = 'ig-mult --ready'
  }

  function setState(text, tone) {
    if (!stateEl) return
    stateEl.textContent = text
    stateEl.className = `ig-mult-state${tone ? ` --${tone}` : ''}`
  }

  function paintStake() {
    // Clamp only when there is something to clamp against. With a zero
    // balance the stake is still a setting the player has chosen.
    const max = Math.max(0, Math.floor(balance))
    if (max >= 1) {
      if (stake > max) stake = max
      if (stake < 1) stake = 1
    }
    if (stakeEl) stakeEl.textContent = fmt(stake)

    const locked = !funded || game.phase !== 'IDLE'
    if (stakeMinus) stakeMinus.disabled = locked || stake <= 1
    if (stakePlus) stakePlus.disabled = locked || stake + 1 > balance
  }

  function paintControls() {
    const flying = game.phase === 'FLYING'
    const broke = balance < 1

    root.classList.toggle('is-flying', flying)
    root.classList.toggle('is-broke', broke)
    root.classList.toggle('is-funded', funded)

    if (launchBtn) {
      launchBtn.hidden = flying
      launchBtn.disabled = broke || game.phase !== 'IDLE'
    }
    if (cashBtn) {
      cashBtn.hidden = !flying
      cashBtn.disabled = !flying
    }
    if (depositBtn) {
      // The deposit is the only live control while the game cannot run, and
      // steps back to a quiet outline once there are credits.
      depositBtn.classList.toggle('--lead', broke)
      depositBtn.disabled = flying
    }
    paintStake()
    // The bet panel is one of the canvas's insets, and swapping Bet for Cash
    // out changes its height, so the plot has to be told.
    onLayout()
  }


  // The board keeps its own record. It starts empty, so the opening frame is
  // a clean READY, and it fills from the visitor's own rounds.
  function pushHistory(value, wasBust) {
    if (!historyEl) return
    const chip = document.createElement('span')
    chip.className = `ig-pill${value < 2 ? ' --low' : ''}${wasBust ? ' --bust' : ''}`
    chip.textContent = `${value.toFixed(2)}x`
    historyEl.prepend(chip)
    while (historyEl.children.length > HISTORY_MAX) historyEl.lastChild.remove()
  }

  // The result sits under the credits now rather than in the bet row, so it
  // behaves like a notification: it announces itself and then clears, instead
  // of leaving the last round's outcome on screen indefinitely.
  let resultTimer = null
  let resultFade = null

  function setResult(text, tone) {
    if (!resultEl) return
    clearTimeout(resultTimer)
    clearTimeout(resultFade)
    resultEl.textContent = text || ''
    // className is rewritten here, so is-in has to go on afterwards.
    resultEl.className = `ig-result${tone ? ` --${tone}` : ''}`
    resultEl.hidden = !text
    if (!text) return
    requestAnimationFrame(() => resultEl.classList.add('is-in'))
    resultTimer = setTimeout(() => {
      resultEl.classList.remove('is-in')
      resultFade = setTimeout(() => { resultEl.hidden = true }, 300)
    }, 2800)
  }

  // ---- game events --------------------------------------------------------

  game.on('round', () => {
    hasPlayed = true
    // Reset the readout with the round rather than waiting for the first
    // tick, or the previous round's result sits there in its own color.
    paintMultiplier(1, 'live')
    setState('In flight', 'live')
    setResult('')
    paintControls()
  })

  game.on('tick', ({ multiplier }) => {
    paintMultiplier(multiplier, 'live')
    if (cashAtEl) cashAtEl.textContent = `${multiplier.toFixed(2)}x`
  })

  game.on('crash', ({ at, busted }) => {
    paintMultiplier(at, 'bust')
    setState('Crashed', 'bust')
    pushHistory(at, busted)
    if (busted) setResult(`Crashed at ${at.toFixed(2)}x. Stake gone.`, 'bust')
    paintControls()
  })

  game.on('cashout', ({ multiplier, won }) => {
    countBalanceTo(balance + won)
    setResult(`Cashed out at ${multiplier.toFixed(2)}x. +$${fmt(won)}`, 'win')
    emitCue()
  })

  game.on('idle', ({ at, busted: wasBust }) => {
    if (hasPlayed) paintMultiplier(at, wasBust ? 'bust' : 'win')
    else setReady()
    setState(funded ? 'Place your bet' : 'Deposit to play', funded ? null : 'dead')
    paintControls()
  })

  // ---- controls -----------------------------------------------------------

  function launch() {
    if (game.phase !== 'IDLE' || balance < 1) return
    const amount = Math.min(stake, Math.floor(balance))
    if (amount < 1) return
    balance -= amount
    paintBalance(balance)
    if (game.launch(amount) && !cueTimer) {
      // A cue after twenty seconds of play, in case nobody ever cashes out.
      cueTimer = setTimeout(emitCue, 20000)
    }
  }

  function cashOut() {
    if (game.phase !== 'FLYING') return
    game.cashOut()
    paintControls()
  }

  if (launchBtn) launchBtn.addEventListener('click', launch)
  if (cashBtn) cashBtn.addEventListener('click', cashOut)
  if (depositBtn) depositBtn.addEventListener('click', () => openCashier())

  if (stakeMinus) stakeMinus.addEventListener('click', () => { stake = Math.max(1, stake - 1); paintStake() })
  if (stakePlus) stakePlus.addEventListener('click', () => { stake = Math.min(Math.floor(balance), stake + 1); paintStake() })

  // Space launches, Enter cashes out, per the arcade convention. Ignored
  // while the visitor is typing or while the cashier owns the screen.
  function onKey(event) {
    const el = document.activeElement
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return
    if (document.body.classList.contains('ig-locked')) return
    if (event.code === 'Space' && game.phase === 'IDLE' && funded) { event.preventDefault(); launch() }
    else if (event.key === 'Enter' && game.phase === 'FLYING') { event.preventDefault(); cashOut() }
  }
  document.addEventListener('keydown', onKey)

  paintBalance(0)
  // Opens on READY rather than on a multiplier from a round nobody watched.
  setReady()
  setState('Deposit to play', 'dead')
  paintControls()

  return {
    credit(amount) {
      // The deposit landing is the moment the machine turns on, and it should
      // be impossible to miss: the whole panel flashes once behind the
      // counting balance.
      funded = true
      countBalanceTo(balance + amount)
      setState('Credits added')
      setResult(`Deposited. +$${fmt(amount)}`, 'win')
      paintControls()
      root.classList.remove('is-crediting')
      // Reflow so the class can be re-added and replay the flash.
      void root.offsetWidth
      root.classList.add('is-crediting')
      setTimeout(() => {
        root.classList.remove('is-crediting')
        setState(balance >= 1 ? 'Place your bet' : 'Deposit to play')
      }, 1800)
    },
    get balance() { return balance },
    destroy() {
      document.removeEventListener('keydown', onKey)
      cancelAnimationFrame(countRaf)
      clearTimeout(cueTimer)
    },
  }
}
