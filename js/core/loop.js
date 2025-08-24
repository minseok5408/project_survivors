// js/core/loop.js
export function createLoop(update) {
  let rafId = null;

  function frame() {
    rafId = requestAnimationFrame(frame);
    update();
  }

  function start() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  return { start, stop };
}
