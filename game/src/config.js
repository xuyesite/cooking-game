/* Sizzle Station — game configuration.
 * Every tunable number, ingredient, recipe and colour lives here so the
 * rest of the game never hard-codes a value. */
'use strict';

const CONFIG = {
  width: 1280,
  height: 720,

  // A work shift lasts 150 seconds.
  shiftSeconds: 150,

  // At most this many order tickets on the board at once.
  maxOrders: 3,

  // Seconds between new orders while a slot is free.
  orderEverySeconds: 11,

  // How long a ticket waits before the customer walks away.
  orderPatienceSeconds: 48,

  // Grill: a raw patty is cooked after this many seconds, and burns if it
  // stays on this many seconds longer.
  grillCookSeconds: 6,
  grillBurnSeconds: 6,

  // Hearts: an expired order or a wrong serve costs one.
  hearts: 3,

  // Points: base per served dish, plus up to this patience bonus.
  serveBasePoints: 100,
  servePatienceBonus: 60,

  // Coins paid per dish, plus one coin per 10 points of patience bonus.
  serveBaseCoins: 8,
};

const INGREDIENTS = [
  { id: 'bunBottom', name: 'Bottom Bun', short: 'Bun', key: '1', colour: '#e8a94f', dark: '#b97d2c' },
  { id: 'pattyRaw', name: 'Raw Patty', short: 'Patty', key: '2', colour: '#c96f4a', dark: '#96502f' },
  { id: 'cheese', name: 'Cheese', short: 'Cheese', key: '3', colour: '#f7c948', dark: '#d9a41f' },
  { id: 'lettuce', name: 'Lettuce', short: 'Lettuce', key: '4', colour: '#7bc96f', dark: '#4d9c42' },
  { id: 'tomato', name: 'Tomato', short: 'Tomato', key: '5', colour: '#e05252', dark: '#b03030' },
  { id: 'bunTop', name: 'Top Bun', short: 'Top Bun', key: '6', colour: '#e8a94f', dark: '#b97d2c' },
];

const RECIPES = [
  {
    id: 'classic',
    name: 'Classic Stack',
    price: 8,
    needs: ['bunBottom', 'patty', 'lettuce', 'bunTop'],
    blurb: 'The house favourite',
  },
  {
    id: 'melt',
    name: 'Cheese Melt',
    price: 10,
    needs: ['bunBottom', 'patty', 'cheese', 'bunTop'],
    blurb: 'Extra gooey',
  },
  {
    id: 'garden',
    name: 'Garden Fresh',
    price: 9,
    needs: ['bunBottom', 'lettuce', 'tomato', 'bunTop'],
    blurb: 'No grill needed',
  },
  {
    id: 'double',
    name: 'Double Trouble',
    price: 14,
    needs: ['bunBottom', 'patty', 'cheese', 'patty', 'bunTop'],
    blurb: 'Two patties, big hunger',
  },
];

/* The plate holds cooked patties under the id 'patty'; a raw patty from the
 * bin is 'pattyRaw' until the grill finishes it. */
const GRILL_SLOT_COUNT = 2;

const COLOURS = {
  wall: '#f3e2c7',
  wallTile: '#ecd9b8',
  floor: '#c9a06a',
  counter: '#8a5a33',
  counterTop: '#a9743f',
  board: '#2f3e46',
  boardPaper: '#fdf6e3',
  steel: '#b9c4cc',
  steelDark: '#8a979f',
  grill: '#3a3f44',
  grillHot: '#e4572e',
  plate: '#f4f1ea',
  ink: '#2b2b2b',
  muted: '#6b6b6b',
  green: '#4d9c42',
  red: '#d64545',
  gold: '#f7c948',
  cream: '#fff8e7',
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, INGREDIENTS, RECIPES, GRILL_SLOT_COUNT, COLOURS };
}
