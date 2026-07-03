# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A random number generator web app in a single self-contained file, `index.html` — HTML, CSS, and JavaScript all inline. No dependencies, no build step, no server.

## Running

Open `index.html` directly in a browser (double-click, or `Start-Process index.html` from PowerShell). Everything runs client-side.

## Structure

The page is one card: a welcome heading, min/max number inputs, a Generate button, an error line, and an animated result display. The `generate()` function in the inline script validates the inputs (integers required, min ≤ max) and computes the number with `Math.random`. Enter anywhere on the page also triggers generation.
