/* Sizzle Station — boot and main loop.
 * Parses ?shot= and ?seed=, owns the animation loop and the tiny
 * synthesised sounds (no audio files, nothing fetched). */
'use strict';

(function boot() {
  const canvas = document.getElementById('game');
  const params = new URLSearchParams(window.location.search);
  const seed = Number(params.get('seed') || '7');
  const shot = params.get('shot') || '';

  const built = makeWorld(seed);
  const world = built.world;

  /* --- sound: three short WebAudio bleeps, no files ----------------- */
  let audioCtx = null;
  function beep(freq, ms, type) {
    if (world.muted) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + ms / 1000);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + ms / 1000);
    } catch (err) {
      /* Sound is decoration; a blocked AudioContext never stops the game. */
    }
  }

  const renderer = makeRenderer(canvas);
  const input = makeInput(canvas, {
    startGame() {
      built.startGame();
      beep(660, 120, 'triangle');
    },
    addIngredient(id) {
      const before = world.plate.length + world.grill.filter((g) => g.state !== 'empty').length;
      built.addIngredient(id);
      const after = world.plate.length + world.grill.filter((g) => g.state !== 'empty').length;
      if (after > before) beep(520, 60, 'sine');
    },
    takeFromGrill(i) {
      built.takeFromGrill(i);
      beep(740, 70, 'sine');
    },
    clearPlate() {
      built.clearPlate();
    },
    serveOrder(id) {
      if (built.serveOrder(id)) {
        beep(880, 140, 'triangle');
        setTimeout(() => beep(1174, 160, 'triangle'), 120);
      } else {
        beep(180, 200, 'sawtooth');
      }
    },
    serveFirstMatch() {
      const before = world.score;
      built.serveFirstMatch();
      if (world.score > before) {
        beep(880, 140, 'triangle');
        setTimeout(() => beep(1174, 160, 'triangle'), 120);
      }
    },
    toggleMute() {
      world.muted = !world.muted;
    },
  });

  if (shot) {
    built.stageShot(shot);
  } else {
    built.startGame();
    world.phase = 'title';
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    built.update(dt);
    renderer.draw(world, input);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  window.__game = { world, built };
})();
