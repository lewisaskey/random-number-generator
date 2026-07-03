# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Cafe Bike Race" — a party game for deciding who pays at a cafe stop, in a single self-contained file, `index.html` (HTML, CSS, and JavaScript all inline). No dependencies, no build step, no server. Live via GitHub Pages at https://lewisaskey.github.io/random-number-generator/ — every push to `master` redeploys it (allow a minute or two).

## Running

Open `index.html` directly in a browser. To drive it with the Chrome extension, serve it first (`python -m http.server`) — the extension can't load `file://` URLs.

## How the game works

Four screens as a state machine (`setup → spin → race → result`), toggled by `showScreen()`:

1. **Setup** — players are added as chips with a present-today checkbox; persisted to `localStorage` key `caferace.group`.
2. **Spin** — each present player spins a 3-reel slot machine (pass the phone). Bikes 🚴 land with probability 1/3 per reel; more bikes = lower crash odds via `crashWeight()` (0–3 bikes → weight 8/4/2/1).
3. **Race** — a 10-second animation. Exactly one rider crashes: the payer is drawn once up front by `pickPayer()` (weighted random), at a time from `drawCrashTime()` (2–9 s). Animation runs on `requestAnimationFrame` **plus a `setInterval` fallback tick** — do not remove the fallback; browsers pause rAF in hidden tabs and the race would freeze if someone switches apps mid-race.
4. **Result** — the crasher pays; appended to `localStorage` key `caferace.history` (capped at 20).

The pure game logic (`crashWeight`, `spinReelSymbol`, `pickPayer`, `drawCrashTime`) is deliberately kept DOM-free at the top of the script so it can be extracted and unit-tested in node (see Testing).

## Testing

No committed test suite. The pattern used: a node script extracts the script block from `index.html`, slices everything above the `/* ---------- Persistence` marker, and exercises the pure functions (weight mapping, reel distribution, weighted-draw ratios, crash-time bounds). Keep the pure-logic section free of DOM/localStorage references so this keeps working.
