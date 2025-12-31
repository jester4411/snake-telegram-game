// ==========================================
// 🐉 УРОБОРОС - Мифическая змейка
// ==========================================

// Telegram Web App
const tg = window.Telegram?.WebApp;

// ==========================================
// Константы
// ==========================================

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREASE = 3;
const MIN_SPEED = 60;
const TOTAL_LEVELS = 10;
const POINTS_PER_LEVEL = 10;

// ==========================================
// Конфигурация уровней
// ==========================================

const LEVELS = [
    { // Уровень 1 - Пустое поле
        obstacles: [],
        speed: 150
    },
    { // Уровень 2 - Центральный блок
        obstacles: [
            { x: 9, y: 9 }, { x: 10, y: 9 }, { x: 9, y: 10 }, { x: 10, y: 10 }
        ],
        speed: 145
    },
    { // Уровень 3 - Углы
        obstacles: [
            { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 3, y: 4 },
            { x: 15, y: 3 }, { x: 16, y: 3 }, { x: 16, y: 4 },
            { x: 3, y: 15 }, { x: 3, y: 16 }, { x: 4, y: 16 },
            { x: 16, y: 15 }, { x: 15, y: 16 }, { x: 16, y: 16 }
        ],
        speed: 140
    },
    { // Уровень 4 - Горизонтальные линии
        obstacles: [
            ...Array.from({ length: 8 }, (_, i) => ({ x: 6 + i, y: 5 })),
            ...Array.from({ length: 8 }, (_, i) => ({ x: 6 + i, y: 14 }))
        ],
        speed: 135
    },
    { // Уровень 5 - Вертикальные линии
        obstacles: [
            ...Array.from({ length: 8 }, (_, i) => ({ x: 5, y: 6 + i })),
            ...Array.from({ length: 8 }, (_, i) => ({ x: 14, y: 6 + i }))
        ],
        speed: 130
    },
    { // Уровень 6 - Крест
        obstacles: [
            ...Array.from({ length: 6 }, (_, i) => ({ x: 9, y: 2 + i })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 10, y: 2 + i })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 9, y: 12 + i })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 10, y: 12 + i }))
        ],
        speed: 125
    },
    { // Уровень 7 - Лабиринт
        obstacles: [
            ...Array.from({ length: 10 }, (_, i) => ({ x: 4, y: 2 + i })),
            ...Array.from({ length: 10 }, (_, i) => ({ x: 15, y: 8 + i })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 8 + i, y: 6 })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 6 + i, y: 13 }))
        ],
        speed: 120
    },
    { // Уровень 8 - Квадрат в центре
        obstacles: [
            ...Array.from({ length: 6 }, (_, i) => ({ x: 7 + i, y: 7 })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 7 + i, y: 12 })),
            ...Array.from({ length: 4 }, (_, i) => ({ x: 7, y: 8 + i })),
            ...Array.from({ length: 4 }, (_, i) => ({ x: 12, y: 8 + i }))
        ],
        speed: 110
    },
    { // Уровень 9 - Диагонали
        obstacles: [
            ...Array.from({ length: 8 }, (_, i) => ({ x: 2 + i, y: 2 + i })),
            ...Array.from({ length: 8 }, (_, i) => ({ x: 17 - i, y: 2 + i })),
            ...Array.from({ length: 8 }, (_, i) => ({ x: 2 + i, y: 17 - i })),
            ...Array.from({ length: 8 }, (_, i) => ({ x: 17 - i, y: 17 - i }))
        ],
        speed: 100
    },
    { // Уровень 10 - Финальный босс
        obstacles: [
            // Рамка с проходами
            ...Array.from({ length: 6 }, (_, i) => ({ x: 2 + i, y: 3 })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 12 + i, y: 3 })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 2 + i, y: 16 })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 12 + i, y: 16 })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 3, y: 4 + i })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 3, y: 11 + i })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 16, y: 4 + i })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 16, y: 11 + i })),
            // Центральный крест
            { x: 9, y: 9 }, { x: 10, y: 9 }, { x: 9, y: 10 }, { x: 10, y: 10 }
        ],
        speed: 90
    }
];

// ==========================================
// Состояние игры
// ==========================================

let gameState = {
    mode: null, // 'survival' или 'levels'
    currentLevel: 1,
    snake: [],
    food: { x: 0, y: 0 },
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    score: 0,
    levelScore: 0,
    totalScore: 0,
    obstacles: [],
    gameLoop: null,
    speed: INITIAL_SPEED,
    isPlaying: false,
    isPaused: false
};

