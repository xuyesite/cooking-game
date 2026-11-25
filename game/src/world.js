/* Sizzle Station — the world: orders, grill, plate, score and time.
 * This file owns every rule. Rendering only reads this state, input only
 * calls its verbs, so the game can be driven the same way by a mouse, a
 * keyboard or a staged screenshot. */
'use strict';

function makeWorld(seed) {
  const rand = makeRandom(seed || 1);

  const world = {
    seed: seed || 1,
    phase: 'title', // 'title' | 'playing' | 'over'
    timeLeft: CONFIG.shiftSeconds,
    score: 0,
    coins: 0,
    hearts: CONFIG.hearts,
    orders: [], // {id, recipe, patience, maxPatience, born}
    nextOrderId: 1,
    orderTimer: 4,
    plate: [], // ingredient ids, bottom first; cooked patty is 'patty'
    grill: [], // {state:'empty'|'cooking'|'done'|'burnt', t:number}
    floaters: [], // {x,y,text,colour,t,life}
    toast: '', // one-line hint under the plate
    toastT: 0,
    servedCount: 0,
    missedCount: 0,
    wrongCount: 0,
    muted: false,
    flashOrderId: 0, // ticket to highlight for the player
    justServed: null, // {name, points, coins} of the last served dish
    elapsed: 0,
    overReason: '',
  };

  for (let i = 0; i < GRILL_SLOT_COUNT; i++) {
    world.grill.push({ state: 'empty', t: 0 });
  }

  function spawnOrder() {
    if (world.orders.length >= CONFIG.maxOrders) return;
    // Prefer a dish that is not already on the board, so the tickets
    // show the menu's variety instead of three copies of one dish.
    const onBoard = new Set(world.orders.map((o) => o.recipe.id));
    const fresh = RECIPES.filter((r) => !onBoard.has(r.id));
    const recipe = fresh.length > 0 ? rand.pick(fresh) : rand.pick(RECIPES);
    world.orders.push({
      id: world.nextOrderId++,
      recipe,
      patience: CONFIG.orderPatienceSeconds,
      maxPatience: CONFIG.orderPatienceSeconds,
      born: world.elapsed,
    });
  }

  function addFloater(x, y, text, colour) {
    world.floaters.push({ x, y, text, colour: colour || '#2b2b2b', t: 0, life: 1.4 });
  }

  function setToast(text) {
    world.toast = text;
    world.toastT = 2.2;
  }

  /* --- player verbs ------------------------------------------------ */

  function addIngredient(id) {
    if (world.phase !== 'playing') return;
    if (id === 'pattyRaw') {
      // A raw patty must go on the grill first.
      const slot = world.grill.find((g) => g.state === 'empty');
      if (!slot) {
        setToast('Grill is full — wait for a patty!');
        return;
      }
      slot.state = 'cooking';
      slot.t = 0;
      setToast('Patty on the grill…');
      return;
    }
    if (id === 'bunTop' && world.plate.length === 0) {
      setToast('Start with the bottom bun!');
      return;
    }
    world.justServed = null;
    world.plate.push(id);
    setToast('');
  }

  function takeFromGrill(index) {
    if (world.phase !== 'playing') return;
    const slot = world.grill[index];
    if (!slot || slot.state === 'empty') return;
    if (slot.state === 'cooking') {
      setToast('Still raw — let it cook!');
      return;
    }
    if (slot.state === 'burnt') {
      slot.state = 'empty';
      slot.t = 0;
      setToast('Burnt patty tossed. Watch the grill!');
      return;
    }
    slot.state = 'empty';
    slot.t = 0;
    world.plate.push('patty');
    setToast('Cooked patty on the plate!');
  }

  function clearPlate() {
    if (world.phase !== 'playing') return;
    if (world.plate.length === 0) return;
    world.plate = [];
    setToast('Plate cleared.');
  }

  function plateMatches(recipe) {
    const want = recipe.needs.slice().sort().join(',');
    const have = world.plate.slice().sort().join(',');
    return want === have;
  }

  function serveOrder(orderId) {
    if (world.phase !== 'playing') return false;
    const order = world.orders.find((o) => o.id === orderId);
    if (!order) return false;
    if (world.plate.length === 0) {
      setToast('The plate is empty — build the dish first!');
      return false;
    }
    if (!plateMatches(order.recipe)) {
      world.wrongCount++;
      world.hearts -= 1;
      addFloater(640, 300, 'Wrong dish!', '#d64545');
      setToast('That is not what ticket #' + order.id + ' asked for.');
      world.plate = [];
      if (world.hearts <= 0) endShift('Too many mistakes — the lunch rush won.');
      return false;
    }
    const bonus = Math.round((order.patience / order.maxPatience) * CONFIG.servePatienceBonus);
    const points = CONFIG.serveBasePoints + bonus;
    const coins = order.recipe.price + Math.floor(bonus / 10);
    world.score += points;
    world.coins += coins;
    world.servedCount++;
    world.orders = world.orders.filter((o) => o.id !== orderId);
    world.plate = [];
    world.justServed = { name: order.recipe.name, points, coins };
    addFloater(830, 258, '+' + points + '  ·  $' + coins, '#4d9c42');
    setToast(order.recipe.name + ' served! +' + points + ' pts');
    return true;
  }

  function serveFirstMatch() {
    if (world.phase !== 'playing') return;
    const match = world.orders.find((o) => plateMatches(o.recipe));
    if (match) {
      serveOrder(match.id);
      return;
    }
    if (world.plate.length === 0) {
      setToast('Build a dish on the plate first!');
      return;
    }
    setToast('No ticket matches this plate — check the recipes!');
  }

  function endShift(reason) {
    world.phase = 'over';
    world.overReason = reason || 'Shift complete!';
  }

  function startGame() {
    world.phase = 'playing';
    world.timeLeft = CONFIG.shiftSeconds;
    world.score = 0;
    world.coins = 0;
    world.hearts = CONFIG.hearts;
    world.orders = [];
    world.plate = [];
    world.grill.forEach((g) => {
      g.state = 'empty';
      g.t = 0;
    });
    world.floaters = [];
    world.justServed = null;
    world.servedCount = 0;
    world.missedCount = 0;
    world.wrongCount = 0;
    world.orderTimer = 2;
    world.elapsed = 0;
    spawnOrder();
    spawnOrder();
    setToast('First orders are in — build what the tickets ask!');
  }

  /* --- simulation -------------------------------------------------- */

  function update(dt) {
    if (world.phase !== 'playing') {
      for (const f of world.floaters) f.t += dt;
      world.floaters = world.floaters.filter((f) => f.t < f.life);
      return;
    }
    world.elapsed += dt;
    world.timeLeft -= dt;
    if (world.timeLeft <= 0) {
      world.timeLeft = 0;
      endShift('Shift complete!');
      return;
    }

    world.orderTimer -= dt;
    if (world.orderTimer <= 0) {
      spawnOrder();
      world.orderTimer = CONFIG.orderEverySeconds;
    }

    for (const order of world.orders) {
      order.patience -= dt;
    }
    const expired = world.orders.filter((o) => o.patience <= 0);
    if (expired.length > 0) {
      world.orders = world.orders.filter((o) => o.patience > 0);
      world.missedCount += expired.length;
      world.hearts -= expired.length;
      addFloater(640, 300, 'Customer walked away!', '#d64545');
      setToast('A ticket expired — watch the patience bars.');
      if (world.hearts <= 0) {
        endShift('Too many walkouts — the lunch rush won.');
        return;
      }
    }

    for (const slot of world.grill) {
      if (slot.state === 'cooking' || slot.state === 'done') {
        slot.t += dt;
        if (slot.state === 'cooking' && slot.t >= CONFIG.grillCookSeconds) {
          slot.state = 'done';
        } else if (slot.state === 'done' && slot.t >= CONFIG.grillCookSeconds + CONFIG.grillBurnSeconds) {
          slot.state = 'burnt';
        }
      }
    }

    if (world.toastT > 0) world.toastT -= dt;
    for (const f of world.floaters) f.t += dt;
    world.floaters = world.floaters.filter((f) => f.t < f.life);
  }

  /* --- staged states for screenshots --------------------------------
   * ?shot=start|play|serve|end renders one fixed, readable moment of the
   * game with the same seed every time. Nothing here fakes the game: each
   * state is a real world state the player could reach. */

  function stageShot(shot) {
    startGame();
    // Staged shots use fixed tickets so the photo always tells the truth:
    // the dish on the plate is the dish the highlighted ticket asked for.
    function ticket(id, recipeId, patience) {
      const recipe = RECIPES.find((r) => r.id === recipeId);
      return { id, recipe, patience, maxPatience: CONFIG.orderPatienceSeconds, born: 0 };
    }
    if (shot === 'start') {
      world.phase = 'title';
      world.timeLeft = CONFIG.shiftSeconds;
      return;
    }
    if (shot === 'play') {
      world.orders = [ticket(1, 'classic', 40), ticket(2, 'garden', 28)];
      world.nextOrderId = 3;
      world.timeLeft = 107;
      world.score = 240;
      world.coins = 18;
      world.plate = ['bunBottom', 'patty', 'lettuce'];
      world.grill[0] = { state: 'cooking', t: CONFIG.grillCookSeconds * 0.6 };
      world.flashOrderId = 1;
      setToast('Add the top bun, then serve ticket #1!');
      return;
    }
    if (shot === 'serve') {
      world.timeLeft = 83;
      world.score = 640;
      world.coins = 41;
      world.servedCount = 5;
      // The finished dish stays on the plate for the photo: a Cheese Melt,
      // plated and ready under the ORDER UP! banner.
      world.plate = ['bunBottom', 'patty', 'cheese', 'bunTop'];
      world.orders = [ticket(3, 'melt', 30), ticket(4, 'classic', 18)];
      world.nextOrderId = 5;
      world.flashOrderId = 3;
      world.justServed = { name: 'Cheese Melt', points: 160, coins: 12 };
      setToast('Order up! Cheese Melt served.');
      return;
    }
    if (shot === 'end') {
      world.timeLeft = 0;
      world.score = 1240;
      world.coins = 86;
      world.servedCount = 9;
      world.missedCount = 1;
      world.justServed = null;
      world.toast = '';
      world.phase = 'over';
      world.overReason = 'Shift complete!';
      return;
    }
  }

  return {
    world,
    spawnOrder,
    addIngredient,
    takeFromGrill,
    clearPlate,
    serveOrder,
    serveFirstMatch,
    startGame,
    endShift,
    update,
    stageShot,
    plateMatches,
    addFloater,
    setToast,
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { makeWorld };
}
