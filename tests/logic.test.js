// Unit tests for the pure game logic in cafe-racing.html.
// Run with: node tests/logic.test.js
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "..", "cafe-racing.html"), "utf8");
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
const pure = script.slice(0, script.indexOf("/* ---------- Persistence"));
const L = new Function(pure +
  "\nreturn { GRID_COLS, GRID_ROWS, payWeight, hasDollarRow, spinReelSymbol, payChances, drawCrashTime, pickImmuneIndex, rigDollarRow };")();

let failures = 0;
function check(name, cond) {
  if (cond) console.log("  ok  " + name);
  else { failures++; console.error("FAIL  " + name); }
}

// -- grid and weight basics --------------------------------------------
check("grid is 5x5", L.GRID_COLS === 5 && L.GRID_ROWS === 5);
check("payWeight halves every 4 dollars",
  L.payWeight(0) === 1 && L.payWeight(4) === 0.5 && L.payWeight(8) === 0.25);

// -- pickImmuneIndex: one rider per game, fairly drawn -------------------
{
  const n = 4, draws = 40000, counts = Array(n).fill(0);
  let inRange = true;
  for (let i = 0; i < draws; i++) {
    const idx = L.pickImmuneIndex(n, Math.random);
    if (!Number.isInteger(idx) || idx < 0 || idx >= n) { inRange = false; break; }
    counts[idx]++;
  }
  check("pickImmuneIndex stays in [0, n)", inRange);
  const expected = draws / n;
  check("pickImmuneIndex is roughly uniform",
    counts.every((c) => Math.abs(c - expected) < expected * 0.1));
}

// -- rigDollarRow: the drawn rider's dollars really line up --------------
{
  const randomGrid = () => Array.from({ length: L.GRID_COLS }, () =>
    Array.from({ length: L.GRID_ROWS }, () => L.spinReelSymbol(Math.random)));
  let alwaysRow = true;
  for (let i = 0; i < 2000; i++) {
    if (!L.hasDollarRow(L.rigDollarRow(randomGrid(), Math.random))) {
      alwaysRow = false;
      break;
    }
  }
  check("rigged grid always shows a full dollar row", alwaysRow);

  const grid = Array.from({ length: 5 }, () => ["☕", "🥐", "🍰", "🥖", "🧁"]);
  const before = grid.map((c) => [...c]);
  L.rigDollarRow(grid, () => 0.5); // floor(0.5 * 5) = row 2
  check("rig places the row at floor(rand * rows)",
    grid.every((col) => col[2] === "💲"));
  check("rig leaves every other cell unchanged",
    grid.every((col, ci) => col.every((s, ri) => ri === 2 || s === before[ci][ri])));

  const clean = Array.from({ length: 5 }, () => ["☕", "🥐", "🍰", "🥖", "🧁"]);
  check("unrigged grid without dollars has no row", !L.hasDollarRow(clean));
}

// -- everyone else's odds stay the usual weighted draw -------------------
{
  const chances = L.payChances([
    { name: "lucky", dollars: 7, immune: true },
    { name: "a", dollars: 4, immune: false },
    { name: "b", dollars: 8, immune: false },
  ]);
  const get = (n) => chances.find((c) => c.name === n).pct;
  check("immune rider pays 0%", get("lucky") === 0);
  check("others renormalize by weight (2:1)",
    Math.abs(get("a") - 200 / 3) < 1e-9 && Math.abs(get("b") - 100 / 3) < 1e-9);
  check("percentages sum to 100",
    Math.abs(chances.reduce((s, c) => s + c.pct, 0) - 100) < 1e-9);

  const all = L.payChances([
    { name: "a", dollars: 5, immune: true },
    { name: "b", dollars: 9, immune: true },
  ]);
  check("all-immune falls back to equal odds",
    all.every((c) => Math.abs(c.pct - 50) < 1e-9));
}

// -- spin length: 3 seconds more suspense --------------------------------
{
  const durations = script.match(/REEL_DURATIONS = \[([^\]]+)\]/)[1]
    .split(",").map(Number);
  check("five reels, one duration each", durations.length === 5);
  check("last reel stops at 5.8s (was 2.8s, +3s suspense)",
    durations[durations.length - 1] === 5.8);
  check("reels stop strictly left to right",
    durations.every((d, i) => i === 0 || d > durations[i - 1]));
}

// -- crash window ---------------------------------------------------------
{
  let lo = 99, hi = 0;
  for (let i = 0; i < 20000; i++) {
    const t = L.drawCrashTime(Math.random);
    lo = Math.min(lo, t);
    hi = Math.max(hi, t);
  }
  check("crash stays just in sight of the finish (8.6-9.4s)", lo >= 8.6 && hi <= 9.4);
}

console.log(failures === 0 ? "\nAll tests passed." : `\n${failures} test(s) FAILED.`);
process.exit(failures ? 1 : 0);