// ==========================================
// Данные рекордов
// ==========================================

let records = {
    survival: [],
    levels: []
};

let unlockedLevels = 1;

// ==========================================
// DOM элементы
// ==========================================

const elements = {};

// ==========================================
// Инициализация
// ==========================================

function init() {
    // Кэшируем DOM элементы
    cacheElements();

    // Telegram Web App
    if (tg) {
        tg.ready();
        tg.expand();
    }

    // Загружаем сохранённые данные
    loadData();

    // Настраиваем canvas
    setupCanvas();

    // Привязываем события
    setupEventListeners();

    // Генерируем сетку уровней
    generateLevelButtons();

    // Показываем главное меню
    showScreen('main-menu');
}

function cacheElements() {
    // Экраны
    elements.mainMenu = document.getElementById('main-menu');
    elements.levelSelect = document.getElementById('level-select');
    elements.leaderboard = document.getElementById('leaderboard-screen');
    elements.gameScreen = document.getElementById('game-screen');

    // Canvas
    elements.canvas = document.getElementById('game-canvas');
    elements.ctx = elements.canvas.getContext('2d');

    // Игровые элементы
    elements.score = document.getElementById('score');
    elements.levelInfo = document.getElementById('level-info');
    elements.currentLevel = document.getElementById('current-level');
    elements.levelScore = document.getElementById('level-score');
    elements.levelGoal = document.getElementById('level-goal');

    // Оверлеи
    elements.pauseOverlay = document.getElementById('pause-overlay');
    elements.levelComplete = document.getElementById('level-complete');
    elements.gameOver = document.getElementById('game-over');
    elements.gameComplete = document.getElementById('game-complete');
    elements.newRecord = document.getElementById('new-record');

    // Счёт
    elements.finalScore = document.getElementById('final-score');
    elements.levelCompleteScore = document.getElementById('level-complete-score');
    elements.totalScore = document.getElementById('total-score');

    // Списки
    elements.levelsGrid = document.getElementById('levels-grid');
    elements.leaderboardList = document.getElementById('leaderboard-list');
}

function setupCanvas() {
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    const container = document.getElementById('game-container');
    if (!container) return;

    const size = Math.min(container.clientWidth, container.clientHeight) - 4;
    if (size > 0) {
        elements.canvas.width = size;
        elements.canvas.height = size;
    }

    if (gameState.isPlaying && !gameState.isPaused) {
        draw();
    }
}

function loadData() {
    try {
        const savedRecords = localStorage.getItem('ouroborosRecords');
        if (savedRecords) {
            records = JSON.parse(savedRecords);
        }

        const savedLevels = localStorage.getItem('ouroborosUnlockedLevels');
        if (savedLevels) {
            unlockedLevels = Math.min(Math.max(1, parseInt(savedLevels)), TOTAL_LEVELS);
        }
    } catch (e) {
        console.error('Ошибка загрузки данных:', e);
    }
}

function saveData() {
    try {
        localStorage.setItem('ouroborosRecords', JSON.stringify(records));
        localStorage.setItem('ouroborosUnlockedLevels', unlockedLevels.toString());
    } catch (e) {
        console.error('Ошибка сохранения данных:', e);
    }
}

// ==========================================
// Навигация
// ==========================================

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

function hideAllOverlays() {
    elements.pauseOverlay.classList.add('hidden');
    elements.levelComplete.classList.add('hidden');
    elements.gameOver.classList.add('hidden');
    elements.gameComplete.classList.add('hidden');
}

// ==========================================
// Управление уровнями
// ==========================================

function generateLevelButtons() {
    elements.levelsGrid.innerHTML = '';

    for (let i = 1; i <= TOTAL_LEVELS; i++) {
        const btn = document.createElement('button');
        btn.className = 'level-btn';
        btn.textContent = i;

        if (i < unlockedLevels) {
            btn.classList.add('completed');
        } else if (i === unlockedLevels) {
            btn.classList.add('current');
        } else {
            btn.disabled = true;
        }

        btn.addEventListener('click', () => startLevelMode(i));
        elements.levelsGrid.appendChild(btn);
    }
}

// ==========================================
// Таблица рекордов
// ==========================================

