/* Sizzle Station — mouse and keyboard input.
 * The renderer registers this frame's clickable rectangles; input resolves
 * a click against them and calls the matching world verb. Nothing here
 * knows how the game looks beyond those rectangles. */
'use strict';

function makeInput(canvas, api) {
  const regions = []; // {x,y,w,h,id}
  let hoverId = '';

  function clearRegions() {
    regions.length = 0;
  }

  function addRegion(x, y, w, h, id) {
    regions.push({ x, y, w, h, id });
  }

  function pointIn(r, x, y) {
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  }

  function pick(x, y) {
    for (let i = regions.length - 1; i >= 0; i--) {
      if (pointIn(regions[i], x, y)) return regions[i].id;
    }
    return '';
  }

  function toCanvas(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * CONFIG.width,
      y: ((event.clientY - rect.top) / rect.height) * CONFIG.height,
    };
  }

  function act(id) {
    if (!id) return;
    if (id === 'start') {
      api.startGame();
      return;
    }
    if (id === 'restart') {
      api.startGame();
      return;
    }
    if (id === 'serve') {
      api.serveFirstMatch();
      return;
    }
    if (id === 'clear') {
      api.clearPlate();
      return;
    }
    if (id === 'mute') {
      api.toggleMute();
      return;
    }
    if (id.startsWith('bin:')) {
      api.addIngredient(id.slice(4));
      return;
    }
    if (id.startsWith('grill:')) {
      api.takeFromGrill(Number(id.slice(6)));
      return;
    }
    if (id.startsWith('order:')) {
      api.serveOrder(Number(id.slice(6)));
      return;
    }
  }

  canvas.addEventListener('click', (event) => {
    const p = toCanvas(event);
    act(pick(p.x, p.y));
  });

  canvas.addEventListener('mousemove', (event) => {
    const p = toCanvas(event);
    const id = pick(p.x, p.y);
    hoverId = id;
    canvas.style.cursor = id ? 'pointer' : 'default';
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    const ing = INGREDIENTS.find((g) => g.key === key);
    if (ing) {
      api.addIngredient(ing.id);
      return;
    }
    if (key === ' ') {
      event.preventDefault();
      api.serveFirstMatch();
    } else if (key === 'backspace' || key === 'r') {
      api.clearPlate();
    } else if (key === 'g') {
      api.takeFromGrill(0);
    } else if (key === 'enter') {
      api.startGame();
    } else if (key === 'm') {
      api.toggleMute();
    }
  });

  return {
    clearRegions,
    addRegion,
    hoverId: () => hoverId,
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { makeInput };
}
