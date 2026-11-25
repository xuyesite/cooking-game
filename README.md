# Sizzle Station

[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/xuyesite/cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/xuyesite/cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

A fast grill cooking game, built for [make.fun](https://make.fun/bounty/best-cooking-game-20261125-0137).
Run your own lunch rush: orders land on the board, you build each dish on
the plate, grill the patty, beat the patience bar and serve it hot.

## How to play

- Orders arrive on the **order board** (left). Each ticket shows the dish,
  its ingredients and a patience bar.
- Click an ingredient bin (or press **1–6**) to add it to your plate.
  A raw patty goes on the **grill** first (key **2**) — take it off when it
  reads READY, or it burns.
- When your plate matches a ticket, click that ticket or press **Space**
  to serve it. Serve fast: a full patience bar pays a bonus.
- **R** clears the plate. **M** toggles sound. A wrong dish or a walkout
  costs a heart; lose all three and the shift ends.
- One shift lasts 150 seconds. How many dishes can you serve?

## Play it

```bash
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. The game is static
files under `game/` — no build step, no network requests, everything it
loads lives in `game/`.

## Shots

`shots.json` lists the four staged moments in `screenshots/`:
`?shot=start` (the kitchen, orders in), `?shot=play` (a dish
mid-assembly, patty on the grill), `?shot=serve` (a finished dish, order
up) and `?shot=end` (the shift report). All are real renders of this
game's own code, same seed every time.

## Layout

- `main.ts` — the entrypoint: copies `game/` and `screenshots/` to the
  output directory and writes `dossier.json` (Node 22, standard library).
- `game/index.html` — the page, a 1280×720 canvas.
- `game/src/config.js` — every number, ingredient, recipe and colour.
- `game/src/random.js` — the seeded random generator.
- `game/src/world.js` — orders, grill, plate, scoring and time.
- `game/src/input.js` — mouse and keyboard.
- `game/src/render.js` — everything drawn on the canvas.
- `game/src/main.js` — boot, loop and sounds.

All art is drawn in code and all sounds are synthesised in code — the game
ships no image, audio or font files.

## License

MIT — see [LICENSE](LICENSE).
