// Thin mount wrapper, so the same playable can go on a booth screen, in a
// post, or in a deck without dragging the /igaming page along with it.
//
// It is a build rule, not a component system: mount into one element, take a
// config object, hand back the game. Anything a future channel needs beyond
// that is that channel's job.
import { createGame } from './game.js'

const prefersReduced = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function mountGame(target, config = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return null

  let canvas = el.matches && el.matches('canvas') ? el : el.querySelector('canvas')
  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.className = 'ig-canvas'
    el.appendChild(canvas)
  }

  const reduced = config.reduced ?? prefersReduced()
  const game = createGame(canvas, { reduced })
  game.start()

  // The loop only runs while a round is in the air, so there is nothing to
  // throttle when the tab is parked. Stopping it mid-round would strand the
  // round, so a hidden tab simply keeps flying and the game's own stall
  // handling keeps the axes honest when it comes back.
  const onVisibility = () => {
    if (!document.hidden) game.redraw()
  }
  document.addEventListener('visibilitychange', onVisibility)

  return {
    game,
    canvas,
    destroy() {
      document.removeEventListener('visibilitychange', onVisibility)
      game.destroy()
    },
  }
}

export { createGame }