function showLeaderboard(tab = 'survival') {
    showScreen('leaderboard-screen');

    // Обновляем активную вкладку
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    renderLeaderboard(tab);
}

function renderLeaderboard(tab) {
    const list = records[tab] || [];

    if (list.length === 0) {
        elements.leaderboardList.innerHTML = `
            <div class="empty-leaderboard">
                <p>🏆 Пока нет рекордов</p>
                <p>Сыграй, чтобы попасть в таблицу!</p>
            </div>
        `;
        return;
    }

    elements.leaderboardList.innerHTML = list.map((record, index) => {
        const rankClass = index < 3 ? ['gold', 'silver', 'bronze'][index] : '';
        const date = new Date(record.date).toLocaleDateString('ru-RU');

        return `
            <div class="leaderboard-item ${rankClass}">
                <span class="rank rank-${index + 1}">${index + 1}</span>
                <div class="record-info">
                    <div class="record-date">${date}</div>
                    ${tab === 'levels' ? `<div>Уровень ${record.level}</div>` : ''}
                </div>
                <span class="record-score">${record.score}</span>
            </div>
        `;
    }).join('');
}

function addRecord(mode, score, level = null) {
    const record = {
        score,
        date: Date.now(),
        level
    };

    records[mode].push(record);
    records[mode].sort((a, b) => b.score - a.score);
    records[mode] = records[mode].slice(0, 10); // Храним только топ-10

    saveData();

    // Проверяем, это новый рекорд?
    return records[mode][0].date === record.date;
}

// ==========================================
// Запуск игры
// ==========================================

function startSurvivalMode() {
    gameState.mode = 'survival';
    gameState.currentLevel = 0; // Сброс уровня для режима выживания
    gameState.obstacles = [];
    gameState.speed = INITIAL_SPEED;

    elements.levelInfo.classList.add('hidden');

    startGame();
}

function startLevelMode(level) {
    gameState.mode = 'levels';
    gameState.currentLevel = level;
    gameState.levelScore = 0;
    gameState.totalScore = 0;

    loadLevel(level);

    elements.levelInfo.classList.remove('hidden');
    elements.currentLevel.textContent = level;
    elements.levelGoal.textContent = POINTS_PER_LEVEL;

    startGame();
}

function loadLevel(level) {
    const levelConfig = LEVELS[level - 1];
    gameState.obstacles = [...levelConfig.obstacles];
    gameState.speed = levelConfig.speed;
}

function startGame() {
    showScreen('game-screen');
    hideAllOverlays();

    // Пересчитываем размер canvas после показа экрана
    setTimeout(resizeCanvas, 10);

    // Сброс состояния
    const startX = Math.floor(GRID_SIZE / 2);
    const startY = Math.floor(GRID_SIZE / 2);

    // Ищем безопасную стартовую позицию
    let safeStart = findSafeStart(startX, startY);

    gameState.snake = [safeStart];
    gameState.direction = { x: 1, y: 0 };
    gameState.nextDirection = { x: 1, y: 0 };
    gameState.score = 0;
    gameState.levelScore = 0;
    gameState.isPlaying = true;
    gameState.isPaused = false;

    elements.score.textContent = '0';
    elements.levelScore.textContent = '0';

    spawnFood();

    // Запуск игрового цикла
    if (gameState.gameLoop) clearInterval(gameState.gameLoop);
    gameState.gameLoop = setInterval(gameStep, gameState.speed);

    haptic('light');
}

function findSafeStart(x, y) {
    // Проверяем, не на препятствии ли стартовая позиция
    if (!isObstacle(x, y)) {
        return { x, y };
    }

    // Ищем ближайшую свободную клетку
    for (let radius = 1; radius < GRID_SIZE; radius++) {
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                const newX = (x + dx + GRID_SIZE) % GRID_SIZE;
                const newY = (y + dy + GRID_SIZE) % GRID_SIZE;
                if (!isObstacle(newX, newY)) {
                    return { x: newX, y: newY };
                }
            }
        }
    }

    return { x, y };
}

// ==========================================
// Игровой цикл
// ==========================================

