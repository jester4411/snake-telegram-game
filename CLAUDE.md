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

### js/render.js (~900 lines)
- `renderGame()` - главная функция отрисовки (requestAnimationFrame)
- `drawGrid()` - сетка с координатами клеток
- `drawObstacles()` - препятствия уровня (камни)
- `drawSnake()` - тело змейки с текстурой чешуи
- `drawSnakeHead()` (line ~708) - голова с анимацией поедания:
  - `eatProgress` - прогресс анимации (0-1)
  - `headLift` - приподнятие передней части
  - `headScale` - увеличение при глотании
- `drawFood()` - еда с таймером исчезновения (5 стадий)
- `drawJoints()` - круглые соединения на поворотах
- `getFoodColors()` - цвета еды по сложности:
  - IMMORTAL: зеленые цветы
  - NORMAL: золотой шар
  - HARDCORE: красные рубины

## Key Concepts

### Difficulty Modes
- **IMMORTAL** (Бессмертие): сквозь стены и хвост, зеленые цветы, макс счёт = клетки
- **NORMAL** (Обычный): сквозь стены, смерть от хвоста, золотой шар
- **HARDCORE** (Хардкор): смерть от стен и хвоста, красные рубины

### Game Modes
- **Survival**: Endless mode with increasing speed
- **Levels**: 25 progressive levels with obstacles, configurable goal (5/10/15/20 points)

### waitingForInput
Game starts paused, waiting for first swipe/arrow. Snake only starts moving after user input. This is handled in `handleInput()`.

### Game Loop
- `setInterval` for game ticks (movement) - speed depends on level/difficulty
- `requestAnimationFrame` for smooth 60fps rendering

### Snake Rendering
- Triangular head with eating animation (head lifts and mouth opens underneath)
- Body segments with scale texture and 3D gradients
- Circular joints at turns to prevent gaps
- Food bulge animation: uses `distanceFromTail` to track position as snake grows

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
- Fixed eating animation: head lifts up from front and swallows from above
- Initial snake length: 4 segments (was 5)
- Fixed levels 11, 12, 15, 17, 20, 22, 25 to ensure all cells are reachable
- Added passages to closed boxes and walls
