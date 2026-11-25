/* Sizzle Station — everything the player sees, drawn on one canvas.
 * No images, no fonts from the network: every shape is drawn here, so the
 * game looks the same offline. Layout: top HUD, order board on the left,
 * ingredient bins and grill in the middle, assembly plate and serve
 * window on the right. */
'use strict';

function makeRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const W = CONFIG.width;
  const H = CONFIG.height;

  /* --- small drawing helpers --------------------------------------- */

  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function text(str, x, y, size, colour, align, bold) {
    ctx.fillStyle = colour || COLOURS.ink;
    ctx.font = (bold ? 'bold ' : '') + size + 'px Verdana, sans-serif';
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(str, x, y);
  }

  function heart(x, y, s, colour) {
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.35);
    ctx.bezierCurveTo(x - s * 0.6, y - s * 0.25, x - s * 0.25, y - s * 0.7, x, y - s * 0.2);
    ctx.bezierCurveTo(x + s * 0.25, y - s * 0.7, x + s * 0.6, y - s * 0.25, x, y + s * 0.35);
    ctx.fill();
  }

  /* One ingredient, drawn small enough for a ticket or a bin. */
  function drawIngredientIcon(id, x, y, s) {
    const half = s / 2;
    if (id === 'bunBottom' || id === 'bunTop') {
      ctx.fillStyle = '#e8a94f';
      ctx.beginPath();
      if (id === 'bunTop') {
        ctx.arc(x, y + half * 0.5, half, Math.PI, 0);
      } else {
        ctx.arc(x, y - half * 0.5, half, 0, Math.PI);
      }
      ctx.fill();
      ctx.fillStyle = '#b97d2c';
      ctx.fillRect(x - half, y + (id === 'bunTop' ? half * 0.5 - 2 : -half * 0.5 - 2), s, 4);
      if (id === 'bunTop') {
        ctx.fillStyle = '#fff3d6';
        ctx.beginPath();
        ctx.arc(x - half * 0.4, y - half * 0.25, 2, 0, Math.PI * 2);
        ctx.arc(x + half * 0.35, y - half * 0.45, 2, 0, Math.PI * 2);
        ctx.arc(x + half * 0.1, y - half * 0.1, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }
    if (id === 'patty' || id === 'pattyRaw') {
      ctx.fillStyle = id === 'patty' ? '#7a4a21' : '#c96f4a';
      rr(x - half, y - half * 0.45, s, s * 0.9, s * 0.25);
      ctx.fill();
      return;
    }
    if (id === 'cheese') {
      ctx.fillStyle = '#f7c948';
      ctx.beginPath();
      ctx.moveTo(x - half, y + half * 0.5);
      ctx.lineTo(x + half, y + half * 0.5);
      ctx.lineTo(x + half, y - half * 0.5);
      ctx.closePath();
      ctx.fill();
      return;
    }
    if (id === 'lettuce') {
      ctx.fillStyle = '#7bc96f';
      ctx.beginPath();
      for (let i = 0; i <= 6; i++) {
        const px = x - half + (i * s) / 6;
        const py = y + (i % 2 === 0 ? -half * 0.4 : half * 0.4);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.lineTo(x + half, y + half * 0.4);
      ctx.lineTo(x - half, y + half * 0.4);
      ctx.closePath();
      ctx.fill();
      return;
    }
    if (id === 'tomato') {
      ctx.fillStyle = '#e05252';
      ctx.beginPath();
      ctx.arc(x, y, half * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f28b8b';
      ctx.beginPath();
      ctx.arc(x, y, half * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* A burger stacked on a plate, layers bottom to top. */
  function drawBurgerStack(ids, cx, baseY, width) {
    const layerH = 15;
    let y = baseY;
    // Plate
    ctx.fillStyle = COLOURS.plate;
    ctx.beginPath();
    ctx.ellipse(cx, baseY + 10, width / 2 + 14, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d8d2c4';
    ctx.lineWidth = 2;
    ctx.stroke();
    for (let i = ids.length - 1; i >= 0; i--) {
      const id = ids[i];
      y -= layerH;
      if (id === 'bunBottom') {
        ctx.fillStyle = '#e8a94f';
        rr(cx - width / 2, y, width, layerH + 4, 7);
        ctx.fill();
      } else if (id === 'bunTop') {
        ctx.fillStyle = '#e8a94f';
        ctx.beginPath();
        ctx.arc(cx, y + layerH, width / 2, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#fff3d6';
        ctx.beginPath();
        ctx.arc(cx - width * 0.22, y + 2, 2.5, 0, Math.PI * 2);
        ctx.arc(cx + width * 0.18, y - 2, 2.5, 0, Math.PI * 2);
        ctx.arc(cx + width * 0.05, y + 4, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (id === 'patty') {
        ctx.fillStyle = '#7a4a21';
        rr(cx - width / 2 - 4, y, width + 8, layerH, 7);
        ctx.fill();
      } else if (id === 'cheese') {
        ctx.fillStyle = '#f7c948';
        ctx.beginPath();
        ctx.moveTo(cx - width / 2 - 6, y + layerH);
        ctx.lineTo(cx + width / 2 + 6, y + layerH);
        ctx.lineTo(cx + width / 2, y);
        ctx.lineTo(cx - width / 2, y);
        ctx.closePath();
        ctx.fill();
      } else if (id === 'lettuce') {
        ctx.fillStyle = '#7bc96f';
        ctx.beginPath();
        ctx.moveTo(cx - width / 2 - 6, y + layerH);
        for (let k = 0; k <= 6; k++) {
          ctx.lineTo(cx - width / 2 - 6 + (k * (width + 12)) / 6, y + (k % 2 === 0 ? 2 : layerH - 2));
        }
        ctx.lineTo(cx + width / 2 + 6, y + layerH);
        ctx.closePath();
        ctx.fill();
      } else if (id === 'tomato') {
        ctx.fillStyle = '#e05252';
        rr(cx - width / 2 + 6, y, width - 12, layerH - 2, 6);
        ctx.fill();
      }
    }
    return y;
  }

  /* --- scene pieces -------------------------------------------------- */

  function drawKitchen() {
    ctx.fillStyle = COLOURS.wall;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = COLOURS.wallTile;
    for (let x = 0; x < W; x += 64) {
      ctx.fillRect(x, 64, 62, 3);
    }
    // Window with sun
    ctx.fillStyle = '#bfe3f0';
    rr(1020, 84, 220, 130, 10);
    ctx.fill();
    ctx.fillStyle = '#fff2b0';
    ctx.beginPath();
    ctx.arc(1080, 130, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8fce62';
    ctx.fillRect(1020, 182, 220, 32);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.strokeRect(1020, 84, 220, 130);
    // Floor
    ctx.fillStyle = COLOURS.floor;
    ctx.fillRect(0, 560, W, H - 560);
    // Counter
    ctx.fillStyle = COLOURS.counterTop;
    ctx.fillRect(320, 540, 936, 20);
    ctx.fillStyle = COLOURS.counter;
    ctx.fillRect(320, 560, 936, 4);
  }

  function drawHud(w, input) {
    ctx.fillStyle = '#2f3e46';
    ctx.fillRect(0, 0, W, 64);
    text('SIZZLE STATION', 24, 33, 26, '#ffd166', 'left', true);
    const mm = Math.floor(Math.max(0, w.timeLeft) / 60);
    const ss = Math.floor(Math.max(0, w.timeLeft) % 60).toString().padStart(2, '0');
    const low = w.timeLeft <= 30 && w.phase === 'playing';
    text('⏱ ' + mm + ':' + ss, 640, 33, 28, low ? '#ff6b6b' : '#ffffff', 'center', true);
    ctx.fillStyle = '#4d9c42';
    const tw = 220;
    ctx.fillRect(530, 52, tw * Math.max(0, w.timeLeft) / CONFIG.shiftSeconds, 5);
    text('SCORE ' + w.score, 960, 26, 20, '#ffffff', 'left', true);
    text('$ ' + w.coins, 960, 48, 20, '#ffd166', 'left', true);
    for (let i = 0; i < CONFIG.hearts; i++) {
      heart(1150 + i * 30, 32, 22, i < w.hearts ? '#ff5d5d' : '#5a6b74');
    }
    const muteLabel = w.muted ? 'SOUND OFF' : 'SOUND ON';
    ctx.fillStyle = '#4a5a63';
    rr(1120, 48, 130, 20, 6);
    ctx.fill();
    text(muteLabel, 1185, 58, 12, '#ffffff', 'center', true);
    input.addRegion(1120, 48, 130, 20, 'mute');
  }

  function drawOrderBoard(w, input) {
    ctx.fillStyle = COLOURS.board;
    rr(24, 84, 276, 456, 12);
    ctx.fill();
    text('ORDER BOARD', 162, 112, 20, '#ffd166', 'center', true);
    if (w.orders.length === 0) {
      text('No orders yet…', 162, 300, 16, '#9fb3c0', 'center');
      return;
    }
    w.orders.forEach((order, i) => {
      const y = 132 + i * 138;
      const hot = w.flashOrderId === order.id;
      ctx.fillStyle = COLOURS.boardPaper;
      rr(40, y, 244, 124, 8);
      ctx.fill();
      if (hot) {
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 4;
        rr(40, y, 244, 124, 8);
        ctx.stroke();
      }
      const ratio = Math.max(0, order.patience / order.maxPatience);
      const barColour = ratio > 0.5 ? '#4d9c42' : ratio > 0.25 ? '#f7c948' : '#d64545';
      text('TICKET #' + order.id, 56, y + 18, 14, COLOURS.muted, 'left', true);
      text('$' + order.recipe.price, 268, y + 18, 14, '#b97d2c', 'right', true);
      text(order.recipe.name, 56, y + 44, 20, COLOURS.ink, 'left', true);
      text(order.recipe.blurb, 56, y + 66, 12, COLOURS.muted, 'left');
      order.recipe.needs.forEach((need, k) => {
        drawIngredientIcon(need, 72 + k * 40, y + 96, 30);
      });
      ctx.fillStyle = '#e3dcc8';
      rr(56, y + 112, 212, 6, 3);
      ctx.fill();
      ctx.fillStyle = barColour;
      rr(56, y + 112, 212 * ratio, 6, 3);
      ctx.fill();
      input.addRegion(40, y, 244, 124, 'order:' + order.id);
    });
  }

  function drawBins(w, input) {
    text('INGREDIENTS — click or press 1–6', 340, 108, 16, COLOURS.ink, 'left', true);
    INGREDIENTS.forEach((ing, i) => {
      const x = 340 + i * 104;
      const y = 122;
      const hover = input.hoverId() === 'bin:' + ing.id;
      ctx.fillStyle = hover ? '#ffffff' : '#fdf6e3';
      rr(x, y, 92, 96, 10);
      ctx.fill();
      ctx.strokeStyle = hover ? '#ffd166' : '#d8c9a3';
      ctx.lineWidth = hover ? 3 : 2;
      rr(x, y, 92, 96, 10);
      ctx.stroke();
      drawIngredientIcon(ing.id === 'pattyRaw' ? 'pattyRaw' : ing.id, x + 46, y + 34, 44);
      text(ing.short, x + 46, y + 70, 13, COLOURS.ink, 'center', true);
      text('[' + ing.key + ']', x + 46, y + 88, 11, COLOURS.muted, 'center');
      input.addRegion(x, y, 92, 96, 'bin:' + ing.id);
    });
  }

  function drawGrill(w, input) {
    text('GRILL — raw patty goes here (key 2)', 340, 252, 16, COLOURS.ink, 'left', true);
    ctx.fillStyle = COLOURS.grill;
    rr(340, 266, 300, 120, 10);
    ctx.fill();
    w.grill.forEach((slot, i) => {
      const x = 356 + i * 146;
      const y = 282;
      ctx.fillStyle = '#22262a';
      rr(x, y, 130, 88, 8);
      ctx.fill();
      if (slot.state === 'empty') {
        text('empty', x + 65, y + 44, 14, '#7d8891', 'center');
      } else {
        const isCooking = slot.state === 'cooking';
        const isDone = slot.state === 'done';
        const isBurnt = slot.state === 'burnt';
        ctx.fillStyle = isBurnt ? '#1a1a1a' : '#7a4a21';
        ctx.beginPath();
        ctx.ellipse(x + 65, y + 52, 44, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        if (isCooking) {
          const p = Math.min(1, slot.t / CONFIG.grillCookSeconds);
          ctx.strokeStyle = '#e4572e';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(x + 65, y + 44, 34, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2);
          ctx.stroke();
          text(Math.ceil(CONFIG.grillCookSeconds - slot.t) + 's', x + 65, y + 44, 16, '#ffffff', 'center', true);
        } else if (isDone) {
          text('READY!', x + 65, y + 20, 14, '#7bc96f', 'center', true);
          text('click to take', x + 65, y + 74, 11, '#c8d2d8', 'center');
        } else {
          text('BURNT!', x + 65, y + 20, 14, '#ff6b6b', 'center', true);
          text('click to toss', x + 65, y + 74, 11, '#c8d2d8', 'center');
        }
      }
      input.addRegion(x, y, 130, 88, 'grill:' + i);
    });
  }

  function drawPlateArea(w, input) {
    text('YOUR PLATE', 680, 252, 16, COLOURS.ink, 'left', true);
    ctx.fillStyle = '#fdf6e3';
    rr(680, 266, 300, 120, 10);
    ctx.fill();
    ctx.strokeStyle = '#d8c9a3';
    ctx.lineWidth = 2;
    rr(680, 266, 300, 120, 10);
    ctx.stroke();
    if (w.plate.length === 0) {
      text('Empty plate', 830, 320, 16, COLOURS.muted, 'center');
      text('Start with the bottom bun', 830, 344, 12, COLOURS.muted, 'center');
    } else {
      drawBurgerStack(w.plate, 830, 356, 150);
    }
  }

  function drawServeWindow(w, input) {
    text('SERVE WINDOW', 1000, 252, 16, COLOURS.ink, 'left', true);
    ctx.fillStyle = '#fdf6e3';
    rr(1000, 266, 256, 120, 10);
    ctx.fill();
    ctx.strokeStyle = '#d8c9a3';
    ctx.lineWidth = 2;
    rr(1000, 266, 256, 120, 10);
    ctx.stroke();
    const match = w.orders.find((o) => {
      const want = o.recipe.needs.slice().sort().join(',');
      const have = w.plate.slice().sort().join(',');
      return want === have && w.plate.length > 0;
    });
    if (w.justServed) {
      ctx.fillStyle = '#4d9c42';
      rr(1020, 286, 216, 44, 8);
      ctx.fill();
      text('ORDER UP!', 1128, 308, 20, '#ffffff', 'center', true);
      text(w.justServed.name + '  ·  +' + w.justServed.points + ' pts  ·  $' + w.justServed.coins, 1128, 352, 14, COLOURS.ink, 'center', true);
    } else if (match) {
      ctx.fillStyle = '#4d9c42';
      rr(1020, 286, 216, 44, 8);
      ctx.fill();
      text('READY: ' + match.recipe.name, 1128, 308, 17, '#ffffff', 'center', true);
      text('Click the ticket or press Space', 1128, 352, 13, COLOURS.muted, 'center');
    } else if (w.plate.length === 0) {
      text('Build a dish first,', 1128, 308, 15, COLOURS.muted, 'center');
      text('then serve its ticket.', 1128, 332, 15, COLOURS.muted, 'center');
    } else {
      // The plate is part of some ticket: say what is still missing.
      const partial = w.orders
        .map((o) => {
          const have = w.plate.slice();
          const missing = o.recipe.needs.filter((n) => {
            const i = have.indexOf(n);
            if (i >= 0) {
              have.splice(i, 1);
              return false;
            }
            return true;
          });
          return { order: o, missing };
        })
        .filter((p) => p.missing.length > 0 && p.missing.length < p.order.recipe.needs.length)
        .sort((a, b) => a.missing.length - b.missing.length)[0];
      if (partial) {
        const done = partial.order.recipe.needs.length - partial.missing.length;
        const nextName = (INGREDIENTS.find((g) => g.id === partial.missing[0]) || {}).name || partial.missing[0];
        text(done + ' of ' + partial.order.recipe.needs.length + ' — add the ' + nextName + '!', 1128, 308, 15, '#4d9c42', 'center', true);
        text('Ticket #' + partial.order.id + ' · ' + partial.order.recipe.name, 1128, 332, 13, COLOURS.muted, 'center');
      } else {
        text('No ticket matches this plate.', 1128, 308, 15, '#d64545', 'center');
        text('Check the recipes on the board.', 1128, 332, 13, COLOURS.muted, 'center');
      }
    }
    // Serve + clear buttons
    ctx.fillStyle = '#e4572e';
    rr(1000, 400, 124, 48, 8);
    ctx.fill();
    text('SERVE', 1062, 425, 18, '#ffffff', 'center', true);
    input.addRegion(1000, 400, 124, 48, 'serve');
    ctx.fillStyle = '#8a979f';
    rr(1132, 400, 124, 48, 8);
    ctx.fill();
    text('CLEAR', 1194, 425, 18, '#ffffff', 'center', true);
    input.addRegion(1132, 400, 124, 48, 'clear');
  }

  function drawBottomBar(w) {
    text('YOUR PLATE:', 340, 500, 14, COLOURS.muted, 'left', true);
    if (w.plate.length === 0) {
      text('(empty)', 450, 500, 14, COLOURS.muted, 'left');
    } else {
      w.plate.forEach((id, i) => {
        drawIngredientIcon(id, 470 + i * 44, 500, 30);
      });
    }
    text('1–6 add  ·  G take patty  ·  Space serve  ·  R clear  ·  M sound', 340, 530, 14, COLOURS.muted, 'left');
    if (w.toast && w.toastT > 0) {
      text(w.toast, 640, 578, 18, '#7a4a21', 'center', true);
    }
    for (const f of w.floaters) {
      const a = 1 - f.t / f.life;
      ctx.globalAlpha = a;
      text(f.text, f.x, f.y - f.t * 25, 26, f.colour, 'center', true);
      ctx.globalAlpha = 1;
    }
  }

  function drawTitle(w, input) {
    ctx.fillStyle = 'rgba(43, 43, 43, 0.55)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = COLOURS.cream;
    rr(340, 150, 600, 400, 16);
    ctx.fill();
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 4;
    rr(340, 150, 600, 400, 16);
    ctx.stroke();
    text('SIZZLE STATION', 640, 210, 48, '#e4572e', 'center', true);
    text('A fast grill cooking game', 640, 256, 20, COLOURS.muted, 'center');
    text('Orders land on the board — build each dish on your plate,', 640, 310, 17, COLOURS.ink, 'center');
    text('grill the patty, beat the patience bar, serve it hot.', 640, 338, 17, COLOURS.ink, 'center');
    text('Click ingredients or press 1–6  ·  Space serves  ·  R clears', 640, 386, 15, COLOURS.muted, 'center');
    ctx.fillStyle = '#e4572e';
    rr(520, 420, 240, 56, 10);
    ctx.fill();
    text('START SHIFT', 640, 449, 22, '#ffffff', 'center', true);
    input.addRegion(520, 420, 240, 56, 'start');
    text('150 seconds. 3 hearts. No burnt patties.', 640, 510, 14, COLOURS.muted, 'center');
  }

  function drawGameOver(w, input) {
    ctx.fillStyle = 'rgba(43, 43, 43, 0.55)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = COLOURS.cream;
    rr(340, 150, 600, 400, 16);
    ctx.fill();
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 4;
    rr(340, 150, 600, 400, 16);
    ctx.stroke();
    text(w.overReason || 'Shift complete!', 640, 210, 30, '#e4572e', 'center', true);
    text('SCORE  ' + w.score, 640, 280, 26, COLOURS.ink, 'center', true);
    text('Dishes served: ' + w.servedCount + '    Walkouts: ' + w.missedCount + '    Coins: $' + w.coins, 640, 330, 18, COLOURS.muted, 'center');
    const best = w.servedCount >= 9 ? 'Head chef material!' : w.servedCount >= 5 ? 'Solid shift!' : 'The grill awaits your comeback.';
    text(best, 640, 380, 18, '#4d9c42', 'center', true);
    ctx.fillStyle = '#e4572e';
    rr(520, 420, 240, 56, 10);
    ctx.fill();
    text('PLAY AGAIN', 640, 449, 22, '#ffffff', 'center', true);
    input.addRegion(520, 420, 240, 56, 'restart');
    text('Press Enter to play again', 640, 510, 14, COLOURS.muted, 'center');
  }

  function draw(w, input) {
    input.clearRegions();
    drawKitchen();
    drawOrderBoard(w, input);
    drawBins(w, input);
    drawGrill(w, input);
    drawPlateArea(w, input);
    drawServeWindow(w, input);
    drawHud(w, input);
    drawBottomBar(w);
    if (w.phase === 'title') drawTitle(w, input);
    if (w.phase === 'over') drawGameOver(w, input);
  }

  return { draw, drawIngredientIcon, drawBurgerStack };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { makeRenderer };
}
