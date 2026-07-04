# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Cafe Bike Race" — a party game for deciding who pays at a cafe stop. All code lives in one file, `index.html` (HTML, CSS, and JavaScript all inline); the only other assets are two soundtrack mp3s in `audio/`. No dependencies, no build step, no server. Live via GitHub Pages at https://lewisaskey.github.io/random-number-generator/ — every push to `master` redeploys it (allow a minute or two).

## Running

Open `index.html` directly in a browser. To drive it with the Chrome extension, serve it first (`python -m http.server`) — the extension can't load `file://` URLs. Note: in long-hidden automation tabs Chrome throttles timers heavily; spins/races that appear frozen there resolve instantly on a visible screen.

## How the game works

Five screens as a state machine (`setup → spin → table → race → result`), toggled by `showScreen()`:

1. **Setup** — players are added as chips with a present-today checkbox; persisted to `localStorage` key `caferace.group`.
2. **Spin** — each present player spins a 5×5 grid slot machine (pass the phone) on a dark casino stage with a disco-glow backdrop. Symbols are boulangerie-themed (☕🥐🍰🥖🧁) plus 💲, which lands with probability 1/3 per cell and is **good**: more dollar signs is better. Every 4 dollars halves your odds of paying via `payWeight(dollars) = 2^(-dollars/4)`. The vertical RISKY/SAFE meter beside the cabinet climbs toward SAFE as dollars pile up. The Spin button sits centred on the cabinet and hides while the reels run; after they stop it stays hidden so the grid is readable — tapping anywhere on the screen brings it back ("Next player" / "See the chances"). A **full horizontal row of 💲** (`hasDollarRow`, ~2% of spins) is the jackpot: instant immunity, excluded from the draw entirely. Audio: each spin plays `audio/free_spin.mp3` from 22s (paused when the reels stop); the immunity jackpot plays the loud body of `audio/topdollar_jackpot.mp3` (3.5–12.5s). Clip offsets were picked by RMS loudness analysis (`playClip` in the script); smaller cues (reel-stop gongs, fanfares, crash) are synthesized in WebAudio.
3. **Table ("damage report")** — rows toggle in one by one (fewest dollars first) showing each rider's 💲 count, then their exact paying percentage from `payChances()` (immune riders 0%; equal-odds fallback if all are immune). The race draw uses these same percentages.
4. **Race** — a 10-second top-down animation with a following camera. The payer is drawn once up front by `pickPayer()` at a time from `drawCrashTime()` (8.6–9.4 s — always just in sight of the finish line). SVG cartoon cyclists ride up a scrolling road; a protestor (🪧) runs in from the roadside ~1.2 s before the crash and takes the payer out. Animation runs on `requestAnimationFrame` **plus a `setInterval` fallback tick** — do not remove the fallback; browsers pause rAF in hidden tabs and the race would freeze if someone switches apps mid-race.
5. **Result** — the quote from `JOKES` (a one-entry array, picked at random if more are added) and a "thanks for offering to pay" banner. The payer is appended to `localStorage` key `caferace.history` (capped at 20).

The pure game logic (`payWeight`, `spinReelSymbol`, `pickPayer`, `drawCrashTime`, `hasDollarRow`, `payChances`) is deliberately kept DOM-free at the top of the script so it can be extracted and unit-tested in node (see Testing).

## Testing

No committed test suite. The pattern used: a node script extracts the script block from `index.html`, slices everything above the `/* ---------- Persistence` marker, and exercises the pure functions (weight curve, reel distribution, weighted-draw ratios, crash-time bounds, dollar-row immunity detection and its ~2% frequency, `payChances` percentages summing to 100). Keep the pure-logic section free of DOM/localStorage references so this keeps working. For deterministic browser testing of rare outcomes (like immunity), call `finishSpin(craftedGrid)` directly from the console instead of clicking Spin.
