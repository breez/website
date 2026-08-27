// Page entry for /igaming.
//
// This bundle is referenced directly by igaming.html and is separate from the
// shared site bundle, so the game costs nothing on any other page. The header,
// footer, burger and contact form still come from the shared bundle, which is
// why they behave exactly as they do everywhere else on the site.
import { mountGame } from './embed.js'
import { createCashier } from './cashier.js'
import { createHud } from './hud.js'

const prefersReduced = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function boot() {
  const machine = document.querySelector('[data-ig-machine]')
  if (!machine || machine.dataset.igBooted) return
  machine.dataset.igBooted = '1'

  const reduced = prefersReduced()
  const canvasHost = machine.querySelector('[data-ig-canvas]')
  const mounted = mountGame(canvasHost, { reduced })
  if (!mounted) return
  const { game } = mounted

  // The bet panel swaps Bet for Cash Out, which changes its height and so the
  // board's, so the plot is told whenever the controls repaint.
  const relayout = () => { game.redraw(); setTimeout(() => game.redraw(), 260) }
  window.addEventListener('resize', () => game.redraw(), { passive: true })

  const cashierRoot = document.querySelector('[data-ig-cashier]')

  let hud = null
  const cashier = createCashier(cashierRoot, {
    reduced,
    onDeposit: (credits) => { if (hud) hud.credit(credits) },
    // The canvas is decoration while the sheet is open, and a live animation
    // underneath a dialog is noise for a screen reader.
    onOpen: () => {
      machine.classList.add('is-covered')
      if (canvasHost) canvasHost.setAttribute('aria-hidden', 'true')
    },
    onClose: () => {
      machine.classList.remove('is-covered')
      if (canvasHost) canvasHost.removeAttribute('aria-hidden')
      relayout()
    },
  })

  hud = createHud(machine, game, {
    reduced,
    openCashier: () => { if (cashier) cashier.open() },
    onLayout: relayout,
  })

  // Every "try the deposit" on the page is the machine's own deposit button.
  // Opening the cashier from halfway down the page would float a payment
  // sheet over body copy with no game behind it, so the page goes back to the
  // machine first and only opens the cashier once it has actually arrived.
  const openInGame = () => {
    if (!cashier) return

    const nearGame = machine.getBoundingClientRect().bottom > window.innerHeight * 0.5
    if (nearGame) { cashier.open(); return }

    const target = Math.max(0, machine.getBoundingClientRect().top + window.scrollY)
    window.scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' })

    // Wait for the scroll to settle rather than guessing a delay: the cashier
    // locks the body when it opens, and locking mid-scroll cancels the scroll
    // and strands the sheet over the copy. Timers rather than rAF, because a
    // background tab throttles rAF to a crawl and the sheet would open long
    // after the visitor came back.
    let previous = -1
    let waited = 0
    const STEP = 60
    const LIMIT = 1200

    const finish = () => {
      // Whatever the smooth scroll did or did not manage, land on the machine
      // before the sheet appears: it must never open with no game behind it.
      // scroll-behavior is smooth site-wide, so this last-resort jump has to
      // opt out of it, or it animates and the body lock cancels it too.
      if (Math.abs(window.scrollY - target) > 4) {
        const root = document.documentElement
        const previousBehavior = root.style.scrollBehavior
        root.style.scrollBehavior = 'auto'
        root.scrollTop = target
        root.style.scrollBehavior = previousBehavior
      }
      cashier.open()
    }

    const settle = () => {
      const y = window.scrollY
      if ((Math.abs(y - previous) < 1 && waited >= STEP * 2) || waited >= LIMIT) {
        finish()
        return
      }
      previous = y
      waited += STEP
      setTimeout(settle, STEP)
    }
    setTimeout(settle, STEP)
  }

  document.querySelectorAll('[data-ig-try]').forEach((btn) => {
    btn.addEventListener('click', (event) => { event.preventDefault(); openInGame() })
  })

  // The scroll cue appears once, after the first cash-out or twenty seconds
  // of play, then gets out of the way for good.
  const cue = document.querySelector('[data-ig-cue]')
  document.addEventListener('ig:cue', () => { if (cue) cue.classList.add('is-on') })
  if (cue) {
    cue.addEventListener('click', () => {
      const next = document.querySelector('#igaming-what')
      if (next) next.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    })
    window.addEventListener('scroll', () => {
      if (window.scrollY > window.innerHeight * 0.6) cue.classList.remove('is-on')
    }, { passive: true })
  }

  // The contact form lives behind a button. A wall of empty inputs sitting on
  // the page is not a call to action, and this page has exactly one.
  const contactRoot = document.querySelector('[data-ig-contact-modal]')
  if (contactRoot) {
    let lastFocus = null

    const openContact = () => {
      lastFocus = document.activeElement
      contactRoot.hidden = false
      document.body.classList.add('ig-locked')
      requestAnimationFrame(() => {
        contactRoot.classList.add('is-open')
        const first = contactRoot.querySelector('[data-ig-contact-first]')
        if (first) first.focus()
      })
    }

    const closeContact = () => {
      contactRoot.classList.remove('is-open')
      document.body.classList.remove('ig-locked')
      const finish = () => { contactRoot.hidden = true }
      if (reduced) finish()
      else setTimeout(finish, 220)
      if (lastFocus && lastFocus.focus) lastFocus.focus()
    }

    document.querySelectorAll('[data-ig-contact]').forEach((btn) => {
      btn.addEventListener('click', (event) => { event.preventDefault(); openContact() })
    })
    contactRoot.querySelectorAll('[data-ig-contact-close]').forEach((btn) => {
      btn.addEventListener('click', closeContact)
    })

    // Escape closes; Tab stays inside, since this is a dialog over the page.
    contactRoot.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') { event.preventDefault(); closeContact(); return }
      if (event.key !== 'Tab') return
      const focusable = Array.from(contactRoot.querySelectorAll(
        'button:not([disabled]), input, textarea, a[href], [tabindex]:not([tabindex="-1"])',
      )).filter((el) => el.offsetParent !== null)
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    })
  }

  // The language switcher on the code block. Panels are in the markup; this
  // only moves the selected state, so the code is readable with no JS at all.
  const langBar = document.querySelector('[data-ig-langs]')
  if (langBar) {
    const tabs = Array.from(langBar.querySelectorAll('[data-ig-lang]'))
    const panels = Array.from(document.querySelectorAll('[data-ig-lang-panel]'))
    const select = (name) => {
      tabs.forEach((t) => {
        const on = t.dataset.igLang === name
        t.classList.toggle('is-on', on)
        t.setAttribute('aria-selected', on ? 'true' : 'false')
        t.tabIndex = on ? 0 : -1
      })
      panels.forEach((p) => { p.hidden = p.dataset.igLangPanel !== name })
    }
    langBar.addEventListener('click', (event) => {
      const tab = event.target.closest('[data-ig-lang]')
      if (tab) select(tab.dataset.igLang)
    })
    langBar.addEventListener('keydown', (event) => {
      const i = tabs.findIndex((t) => t.classList.contains('is-on'))
      if (i < 0) return
      let next = null
      if (event.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length]
      else if (event.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length]
      if (next) { event.preventDefault(); select(next.dataset.igLang); next.focus() }
    })
    select(tabs[0] ? tabs[0].dataset.igLang : 'typescript')
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot)
} else {
  boot()
}