function gameStep() {
    if (!gameState.isPlaying || gameState.isPaused) return;

    // Применяем направление
    gameState.direction = { ...gameState.nextDirection };

    // Вычисляем новую позицию головы
    let head = { ...gameState.snake[0] };
    head.x += gameState.direction.x;
    head.y += gameState.direction.y;

    // Телепортация через стены
    head.x = (head.x + GRID_SIZE) % GRID_SIZE;
    head.y = (head.y + GRID_SIZE) % GRID_SIZE;

    // Проверка столкновения с собой
    if (gameState.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
        gameOver();
        return;
    }

    // Проверка столкновения с препятствием
    if (isObstacle(head.x, head.y)) {
        gameOver();
        return;
    }

    // Добавляем голову
    gameState.snake.unshift(head);

    // Проверка еды
    if (head.x === gameState.food.x && head.y === gameState.food.y) {
        eatFood();
    } else {
        gameState.snake.pop();
    }

    draw();
}

function eatFood() {
    gameState.score++;
    gameState.levelScore++;

    elements.score.textContent = gameState.score;
    elements.levelScore.textContent = gameState.levelScore;

    haptic('light');

    // Режим уровней - проверка победы
    if (gameState.mode === 'levels' && gameState.levelScore >= POINTS_PER_LEVEL) {
        levelComplete();
        return;
    }

    // Ускорение в режиме выживания
    if (gameState.mode === 'survival' && gameState.speed > MIN_SPEED) {
        gameState.speed -= SPEED_INCREASE;
        clearInterval(gameState.gameLoop);
        gameState.gameLoop = setInterval(gameStep, gameState.speed);
    }

    spawnFood();
}

function spawnFood() {
    let newFood;
    let attempts = 0;
    const maxAttempts = 1000;

    do {
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
        attempts++;
    } while (
        (gameState.snake.some(seg => seg.x === newFood.x && seg.y === newFood.y) ||
        isObstacle(newFood.x, newFood.y)) &&
        attempts < maxAttempts
    );

    gameState.food = newFood;
}

function isObstacle(x, y) {
    return gameState.obstacles.some(obs => obs.x === x && obs.y === y);
}

// ==========================================
// Конец игры
// ==========================================

function gameOver() {
    gameState.isPlaying = false;
    clearInterval(gameState.gameLoop);

    haptic('error');

    elements.finalScore.textContent = gameState.score;

    const isNewRecord = addRecord(
        gameState.mode,
        gameState.score,
        gameState.mode === 'levels' ? gameState.currentLevel : null
    );

    elements.newRecord.classList.toggle('hidden', !isNewRecord);
    elements.gameOver.classList.remove('hidden');
}

function levelComplete() {
    gameState.isPlaying = false;
    clearInterval(gameState.gameLoop);

    haptic('success');

    gameState.totalScore += gameState.score;
    elements.levelCompleteScore.textContent = gameState.score;

    // Разблокируем следующий уровень
    if (gameState.currentLevel >= unlockedLevels && gameState.currentLevel < TOTAL_LEVELS) {
        unlockedLevels = gameState.currentLevel + 1;
        saveData();
    }

    // Проверяем, все ли уровни пройдены
    if (gameState.currentLevel === TOTAL_LEVELS) {
        elements.totalScore.textContent = gameState.totalScore;
        addRecord('levels', gameState.totalScore, TOTAL_LEVELS);
        elements.gameComplete.classList.remove('hidden');
    } else {
        elements.levelComplete.classList.remove('hidden');
    }
}

function nextLevel() {
    gameState.currentLevel++;
    gameState.levelScore = 0;
    loadLevel(gameState.currentLevel);

    elements.currentLevel.textContent = gameState.currentLevel;

    startGame();
}

function retryGame() {
    if (gameState.mode === 'survival') {
        startSurvivalMode();
    } else {
        startLevelMode(gameState.currentLevel);
    }
}

function pauseGame() {
    if (!gameState.isPlaying) return;

    gameState.isPaused = true;
    clearInterval(gameState.gameLoop);
    elements.pauseOverlay.classList.remove('hidden');
}

function resumeGame() {
    gameState.isPaused = false;
    elements.pauseOverlay.classList.add('hidden');
    gameState.gameLoop = setInterval(gameStep, gameState.speed);
}

function quitGame() {
    gameState.isPlaying = false;
    gameState.isPaused = false;
    clearInterval(gameState.gameLoop);
    showScreen('main-menu');
}

// ==========================================
// Отрисовка
// ==========================================

