# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A single-file Python CLI random number generator (`rng_app.py`). Standard library only — no dependencies, no build step, no test suite.

## Running

```
python rng_app.py
```

The app is an interactive stdin loop: it repeatedly prompts for a min and max, prints a random integer in that range, and exits on Ctrl+C. Because it blocks on `input()`, it cannot be run interactively from a non-interactive shell — drive it with piped input instead, e.g.:

```
printf '1\n100\n' | python rng_app.py
```

Note: when piped stdin runs out, the app currently crashes with an uncaught `EOFError` (only `KeyboardInterrupt` is handled), so a traceback after the last output is expected, not a regression.

## Structure

- `generate_number(low, high)` — the core logic, a thin wrapper over `random.randint`; import this for programmatic use.
- `main()` — the interactive prompt loop with input validation (non-integer input and min > max are rejected and re-prompted).
