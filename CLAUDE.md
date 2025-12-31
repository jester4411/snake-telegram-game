# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"УРОБОРОС" (Ouroboros) is a Telegram Mini App snake game with a mythical golden snake theme. The game is built with vanilla JavaScript, HTML5 Canvas, and CSS - no build tools or dependencies.

## Development

**Local testing:** Open `index.html` directly in browser, or use any local server.

**Deployment:** Push to `main` branch - GitHub Pages auto-deploys from https://jester4411.github.io/snake-telegram-game/

**Telegram Bot:** @snake_jester_bot

## Architecture

### Files
- `js/constants.js` - Константы, уровни (25 штук), режимы сложности
- `js/render.js` - Все функции отрисовки (Canvas 2D), включая 3 вида еды
- `js/controls.js` - Обработка ввода (клавиатура, свайпы, кнопки)
- `js/game.js` - Основная логика, состояние, игровой цикл
- `style.css` - Styling with CSS variables for theming
- `index.html` - DOM structure with screens and overlays

### Key Concepts

**Difficulty Modes:**
- IMMORTAL (Бессмертие): сквозь стены и хвост, зеленые цветы, макс счёт = клетки
- NORMAL (Обычный): сквозь стены, смерть от хвоста, золотой шар
- HARDCORE (Хардкор): смерть от стен и хвоста, красные рубины

**Game Modes:**
- Survival: Endless mode with increasing speed
- Levels: 25 progressive levels with obstacles, configurable goal (5/10/15/20 points)

**gameState object** holds all runtime state: snake array, food position, direction, scores, animation timers, `waitingForInput` flag.

**waitingForInput**: Game starts paused, waiting for first swipe/arrow. Snake only starts moving after user input.

**Game Loop:** `setInterval` for game ticks (movement), `requestAnimationFrame` for smooth 60fps rendering.

**Telegram Integration:**
- Uses `tg.disableVerticalSwipes()` to prevent app minimizing on swipe
- `tg.HapticFeedback` for tactile feedback
- CSS `touch-action: none` and `overscroll-behavior: none` to block browser scrolling

**Snake Rendering:**
- Triangular head with animated jaw (opens when eating)
- Body segments with scale texture and 3D gradients
- Circular joints at turns to prevent gaps
- Food bulge animation: uses `distanceFromTail` (not segmentIndex) to track position correctly as snake grows

**Food System:** 5-stage fading timer (8 seconds total), respawns if not eaten.

**Walls:** Wrap-around teleportation (no death on wall collision).
