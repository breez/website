// The deposit simulation that sits over the game.
//
// Five screens: the operator's cashier, the amount, the quote, the payment,
// and the return. Nothing here touches the SDK or a network. Every figure is
// derived from the fixed rates below and is labeled illustrative on screen.
//
// All copy lives in the page markup so the accessible path is the DOM and so
// the wording can be edited without reading JavaScript. This module only moves
// between panes, does the arithmetic, and runs the clock.

// Rates held in one place so the page cannot contradict itself.
//
// The fee sits ON TOP of the deposit: the player picks an amount, that whole
// amount lands in the treasury, and the fee is added to what they pay. So a
// $50 deposit delivers 50.00 USDC and the player is charged $50.13.
//
// 25 basis points, given by Breez. SATS_PER_DOLLAR assumes a round $100,000
// bitcoin, which keeps the sats figure legible rather than precise.
const FEE_BPS = 25
const SATS_PER_DOLLAR = 1000
const QUOTE_SECONDS = 120
const MIN_USD = 5
const MAX_USD = 500

const STEPS = ['method', 'amount', 'quote', 'pay', 'done']

const usd = (n) => n.toFixed(2)
const grouped = (n) => Math.round(n).toLocaleString('en-US')

export function createCashier(root, options = {}) {
  if (!root) return null

  const onDeposit = options.onDeposit || (() => {})
  const onOpen = options.onOpen || (() => {})
  const onClose = options.onClose || (() => {})
  const reduced = !!options.reduced

  const panes = new Map()
  STEPS.forEach((name) => {
    const el = root.querySelector(`[data-ig-step="${name}"]`)
    if (el) panes.set(name, el)
  })

  const q = (sel) => root.querySelector(sel)
  const sheet = q('.ig-sheet')
  const amountField = q('[data-ig-amount-input]')
  const presets = Array.from(root.querySelectorAll('[data-ig-preset]'))
  const amountError = q('[data-ig-amount-error]')

  let amount = Number(root.dataset.igDefaultAmount || 50)
  let step = 'method'
  let timerId = 0
  let payId = 0
  let secondsLeft = QUOTE_SECONDS
  let lastFocus = null

  // The chosen amount is what lands; the fee is charged on top of it.
  const delivered = () => amount
  const feeUsd = () => amount * (FEE_BPS / 10000)
  const paidUsd = () => amount + feeUsd()
  const sats = () => paidUsd() * SATS_PER_DOLLAR

  function setText(sel, value) {
    root.querySelectorAll(sel).forEach((el) => { el.textContent = value })
  }

  function paintFigures() {
    setText('[data-ig-f-usd]', `$${usd(paidUsd())}`)
    setText('[data-ig-f-sats]', `${grouped(sats())} sats`)
    setText('[data-ig-f-out]', `${usd(delivered())} USDC`)
    setText('[data-ig-f-fee]', `$${usd(feeUsd())}`)
    presets.forEach((btn) => {
      const on = Number(btn.dataset.igPreset) === amount
      btn.classList.toggle('is-on', on)
      btn.setAttribute('aria-pressed', on ? 'true' : 'false')
    })
  }

  function show(name) {
    step = name
    panes.forEach((el, key) => {
      const on = key === name
      el.hidden = !on
      el.classList.toggle('is-on', on)
    })
    root.dataset.igCurrent = name
    if (sheet) sheet.scrollTop = 0
  }

  // ---- clock --------------------------------------------------------------

  function stopClock() {
    if (timerId) { clearInterval(timerId); timerId = 0 }
  }

  function paintClock() {
    const m = Math.floor(secondsLeft / 60)
    const s = String(secondsLeft % 60).padStart(2, '0')
    setText('[data-ig-clock]', `${m}:${s}`)
    const bar = q('[data-ig-clock-bar]')
    if (bar) bar.style.transform = `scaleX(${secondsLeft / QUOTE_SECONDS})`
    root.classList.toggle('is-expired', secondsLeft <= 0)
  }

  function startClock() {
    stopClock()
    secondsLeft = QUOTE_SECONDS
    paintClock()
    timerId = setInterval(() => {
      secondsLeft = Math.max(0, secondsLeft - 1)
      paintClock()
      if (secondsLeft === 0) stopClock()
    }, 1000)
  }

  // ---- steps --------------------------------------------------------------

  function validAmount(value) {
    return Number.isFinite(value) && value >= MIN_USD && value <= MAX_USD
  }

  function readAmount() {
    if (!amountField) return amount
    const raw = Number(String(amountField.value).replace(/[^0-9.]/g, ''))
    return raw
  }

  function goQuote() {
    const value = readAmount()
    if (!validAmount(value)) {
      if (amountError) {
        amountError.textContent = `Pick an amount between $${MIN_USD} and $${MAX_USD}.`
        amountError.hidden = false
      }
      if (amountField) amountField.focus()
      return
    }
    if (amountError) amountError.hidden = true
    amount = Math.round(value * 100) / 100
    paintFigures()
    show('quote')
    startClock()
  }

  function goPay() {
    if (secondsLeft <= 0) return
    show('pay')
    // A short, honest hold: long enough to read the screen, short enough that
    // nobody waits on a demo. Real delivery is on the order of thirty seconds.
    const hold = reduced ? 500 : 1900
    root.classList.add('is-confirming')
    payId = setTimeout(() => {
      root.classList.remove('is-confirming')
      stopClock()
      show('done')
      onDeposit(delivered())
    }, hold)
  }

  function reset() {
    stopClock()
    clearTimeout(payId)
    root.classList.remove('is-confirming', 'is-expired')
    amount = Number(root.dataset.igDefaultAmount || 50)
    if (amountField) amountField.value = usd(amount)
    if (amountError) amountError.hidden = true
    paintFigures()
    show('method')
  }

  // ---- open / close -------------------------------------------------------

  function open() {
    lastFocus = document.activeElement
    reset()
    root.hidden = false
    document.body.classList.add('ig-locked')
    requestAnimationFrame(() => {
      root.classList.add('is-open')
      const first = root.querySelector('[data-ig-autofocus]')
      if (first) first.focus()
    })
    onOpen()
  }

  function close() {
    stopClock()
    clearTimeout(payId)
    root.classList.remove('is-open')
    document.body.classList.remove('ig-locked')
    const finish = () => { root.hidden = true }
    if (reduced) finish()
    else setTimeout(finish, 220)
    if (lastFocus && lastFocus.focus) lastFocus.focus()
    onClose()
  }

  // ---- wiring -------------------------------------------------------------

  root.addEventListener('click', (event) => {
    const t = event.target.closest('[data-ig-act]')
    if (!t || !root.contains(t)) return
    const act = t.dataset.igAct
    if (act === 'close') close()
    else if (act === 'method') show('amount')
    else if (act === 'quote') goQuote()
    else if (act === 'pay') goPay()
    else if (act === 'back-method') show('method')
    else if (act === 'back-amount') { stopClock(); show('amount') }
    else if (act === 'refresh') startClock()
  })

  presets.forEach((btn) => {
    btn.addEventListener('click', () => {
      amount = Number(btn.dataset.igPreset)
      if (amountField) amountField.value = usd(amount)
      if (amountError) amountError.hidden = true
      paintFigures()
    })
  })

  if (amountField) {
    amountField.addEventListener('input', () => {
      const value = readAmount()
      if (validAmount(value)) {
        amount = value
        if (amountError) amountError.hidden = true
        paintFigures()
      }
    })
    amountField.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') { event.preventDefault(); goQuote() }
    })
  }

  // Escape closes, Tab stays inside: this is a modal over a live canvas, so
  // letting focus wander into the game behind it would be a trap of its own.
  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); close(); return }
    if (event.key !== 'Tab') return
    const focusable = Array.from(
      root.querySelectorAll('button:not([disabled]), input, a[href], [tabindex]:not([tabindex="-1"])'),
    ).filter((el) => el.offsetParent !== null)
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus()
    }
  })

  paintFigures()

  return { open, close, get step() { return step }, get isOpen() { return !root.hidden } }
}
