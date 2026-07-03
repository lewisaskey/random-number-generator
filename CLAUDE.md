# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Cafe Bike Race" — a party game for deciding who pays at a cafe stop, in a single self-contained file, `index.html` (HTML, CSS, and JavaScript all inline). No dependencies, no build step, no server. Live via GitHub Pages at https://lewisaskey.github.io/random-number-generator/ — every push to `master` redeploys it (allow a minute or two).

## Running

Open `index.html` directly in a browser. To drive it with the Chrome extension, serve it first (`python -m http.server`) — the extension can't load `file://` URLs. Note: in long-hidden automation tabs Chrome throttles timers heavily; spins/races that appear frozen there resolve instantly on a visible screen.

## How the game works

Four screens as a state machine (`setup → spin → race → result`), toggled by `showScreen()`:

1. **Setup** — players are added as chips with a present-today checkbox; persisted to `localStorage` key `caferace.group`.
2. **Spin** — each present player spins a 4×4 grid slot machine (pass the phone) on a dark casino stage with a disco-glow backdrop. Symbols are boulangerie-themed (☕🥐🍰🥖🧁) plus the lucky 🚴, which lands with probability 1/3 per cell. The spin result is a **race weight** via `crashWeight(bikes) = 8 * 2^(-bikes/4)` — lower is safer — shown in text and on a vertical RISKY/SAFE meter beside the cabinet. A **full horizontal row of bikes** (`hasBikeRow`, ~5% of spins) grants immunity: that player is excluded from the draw entirely.
3. **Race** — a 10-second top-down animation with a following camera. The payer is drawn once up front by `pickPayer()` (weighted random over non-immune players; equal-odds fallback if all are immune) at a time from `drawCrashTime()` (2–9 s). SVG cartoon cyclists ride up a scrolling road; a protestor (🪧) runs in from the roadside ~1.2 s before the crash and takes the payer out. Animation runs on `requestAnimationFrame` **plus a `setInterval` fallback tick** — do not remove the fallback; browsers pause rAF in hidden tabs and the race would freeze if someone switches apps mid-race.
4. **Result** — the crasher pays; appended to `localStorage` key `caferace.history` (capped at 20).

The pure game logic (`crashWeight`, `spinReelSymbol`, `pickPayer`, `drawCrashTime`, `hasBikeRow`) is deliberately kept DOM-free at the top of the script so it can be extracted and unit-tested in node (see Testing).

## Testing

No committed test suite. The pattern used: a node script extracts the script block from `index.html`, slices everything above the `/* ---------- Persistence` marker, and exercises the pure functions (weight curve, reel distribution, weighted-draw ratios, crash-time bounds, bike-row immunity detection and its ~5% frequency). Keep the pure-logic section free of DOM/localStorage references so this keeps working. For deterministic browser testing of rare outcomes (like immunity), call `finishSpin(craftedGrid)` directly from the console instead of clicking Spin.