function draw() {
    const ctx = elements.ctx;
    const canvas = elements.canvas;
    const cellSize = canvas.width / GRID_SIZE;

    // Фон
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Сетка
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
    }

    // Препятствия
    drawObstacles(ctx, cellSize);

    // Еда
    drawFood(ctx, cellSize);

    // Змейка
    drawSnake(ctx, cellSize);
}

function drawObstacles(ctx, cellSize) {
    gameState.obstacles.forEach(obs => {
        const x = obs.x * cellSize;
        const y = obs.y * cellSize;
        const padding = 1;
        const size = cellSize - padding * 2;

        // Каменный блок
        const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
        gradient.addColorStop(0, '#4a4a6a');
        gradient.addColorStop(1, '#2a2a4a');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x + padding, y + padding, size, size, 4);
        ctx.fill();

        // Обводка
        ctx.strokeStyle = '#6a6a8a';
        ctx.lineWidth = 1;
        ctx.stroke();
    });
}

function drawFood(ctx, cellSize) {
    const x = gameState.food.x * cellSize + cellSize / 2;
    const y = gameState.food.y * cellSize + cellSize / 2;
    const radius = cellSize / 2 - 4;

    // Свечение
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
    glow.addColorStop(0, 'rgba(230, 57, 70, 0.3)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(x - radius * 2, y - radius * 2, radius * 4, radius * 4);

    // Рубин (еда)
    ctx.fillStyle = '#e63946';
    ctx.beginPath();

    // Форма кристалла
    ctx.moveTo(x, y - radius);
    ctx.lineTo(x + radius * 0.7, y - radius * 0.3);
    ctx.lineTo(x + radius * 0.7, y + radius * 0.5);
    ctx.lineTo(x, y + radius);
    ctx.lineTo(x - radius * 0.7, y + radius * 0.5);
    ctx.lineTo(x - radius * 0.7, y - radius * 0.3);
    ctx.closePath();
    ctx.fill();

    // Блик
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.moveTo(x - radius * 0.3, y - radius * 0.6);
    ctx.lineTo(x + radius * 0.2, y - radius * 0.2);
    ctx.lineTo(x - radius * 0.1, y);
    ctx.lineTo(x - radius * 0.5, y - radius * 0.3);
    ctx.closePath();
    ctx.fill();
}

function drawSnake(ctx, cellSize) {
    gameState.snake.forEach((segment, index) => {
        const x = segment.x * cellSize;
        const y = segment.y * cellSize;
        const padding = 2;
        const size = cellSize - padding * 2;

        // Цвет чешуи - золотой градиент
        const progress = index / Math.max(gameState.snake.length - 1, 1);

        if (index === 0) {
            // Голова - более яркая
            const headGradient = ctx.createLinearGradient(x, y, x + size, y + size);
            headGradient.addColorStop(0, '#ffe55c');
            headGradient.addColorStop(0.5, '#ffd700');
            headGradient.addColorStop(1, '#b8860b');
            ctx.fillStyle = headGradient;
        } else {
            // Тело - затемняется к хвосту
            const r = Math.floor(255 - progress * 80);
            const g = Math.floor(215 - progress * 80);
            const b = Math.floor(0 + progress * 11);
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        }

        // Рисуем сегмент
        ctx.beginPath();
        ctx.roundRect(x + padding, y + padding, size, size, size / 4);
        ctx.fill();

        // Чешуйчатый узор
        if (index > 0 && index % 2 === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.beginPath();
            ctx.arc(x + cellSize / 2, y + cellSize / 2, size / 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Глаза на голове
        if (index === 0) {
            drawEyes(ctx, x, y, cellSize);
        }
    });
}

function drawEyes(ctx, x, y, cellSize) {
    const dir = gameState.direction;
    const eyeSize = cellSize / 5;

    let eye1x, eye1y, eye2x, eye2y;

    if (dir.x === 1) { // Вправо
        eye1x = x + cellSize * 0.7;
        eye1y = y + cellSize * 0.3;
        eye2x = x + cellSize * 0.7;
        eye2y = y + cellSize * 0.7;
    } else if (dir.x === -1) { // Влево
        eye1x = x + cellSize * 0.3;
        eye1y = y + cellSize * 0.3;
        eye2x = x + cellSize * 0.3;
        eye2y = y + cellSize * 0.7;
    } else if (dir.y === -1) { // Вверх
        eye1x = x + cellSize * 0.3;
        eye1y = y + cellSize * 0.3;
        eye2x = x + cellSize * 0.7;
        eye2y = y + cellSize * 0.3;
    } else { // Вниз
        eye1x = x + cellSize * 0.3;
        eye1y = y + cellSize * 0.7;
        eye2x = x + cellSize * 0.7;
        eye2y = y + cellSize * 0.7;
    }

    // Белки глаз
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(eye1x, eye1y, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eye2x, eye2y, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    // Зрачки (рубиновые)
    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.arc(eye1x + dir.x * 2, eye1y + dir.y * 2, eyeSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eye2x + dir.x * 2, eye2y + dir.y * 2, eyeSize / 2, 0, Math.PI * 2);
    ctx.fill();
}

// ==========================================
// Управление
// ==========================================

function setupEventListeners() {
    // Кнопки меню
    document.getElementById('btn-survival').addEventListener('click', startSurvivalMode);
    document.getElementById('btn-levels').addEventListener('click', () => {
        generateLevelButtons();
        showScreen('level-select');
    });
    document.getElementById('btn-leaderboard').addEventListener('click', () => showLeaderboard('survival'));

    // Кнопки назад
    document.getElementById('btn-back-levels').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('btn-back-leaderboard').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('btn-back-game').addEventListener('click', pauseGame);

    // Вкладки рекордов
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => showLeaderboard(btn.dataset.tab));
    });

    // Игровые кнопки
    document.getElementById('btn-resume').addEventListener('click', resumeGame);
    document.getElementById('btn-quit').addEventListener('click', quitGame);
    document.getElementById('btn-retry').addEventListener('click', retryGame);
    document.getElementById('btn-menu').addEventListener('click', quitGame);
    document.getElementById('btn-next-level').addEventListener('click', nextLevel);
    document.getElementById('btn-complete-menu').addEventListener('click', quitGame);

    // Управление
    document.getElementById('btn-up').addEventListener('click', () => setDirection(0, -1));
    document.getElementById('btn-down').addEventListener('click', () => setDirection(0, 1));
    document.getElementById('btn-left').addEventListener('click', () => setDirection(-1, 0));
    document.getElementById('btn-right').addEventListener('click', () => setDirection(1, 0));

    // Клавиатура
    document.addEventListener('keydown', handleKeyDown);

    // Свайпы
    setupSwipeControls();

    // Предотвращаем zoom
    document.addEventListener('dblclick', e => e.preventDefault());
}

function handleKeyDown(e) {
    if (!gameState.isPlaying) return;

    if (e.key === 'Escape') {
        if (gameState.isPaused) {
            resumeGame();
        } else {
            pauseGame();
        }
        return;
    }

    if (gameState.isPaused) return;

    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            setDirection(0, -1);
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            setDirection(0, 1);
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            setDirection(-1, 0);
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            setDirection(1, 0);
            break;
    }
}

