# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"УРОБОРОС" (Ouroboros) is a Telegram Mini App snake game with a mythical golden snake theme. Built with vanilla JavaScript, HTML5 Canvas, and CSS - no build tools or dependencies.

**Version:** 2.8

## Development

**Local testing:** Open `index.html` directly in browser, or use any local server.

**Deployment:** Push to `main` branch - GitHub Pages auto-deploys from https://jester4411.github.io/snake-telegram-game/

**Telegram Bot:** @snake_jester_bot

## Architecture

### File Structure

```
snake-telegram-game/
├── index.html        # DOM structure with screens and overlays
├── style.css         # Styling with CSS variables for theming
└── js/
    ├── constants.js  # Константы, уровни (25 штук), режимы сложности
    ├── controls.js   # Обработка ввода (клавиатура, свайпы, кнопки)
    ├── game.js       # Основная логика, состояние, игровой цикл
    └── render.js     # Все функции отрисовки (Canvas 2D)
```

### js/constants.js (~350 lines)
- `GRID_SIZE = 20` - размер сетки 20x20
- `INITIAL_SNAKE_LENGTH = 4` - начальная длина змейки
- `INITIAL_SPEED = 150` - начальная скорость (мс)
- `FOOD_LIFETIME = 8000` - время жизни еды (мс)
- `DIFFICULTY` - объект с режимами: IMMORTAL, NORMAL, HARDCORE
- `LEVELS[25]` - массив уровней с препятствиями и скоростями

### js/controls.js (~150 lines)
- `setupEventListeners()` - подключение обработчиков событий
- `handleKeyDown(e)` - обработка клавиатуры (WASD, стрелки, Escape)
- `handleInput(x, y)` - обработка направления, запуск движения при первом вводе
- `setDirection(x, y)` - установка следующего направления
- `setupSwipeControls()` - жесты свайпа для мобильных
- `haptic(type)` - тактильная обратная связь Telegram

### js/game.js (~450 lines)
- `gameState` - объект состояния игры:
  - `snake[]` - массив сегментов
  - `food` - позиция еды
  - `direction`, `nextDirection` - направление движения
  - `score`, `level`, `mode` - счёт, уровень, режим
  - `isPlaying`, `isPaused`, `waitingForInput` - флаги состояния
  - `isEating`, `eatingTimer`, `foodBulgePosition` - анимация еды
- `initGame(mode, level)` - инициализация игры
- `gameStep()` - один шаг игры (движение, коллизии)
- `spawnFood()` - генерация еды в свободной клетке
- `pauseGame()`, `resumeGame()`, `quitGame()` - управление состоянием

### js/render.js (~1000 lines)
- `draw()` - главная функция отрисовки (вызывается из requestAnimationFrame)
- `drawBackground()` - фон с мерцающими звёздами и сеткой
- `drawObstacles()` - препятствия уровня (кристаллические блоки)
- `drawFood()` - еда с таймером исчезновения (5 стадий)
- `getSnakeColors()` - цветовая схема змейки по сложности:
  - IMMORTAL: бирюзовый/нефритовый дракон
  - NORMAL: изумрудно-зелёный с оранжевой гривой
  - HARDCORE: огненно-красный дракон
- `drawSnake()` - тело змейки с чешуёй и анимацией выпуклости еды
- `drawSnakeHead()` - голова китайского дракона:
  - Рога (оленьи, с ответвлениями)
  - Грива (8 шипов, направленных назад)
  - Усы (длинные, с анимацией волны)
  - Глаза (круглые, следят за едой)
  - Анимация поедания (открытый рот, язык)

## Key Concepts

### Difficulty Modes
- **IMMORTAL** (Бессмертие): сквозь стены и хвост, бирюзовый дракон, макс счёт = клетки
- **NORMAL** (Обычный): сквозь стены, смерть от хвоста, изумрудный дракон с оранжевой гривой
- **HARDCORE** (Хардкор): смерть от стен и хвоста, огненно-красный дракон

### Game Modes
- **Survival**: Endless mode with increasing speed
- **Levels**: 25 progressive levels with obstacles, configurable goal (5/10/15/20 points)

### waitingForInput
Game starts paused, waiting for first swipe/arrow. Snake only starts moving after user input. This is handled in `handleInput()`.

### Game Loop
- `setInterval` for game ticks (movement) - speed depends on level/difficulty
- `requestAnimationFrame` for smooth 60fps rendering

### Snake Rendering (Chinese Dragon Style)
- **Head coordinate system**: After `ctx.rotate(angle)`, +X = forward (direction of movement), -X = backward
- Head shape: широкий лоб, вытянутая морда (bezier curves)
- Mane spikes: 8 orange spikes on top, pointing backward (`tipX = spikeX - spikeLen * 0.6`)
- Antler horns: branching horns starting behind eyes (`baseY = side * headW * 0.32`)
- Whiskers: long curves flowing backward with wave animation
- Body segments with scale texture and 3D gradients
- Circular joints at turns to prevent gaps
- Food bulge animation: uses `distanceFromTail` to track position as snake grows
- Color scheme changes per difficulty (getSnakeColors returns bodyBase, maneColor, hornColor, etc.)

### Food System
5-stage fading timer (8 seconds total), respawns if not eaten. Colors depend on difficulty mode.

### Level Design
All 25 levels must have passages so any cell is reachable from any other cell. This is critical for HARDCORE mode where walls kill.

Problematic patterns to avoid:
- Closed boxes without gaps
- Full-width horizontal walls without passages
- Spirals that isolate the center

### Telegram Integration
- `tg.disableVerticalSwipes()` to prevent app minimizing on swipe
- `tg.HapticFeedback` for tactile feedback
- CSS `touch-action: none` and `overscroll-behavior: none` to block browser scrolling

## Recent Changes (v2.8)
- Chinese dragon visual style: antler horns, orange mane spikes, flowing whiskers
- Distinct snake colors per difficulty:
  - IMMORTAL: cyan/turquoise jade dragon with white eyes
  - NORMAL: emerald green dragon with orange mane
  - HARDCORE: fiery red/crimson dragon with flame eyes
- Matching glow colors around head per difficulty
- Fixed eating animation: head lifts up from front and swallows from above
- Initial snake length: 4 segments (was 5)
- Fixed levels 11, 12, 15, 17, 20, 22, 25 to ensure all cells are reachable