function setDirection(x, y) {
    if (!gameState.isPlaying || gameState.isPaused) return;

    // Нельзя развернуться на 180°
    if (gameState.direction.x === -x && gameState.direction.y === -y) return;
    if (gameState.direction.x === x && gameState.direction.y === y) return;

    gameState.nextDirection = { x, y };
    haptic('selection');
}

function setupSwipeControls() {
    let touchStartX = 0;
    let touchStartY = 0;
    const minSwipeDistance = 30;

    elements.canvas.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    elements.canvas.addEventListener('touchend', e => {
        if (!gameState.isPlaying || gameState.isPaused) return;

        const diffX = e.changedTouches[0].clientX - touchStartX;
        const diffY = e.changedTouches[0].clientY - touchStartY;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (Math.abs(diffX) > minSwipeDistance) {
                setDirection(diffX > 0 ? 1 : -1, 0);
            }
        } else {
            if (Math.abs(diffY) > minSwipeDistance) {
                setDirection(0, diffY > 0 ? 1 : -1);
            }
        }
    }, { passive: true });
}

// ==========================================
// Утилиты
// ==========================================

function haptic(type) {
    if (!tg?.HapticFeedback) return;

    switch (type) {
        case 'light':
            tg.HapticFeedback.impactOccurred('light');
            break;
        case 'selection':
            tg.HapticFeedback.selectionChanged();
            break;
        case 'success':
            tg.HapticFeedback.notificationOccurred('success');
            break;
        case 'error':
            tg.HapticFeedback.notificationOccurred('error');
            break;
    }
}

// ==========================================
// Запуск
// ==========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
