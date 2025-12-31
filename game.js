// ==========================================
// 🐉 УРОБОРОС - Мифическая змейка v2.4
// ==========================================

const tg = window.Telegram?.WebApp;

// ==========================================
// Константы
// ==========================================

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREASE = 3;
const MIN_SPEED = 60;
const TOTAL_LEVELS = 10;
let pointsPerLevel = 10; // Можно менять через настройки

// Настройки еды
const FOOD_LIFETIME = 8000; // 8 секунд жизни еды
const FOOD_STAGES = 5; // 5 этапов угасания
const FOOD_STAGE_TIME = FOOD_LIFETIME / FOOD_STAGES;

// ==========================================
// Улучшенные уровни
// ==========================================

const LEVELS = [
    { // Уровень 1 - Чистое поле
        obstacles: [],
        speed: 150,
        name: "Пробуждение"
    },
    { // Уровень 2 - Алтарь
        obstacles: [
            { x: 9, y: 9 }, { x: 10, y: 9 },
            { x: 9, y: 10 }, { x: 10, y: 10 }
        ],
        speed: 145,
        name: "Алтарь"
    },
    { // Уровень 3 - Четыре стража
        obstacles: [
            // Верхний левый
            { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 4, y: 5 },
            // Верхний правый
            { x: 14, y: 4 }, { x: 15, y: 4 }, { x: 15, y: 5 },
            // Нижний левый
            { x: 4, y: 14 }, { x: 4, y: 15 }, { x: 5, y: 15 },
            // Нижний правый
            { x: 15, y: 14 }, { x: 14, y: 15 }, { x: 15, y: 15 }
        ],
        speed: 140,
        name: "Четыре стража"
    },
    { // Уровень 4 - Коридор
        obstacles: [
            ...Array.from({ length: 14 }, (_, i) => ({ x: 3 + i, y: 6 })),
            ...Array.from({ length: 14 }, (_, i) => ({ x: 3 + i, y: 13 }))
        ],
        speed: 135,
        name: "Коридор"
    },
    { // Уровень 5 - Столбы
        obstacles: [
            { x: 5, y: 5 }, { x: 5, y: 6 }, { x: 5, y: 7 },
            { x: 14, y: 5 }, { x: 14, y: 6 }, { x: 14, y: 7 },
            { x: 5, y: 12 }, { x: 5, y: 13 }, { x: 5, y: 14 },
            { x: 14, y: 12 }, { x: 14, y: 13 }, { x: 14, y: 14 },
            { x: 9, y: 8 }, { x: 10, y: 8 },
            { x: 9, y: 11 }, { x: 10, y: 11 }
        ],
        speed: 130,
        name: "Столбы"
    },
    { // Уровень 6 - Врата
        obstacles: [
            ...Array.from({ length: 7 }, (_, i) => ({ x: 9, y: 1 + i })),
            ...Array.from({ length: 7 }, (_, i) => ({ x: 10, y: 1 + i })),
            ...Array.from({ length: 7 }, (_, i) => ({ x: 9, y: 12 + i })),
            ...Array.from({ length: 7 }, (_, i) => ({ x: 10, y: 12 + i }))
        ],
        speed: 125,
        name: "Врата"
    },
    { // Уровень 7 - Спираль
        obstacles: [
            ...Array.from({ length: 12 }, (_, i) => ({ x: 4, y: 4 + i })),
            ...Array.from({ length: 8 }, (_, i) => ({ x: 5 + i, y: 15 })),
            ...Array.from({ length: 8 }, (_, i) => ({ x: 12, y: 8 + i })),
            ...Array.from({ length: 4 }, (_, i) => ({ x: 8 + i, y: 8 }))
        ],
        speed: 115,
        name: "Спираль"
    },
    { // Уровень 8 - Арена
        obstacles: [
            // Внешний квадрат с проходами
            ...Array.from({ length: 5 }, (_, i) => ({ x: 3 + i, y: 3 })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 12 + i, y: 3 })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 3 + i, y: 16 })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 12 + i, y: 16 })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 3, y: 4 + i })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 3, y: 11 + i })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 16, y: 4 + i })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 16, y: 11 + i })),
            // Центр
            { x: 9, y: 9 }, { x: 10, y: 9 },
            { x: 9, y: 10 }, { x: 10, y: 10 }
        ],
        speed: 105,
        name: "Арена"
    },
    { // Уровень 9 - Хаос
        obstacles: [
            // Диагональные линии
            ...Array.from({ length: 6 }, (_, i) => ({ x: 2 + i, y: 2 + i })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 17 - i, y: 2 + i })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 2 + i, y: 17 - i })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 17 - i, y: 17 - i })),
            // Центральный крест
            { x: 9, y: 7 }, { x: 10, y: 7 },
            { x: 9, y: 12 }, { x: 10, y: 12 },
            { x: 7, y: 9 }, { x: 7, y: 10 },
            { x: 12, y: 9 }, { x: 12, y: 10 }
        ],
        speed: 95,
        name: "Хаос"
    },
    { // Уровень 10 - Храм Уробороса
        obstacles: [
            // Внешняя рамка с проходами
            ...Array.from({ length: 6 }, (_, i) => ({ x: 1 + i, y: 2 })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 13 + i, y: 2 })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 1 + i, y: 17 })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 13 + i, y: 17 })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 2, y: 3 + i })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 2, y: 11 + i })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 17, y: 3 + i })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 17, y: 11 + i })),
            // Внутренний квадрат
            ...Array.from({ length: 4 }, (_, i) => ({ x: 7 + i, y: 7 })),
            ...Array.from({ length: 4 }, (_, i) => ({ x: 7 + i, y: 12 })),
            { x: 7, y: 8 }, { x: 7, y: 9 }, { x: 7, y: 10 }, { x: 7, y: 11 },
            { x: 10, y: 8 }, { x: 10, y: 9 }, { x: 10, y: 10 }, { x: 10, y: 11 }
        ],
        speed: 85,
        name: "Храм Уробороса"
    }
];

// ==========================================
// Состояние игры
// ==========================================

let gameState = {
    mode: null,
    currentLevel: 1,
    snake: [],
    food: { x: 0, y: 0 },
    foodStage: FOOD_STAGES, // Текущий этап яркости еды (5 = максимум)
    foodTimer: null,
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    score: 0,
    levelScore: 0,
    totalScore: 0,
    obstacles: [],
    gameLoop: null,
    animationFrame: null,
    speed: INITIAL_SPEED,
    isPlaying: false,
    isPaused: false,
    time: 0, // Для анимаций
    // Анимация поедания
    isEating: false,
    eatingTimer: 0,
    // Еда путешествует по телу
    foodBulges: [] // { segmentIndex: number, progress: number }
};

let records = { survival: [], levels: [] };
let unlockedLevels = 1;
const elements = {};

// ==========================================
// Инициализация
// ==========================================

function init() {
    cacheElements();
    if (tg) {
        tg.ready();
        tg.expand();
        // Отключаем вертикальные свайпы Telegram (закрытие/сворачивание)
        if (tg.disableVerticalSwipes) {
            tg.disableVerticalSwipes();
        }
    }
    // Блокируем скролл на уровне CSS
    document.body.style.touchAction = 'none';
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.touchAction = 'none';
    document.documentElement.style.overscrollBehavior = 'none';

    loadData();
    setupCanvas();
    setupEventListeners();
    generateLevelButtons();
    showScreen('main-menu');
}

function cacheElements() {
    elements.mainMenu = document.getElementById('main-menu');
    elements.levelSelect = document.getElementById('level-select');
    elements.leaderboard = document.getElementById('leaderboard-screen');
    elements.gameScreen = document.getElementById('game-screen');
    elements.canvas = document.getElementById('game-canvas');
    elements.ctx = elements.canvas.getContext('2d');
    elements.score = document.getElementById('score');
    elements.levelInfo = document.getElementById('level-info');
    elements.currentLevel = document.getElementById('current-level');
    elements.levelScore = document.getElementById('level-score');
    elements.levelGoal = document.getElementById('level-goal');
    elements.pauseOverlay = document.getElementById('pause-overlay');
    elements.levelComplete = document.getElementById('level-complete');
    elements.gameOver = document.getElementById('game-over');
    elements.gameComplete = document.getElementById('game-complete');
    elements.newRecord = document.getElementById('new-record');
    elements.finalScore = document.getElementById('final-score');
    elements.levelCompleteScore = document.getElementById('level-complete-score');
    elements.totalScore = document.getElementById('total-score');
    elements.levelsGrid = document.getElementById('levels-grid');
    elements.leaderboardList = document.getElementById('leaderboard-list');
}

function setupCanvas() {
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    const gameScreen = document.getElementById('game-screen');
    if (!gameScreen || gameScreen.classList.contains('hidden')) return;

    const header = document.getElementById('header');
    const controls = document.getElementById('controls');
    const headerHeight = header ? header.offsetHeight : 0;
    const controlsHeight = controls ? controls.offsetHeight : 0;
    const padding = 40;

    const availableHeight = window.innerHeight - headerHeight - controlsHeight - padding;
    const availableWidth = window.innerWidth - padding;
    const size = Math.floor(Math.min(availableWidth, availableHeight, 400));

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
        if (savedRecords) records = JSON.parse(savedRecords);
        const savedLevels = localStorage.getItem('ouroborosUnlockedLevels');
        if (savedLevels) unlockedLevels = Math.min(Math.max(1, parseInt(savedLevels)), TOTAL_LEVELS);
    } catch (e) { console.error('Ошибка загрузки:', e); }
}

function saveData() {
    try {
        localStorage.setItem('ouroborosRecords', JSON.stringify(records));
        localStorage.setItem('ouroborosUnlockedLevels', unlockedLevels.toString());
    } catch (e) { console.error('Ошибка сохранения:', e); }
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
// Уровни и рекорды
// ==========================================

function generateLevelButtons() {
    elements.levelsGrid.innerHTML = '';
    for (let i = 1; i <= TOTAL_LEVELS; i++) {
        const btn = document.createElement('button');
        btn.className = 'level-btn';
        btn.textContent = i;
        if (i < unlockedLevels) btn.classList.add('completed');
        else if (i === unlockedLevels) btn.classList.add('current');
        else btn.disabled = true;
        btn.addEventListener('click', () => startLevelMode(i));
        elements.levelsGrid.appendChild(btn);
    }
}

function showLeaderboard(tab = 'survival') {
    showScreen('leaderboard-screen');
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    renderLeaderboard(tab);
}

function renderLeaderboard(tab) {
    const list = records[tab] || [];
    if (list.length === 0) {
        elements.leaderboardList.innerHTML = `<div class="empty-leaderboard"><p>🏆 Пока нет рекордов</p></div>`;
        return;
    }
    elements.leaderboardList.innerHTML = list.map((record, index) => {
        const rankClass = index < 3 ? ['gold', 'silver', 'bronze'][index] : '';
        const date = new Date(record.date).toLocaleDateString('ru-RU');
        return `<div class="leaderboard-item ${rankClass}">
            <span class="rank rank-${index + 1}">${index + 1}</span>
            <div class="record-info"><div class="record-date">${date}</div>
            ${tab === 'levels' ? `<div>Уровень ${record.level}</div>` : ''}</div>
            <span class="record-score">${record.score}</span></div>`;
    }).join('');
}

function addRecord(mode, score, level = null) {
    const record = { score, date: Date.now(), level };
    records[mode].push(record);
    records[mode].sort((a, b) => b.score - a.score);
    records[mode] = records[mode].slice(0, 10);
    saveData();
    return records[mode][0].date === record.date;
}

// ==========================================
// Запуск игры
// ==========================================

function startSurvivalMode() {
    gameState.mode = 'survival';
    gameState.currentLevel = 0;
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
    elements.levelGoal.textContent = pointsPerLevel;
    startGame();
}

function loadLevel(level) {
    const config = LEVELS[level - 1];
    gameState.obstacles = [...config.obstacles];
    gameState.speed = config.speed;
}

function startGame() {
    showScreen('game-screen');
    hideAllOverlays();
    setTimeout(resizeCanvas, 50);

    const startX = Math.floor(GRID_SIZE / 2);
    const startY = Math.floor(GRID_SIZE / 2);
    const safeStart = findSafeStart(startX, startY);

    gameState.snake = [safeStart];
    gameState.direction = { x: 1, y: 0 };
    gameState.nextDirection = { x: 1, y: 0 };
    gameState.score = 0;
    gameState.levelScore = 0;
    gameState.isPlaying = true;
    gameState.isPaused = false;
    gameState.time = 0;

    elements.score.textContent = '0';
    elements.levelScore.textContent = '0';

    spawnFood();

    if (gameState.gameLoop) clearInterval(gameState.gameLoop);
    gameState.gameLoop = setInterval(gameStep, gameState.speed);

    // Запуск анимации
    if (gameState.animationFrame) cancelAnimationFrame(gameState.animationFrame);
    animate();

    haptic('light');
}

function animate() {
    if (!gameState.isPlaying || gameState.isPaused) return;
    gameState.time += 0.05;

    // Обновляем таймер поедания
    if (gameState.isEating) {
        gameState.eatingTimer--;
        if (gameState.eatingTimer <= 0) {
            gameState.isEating = false;
        }
    }

    // Обновляем движение еды по телу
    gameState.foodBulges = gameState.foodBulges.filter(bulge => {
        bulge.progress += 0.08; // скорость движения
        if (bulge.progress >= 1) {
            bulge.progress = 0;
            bulge.segmentIndex++;
        }
        // Удаляем когда дошло до конца
        return bulge.segmentIndex < gameState.snake.length - 1;
    });

    draw();
    gameState.animationFrame = requestAnimationFrame(animate);
}

function findSafeStart(x, y) {
    if (!isObstacle(x, y)) return { x, y };
    for (let r = 1; r < GRID_SIZE; r++) {
        for (let dx = -r; dx <= r; dx++) {
            for (let dy = -r; dy <= r; dy++) {
                const nx = (x + dx + GRID_SIZE) % GRID_SIZE;
                const ny = (y + dy + GRID_SIZE) % GRID_SIZE;
                if (!isObstacle(nx, ny)) return { x: nx, y: ny };
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

    gameState.direction = { ...gameState.nextDirection };

    let head = { ...gameState.snake[0] };
    head.x += gameState.direction.x;
    head.y += gameState.direction.y;

    // Телепортация
    head.x = (head.x + GRID_SIZE) % GRID_SIZE;
    head.y = (head.y + GRID_SIZE) % GRID_SIZE;

    if (gameState.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
        gameOver();
        return;
    }

    if (isObstacle(head.x, head.y)) {
        gameOver();
        return;
    }

    gameState.snake.unshift(head);

    if (head.x === gameState.food.x && head.y === gameState.food.y) {
        eatFood();
    } else {
        gameState.snake.pop();
    }
}

function eatFood() {
    gameState.score++;
    gameState.levelScore++;
    elements.score.textContent = gameState.score;
    elements.levelScore.textContent = gameState.levelScore;

    // Очищаем таймер еды
    if (gameState.foodTimer) {
        clearInterval(gameState.foodTimer);
        gameState.foodTimer = null;
    }

    // Запускаем анимацию поедания (открытый рот)
    gameState.isEating = true;
    gameState.eatingTimer = 12; // кадров анимации

    // Добавляем "еду" которая будет путешествовать по телу
    gameState.foodBulges.push({
        segmentIndex: 0,
        progress: 0
    });

    haptic('light');

    if (gameState.mode === 'levels' && gameState.levelScore >= pointsPerLevel) {
        levelComplete();
        return;
    }

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
    do {
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
        attempts++;
    } while (
        (gameState.snake.some(seg => seg.x === newFood.x && seg.y === newFood.y) ||
        isObstacle(newFood.x, newFood.y)) && attempts < 1000
    );

    gameState.food = newFood;
    gameState.foodStage = FOOD_STAGES;

    // Запускаем таймер угасания
    if (gameState.foodTimer) clearInterval(gameState.foodTimer);
    gameState.foodTimer = setInterval(() => {
        if (!gameState.isPlaying || gameState.isPaused) return;

        gameState.foodStage--;
        if (gameState.foodStage <= 0) {
            // Еда исчезла - спавним новую
            clearInterval(gameState.foodTimer);
            spawnFood();
        }
    }, FOOD_STAGE_TIME);
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
    if (gameState.foodTimer) clearInterval(gameState.foodTimer);
    if (gameState.animationFrame) cancelAnimationFrame(gameState.animationFrame);

    haptic('error');
    elements.finalScore.textContent = gameState.score;

    const isNewRecord = addRecord(gameState.mode, gameState.score,
        gameState.mode === 'levels' ? gameState.currentLevel : null);

    elements.newRecord.classList.toggle('hidden', !isNewRecord);
    elements.gameOver.classList.remove('hidden');
}

function levelComplete() {
    gameState.isPlaying = false;
    clearInterval(gameState.gameLoop);
    if (gameState.foodTimer) clearInterval(gameState.foodTimer);
    if (gameState.animationFrame) cancelAnimationFrame(gameState.animationFrame);

    haptic('success');
    gameState.totalScore += gameState.score;
    elements.levelCompleteScore.textContent = gameState.score;

    if (gameState.currentLevel >= unlockedLevels && gameState.currentLevel < TOTAL_LEVELS) {
        unlockedLevels = gameState.currentLevel + 1;
        saveData();
    }

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
    if (gameState.mode === 'survival') startSurvivalMode();
    else startLevelMode(gameState.currentLevel);
}

function pauseGame() {
    if (!gameState.isPlaying) return;
    gameState.isPaused = true;
    clearInterval(gameState.gameLoop);
    if (gameState.animationFrame) cancelAnimationFrame(gameState.animationFrame);
    elements.pauseOverlay.classList.remove('hidden');
}

function resumeGame() {
    gameState.isPaused = false;
    elements.pauseOverlay.classList.add('hidden');
    gameState.gameLoop = setInterval(gameStep, gameState.speed);
    animate();
}

function quitGame() {
    gameState.isPlaying = false;
    gameState.isPaused = false;
    clearInterval(gameState.gameLoop);
    if (gameState.foodTimer) clearInterval(gameState.foodTimer);
    if (gameState.animationFrame) cancelAnimationFrame(gameState.animationFrame);
    showScreen('main-menu');
}

// ==========================================
// Отрисовка - Улучшенная графика
// ==========================================

function draw() {
    const ctx = elements.ctx;
    const canvas = elements.canvas;
    const cellSize = canvas.width / GRID_SIZE;

    // Очистка и фон
    drawBackground(ctx, canvas);

    // Препятствия
    drawObstacles(ctx, cellSize);

    // Еда (светящийся шар)
    drawFood(ctx, cellSize);

    // Змейка (объёмная золотая)
    drawSnake(ctx, cellSize);
}

function drawBackground(ctx, canvas) {
    // Тёмный градиент
    const bgGrad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
    );
    bgGrad.addColorStop(0, '#1e1e3f');
    bgGrad.addColorStop(1, '#0d0d1a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Тонкая сетка
    const cellSize = canvas.width / GRID_SIZE;
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.03)';
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
}

function drawObstacles(ctx, cellSize) {
    gameState.obstacles.forEach(obs => {
        const x = obs.x * cellSize;
        const y = obs.y * cellSize;
        const padding = 1;
        const size = cellSize - padding * 2;

        // Каменный блок с 3D эффектом
        const grad = ctx.createLinearGradient(x, y, x + size, y + size);
        grad.addColorStop(0, '#5a5a7a');
        grad.addColorStop(0.5, '#3a3a5a');
        grad.addColorStop(1, '#2a2a4a');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x + padding, y + padding, size, size, 3);
        ctx.fill();

        // Верхний блик
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.roundRect(x + padding + 2, y + padding + 2, size - 4, size / 3, 2);
        ctx.fill();

        // Обводка
        ctx.strokeStyle = '#6a6a9a';
        ctx.lineWidth = 1;
        ctx.stroke();
    });
}

function drawFood(ctx, cellSize) {
    const x = gameState.food.x * cellSize + cellSize / 2;
    const y = gameState.food.y * cellSize + cellSize / 2;
    const baseRadius = cellSize / 2 - 3;

    // Яркость зависит от этапа (1-5)
    const brightness = gameState.foodStage / FOOD_STAGES;
    const pulseScale = 1 + Math.sin(gameState.time * 4) * 0.1;
    const radius = baseRadius * pulseScale * (0.7 + brightness * 0.3);

    // Внешнее свечение
    const glowRadius = radius * (2 + brightness);
    const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
    const glowAlpha = 0.4 * brightness;
    glow.addColorStop(0, `rgba(255, 200, 100, ${glowAlpha})`);
    glow.addColorStop(0.5, `rgba(255, 150, 50, ${glowAlpha * 0.5})`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Основной шар
    const ballGrad = ctx.createRadialGradient(
        x - radius * 0.3, y - radius * 0.3, 0,
        x, y, radius
    );
    const coreAlpha = 0.5 + brightness * 0.5;
    ballGrad.addColorStop(0, `rgba(255, 255, 200, ${coreAlpha})`);
    ballGrad.addColorStop(0.3, `rgba(255, 220, 100, ${coreAlpha})`);
    ballGrad.addColorStop(0.7, `rgba(255, 180, 50, ${coreAlpha * 0.8})`);
    ballGrad.addColorStop(1, `rgba(200, 100, 0, ${coreAlpha * 0.5})`);

    ctx.fillStyle = ballGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Яркий блик
    const highlightAlpha = 0.6 * brightness;
    ctx.fillStyle = `rgba(255, 255, 255, ${highlightAlpha})`;
    ctx.beginPath();
    ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Индикатор оставшегося времени (кольцо)
    if (brightness < 1) {
        ctx.strokeStyle = `rgba(255, 100, 100, ${1 - brightness})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, radius + 4, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * brightness));
        ctx.stroke();
    }
}

function drawSnake(ctx, cellSize) {
    const snake = gameState.snake;
    const len = snake.length;
    if (len === 0) return;

    const dir = gameState.direction;

    // Координаты сегмента
    function getCoords(seg) {
        return {
            x: seg.x * cellSize + cellSize / 2,
            y: seg.y * cellSize + cellSize / 2
        };
    }

    // Ширина тела (сужается к хвосту)
    function getWidth(i) {
        const progress = i / Math.max(len - 1, 1);
        return cellSize * 0.8 * (1 - progress * 0.35);
    }

    // Получаем "выпуклость" от еды в данном сегменте
    function getBulgeScale(segIndex) {
        let scale = 1;
        for (const bulge of gameState.foodBulges) {
            if (bulge.segmentIndex === segIndex) {
                // Максимум в середине прогресса
                const bulgeAmount = Math.sin(bulge.progress * Math.PI) * 0.4;
                scale = Math.max(scale, 1 + bulgeAmount);
            }
        }
        return scale;
    }

    // Цвет сегмента (золотой градиент к хвосту)
    function getColor(progress) {
        const r = Math.floor(255 - progress * 45);
        const g = Math.floor(195 - progress * 55);
        const b = Math.floor(45 - progress * 25);
        return { r, g, b };
    }

    // Проверяем есть ли поворот между сегментами
    function isTurn(i) {
        if (i <= 0 || i >= len - 1) return false;
        const prev = snake[i + 1];
        const curr = snake[i];
        const next = snake[i - 1];
        // Проверяем телепортацию
        if (Math.abs(prev.x - curr.x) > 1 || Math.abs(prev.y - curr.y) > 1) return false;
        if (Math.abs(curr.x - next.x) > 1 || Math.abs(curr.y - next.y) > 1) return false;
        // Направление до и после
        const dx1 = curr.x - prev.x;
        const dy1 = curr.y - prev.y;
        const dx2 = next.x - curr.x;
        const dy2 = next.y - curr.y;
        return dx1 !== dx2 || dy1 !== dy2;
    }

    // === ТЕНЬ ===
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (let i = len - 1; i >= 0; i--) {
        const seg = getCoords(snake[i]);
        const w = getWidth(i) * getBulgeScale(i);
        ctx.beginPath();
        ctx.ellipse(seg.x + 2, seg.y + 3, w / 2, w / 2 * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // === ТЕЛО С ЧЕШУЁЙ ===
    // Сначала рисуем основу тела (соединения)
    for (let i = len - 1; i >= 1; i--) {
        const curr = getCoords(snake[i]);
        const next = getCoords(snake[i - 1]);
        const progress = i / Math.max(len - 1, 1);
        const bulge1 = getBulgeScale(i);
        const bulge2 = getBulgeScale(i - 1);
        const w1 = getWidth(i) * bulge1;
        const w2 = getWidth(i - 1) * bulge2;
        const col = getColor(progress);

        // Пропускаем телепортацию
        if (Math.abs(snake[i].x - snake[i - 1].x) > 1 || Math.abs(snake[i].y - snake[i - 1].y) > 1) continue;

        const angle = Math.atan2(next.y - curr.y, next.x - curr.x);
        const dist = Math.hypot(next.x - curr.x, next.y - curr.y);

        ctx.save();
        ctx.translate(curr.x, curr.y);
        ctx.rotate(angle);

        // Градиент тела (3D эффект)
        const grad = ctx.createLinearGradient(0, -w1 / 2, 0, w1 / 2);
        grad.addColorStop(0, `rgb(${col.r + 35}, ${col.g + 30}, ${col.b + 25})`);
        grad.addColorStop(0.25, `rgb(${col.r}, ${col.g}, ${col.b})`);
        grad.addColorStop(0.75, `rgb(${col.r}, ${col.g}, ${col.b})`);
        grad.addColorStop(1, `rgb(${col.r - 35}, ${col.g - 35}, ${col.b - 15})`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, -w1 / 2);
        ctx.lineTo(dist, -w2 / 2);
        ctx.lineTo(dist, w2 / 2);
        ctx.lineTo(0, w1 / 2);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    // === КРУГЛЫЕ СОЧЛЕНЕНИЯ НА ПОВОРОТАХ ===
    for (let i = len - 2; i >= 1; i--) {
        if (isTurn(i)) {
            const seg = getCoords(snake[i]);
            const progress = i / Math.max(len - 1, 1);
            const w = getWidth(i) * getBulgeScale(i);
            const col = getColor(progress);

            // Круглое сочленение закрывает промежуток
            const jointGrad = ctx.createRadialGradient(seg.x, seg.y, 0, seg.x, seg.y, w / 2);
            jointGrad.addColorStop(0, `rgb(${col.r + 20}, ${col.g + 20}, ${col.b + 15})`);
            jointGrad.addColorStop(0.7, `rgb(${col.r}, ${col.g}, ${col.b})`);
            jointGrad.addColorStop(1, `rgb(${col.r - 20}, ${col.g - 20}, ${col.b - 10})`);

            ctx.fillStyle = jointGrad;
            ctx.beginPath();
            ctx.arc(seg.x, seg.y, w / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // === ЧЕШУЙКИ (поверх тела) ===
    for (let i = len - 1; i >= 2; i--) {
        const seg = getCoords(snake[i]);
        const prev = i < len - 1 ? getCoords(snake[i + 1]) : seg;
        const progress = i / Math.max(len - 1, 1);
        const w = getWidth(i) * getBulgeScale(i);
        const col = getColor(progress);

        // Направление сегмента
        const angle = Math.atan2(seg.y - prev.y, seg.x - prev.x);

        ctx.save();
        ctx.translate(seg.x, seg.y);
        ctx.rotate(angle);

        // Чешуйка - полукруг с градиентом
        const scaleW = w * 0.6;
        const scaleH = w * 0.35;

        // Основа чешуйки
        const scaleGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, scaleW);
        scaleGrad.addColorStop(0, `rgba(${col.r + 50}, ${col.g + 45}, ${col.b + 40}, 0.9)`);
        scaleGrad.addColorStop(0.6, `rgba(${col.r}, ${col.g}, ${col.b}, 0.8)`);
        scaleGrad.addColorStop(1, `rgba(${col.r - 30}, ${col.g - 30}, ${col.b - 15}, 0.7)`);

        ctx.fillStyle = scaleGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, scaleW, scaleH, 0, Math.PI, 0);
        ctx.fill();

        // Блик на чешуйке
        ctx.fillStyle = `rgba(255, 255, 200, ${0.25 - progress * 0.15})`;
        ctx.beginPath();
        ctx.ellipse(-scaleW * 0.2, -scaleH * 0.3, scaleW * 0.25, scaleH * 0.3, -0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // === ВИЗУАЛИЗАЦИЯ ЕДЫ ВНУТРИ ТЕЛА ===
    for (const bulge of gameState.foodBulges) {
        if (bulge.segmentIndex >= 0 && bulge.segmentIndex < len - 1) {
            const curr = getCoords(snake[bulge.segmentIndex]);
            const next = getCoords(snake[bulge.segmentIndex + 1]);
            // Интерполяция позиции
            const x = curr.x + (next.x - curr.x) * bulge.progress;
            const y = curr.y + (next.y - curr.y) * bulge.progress;
            const w = getWidth(bulge.segmentIndex) * 0.5;

            // Светящийся шарик еды внутри
            const foodGrad = ctx.createRadialGradient(x, y, 0, x, y, w);
            foodGrad.addColorStop(0, 'rgba(255, 220, 100, 0.8)');
            foodGrad.addColorStop(0.5, 'rgba(255, 180, 50, 0.5)');
            foodGrad.addColorStop(1, 'rgba(255, 150, 0, 0)');

            ctx.fillStyle = foodGrad;
            ctx.beginPath();
            ctx.arc(x, y, w, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // === ХВОСТ ===
    if (len > 1) {
        const tail = getCoords(snake[len - 1]);
        const prev = getCoords(snake[len - 2]);
        const tailW = getWidth(len - 1) * 0.7;
        const angle = Math.atan2(tail.y - prev.y, tail.x - prev.x);

        ctx.save();
        ctx.translate(tail.x, tail.y);
        ctx.rotate(angle);

        // Заострённый хвост
        const tailGrad = ctx.createLinearGradient(-tailW, 0, tailW * 2, 0);
        tailGrad.addColorStop(0, '#c9941a');
        tailGrad.addColorStop(0.5, '#a67c15');
        tailGrad.addColorStop(1, '#8b6914');

        ctx.fillStyle = tailGrad;
        ctx.beginPath();
        ctx.moveTo(-tailW, -tailW * 0.6);
        ctx.quadraticCurveTo(tailW, -tailW * 0.3, tailW * 1.5, 0);
        ctx.quadraticCurveTo(tailW, tailW * 0.3, -tailW, tailW * 0.6);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    // === ГОЛОВА ===
    drawSnakeHead(ctx, cellSize, snake, dir);
}

function drawSnakeHead(ctx, cellSize, snake, dir) {
    if (snake.length < 1) return;

    const head = snake[0];
    const hx = head.x * cellSize + cellSize / 2;
    const hy = head.y * cellSize + cellSize / 2;

    // Размеры головы (треугольная форма)
    const headLen = cellSize * 1.3;
    const headW = cellSize * 0.9;

    // Угол направления
    let angle = 0;
    if (dir.x === 1) angle = 0;
    else if (dir.x === -1) angle = Math.PI;
    else if (dir.y === -1) angle = -Math.PI / 2;
    else angle = Math.PI / 2;

    // Анимация открытия рта
    const isEating = gameState.isEating;
    const mouthOpen = isEating ? Math.sin((12 - gameState.eatingTimer) / 12 * Math.PI) * 0.3 : 0;

    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(angle);

    // Тень головы
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.moveTo(-headLen * 0.4, 0);
    ctx.lineTo(headLen * 0.3, -headW * 0.4);
    ctx.lineTo(headLen * 0.6, 0);
    ctx.lineTo(headLen * 0.3, headW * 0.4);
    ctx.closePath();
    ctx.fill();

    // Соединение с телом (шея)
    if (snake.length > 1) {
        const neckGrad = ctx.createLinearGradient(0, -headW * 0.4, 0, headW * 0.4);
        neckGrad.addColorStop(0, '#ffe066');
        neckGrad.addColorStop(0.5, '#ffd700');
        neckGrad.addColorStop(1, '#cc9900');
        ctx.fillStyle = neckGrad;
        ctx.beginPath();
        ctx.arc(-headLen * 0.35, 0, headW * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }

    // === ГОЛОВА С ОТКРЫТЫМ РТОМ ===
    if (isEating && mouthOpen > 0.1) {
        // Рисуем верхнюю и нижнюю челюсть отдельно
        const jawOffset = headW * mouthOpen;

        // Верхняя челюсть
        ctx.save();
        ctx.translate(0, -jawOffset * 0.5);

        const upperGrad = ctx.createLinearGradient(-headLen * 0.4, 0, headLen * 0.6, 0);
        upperGrad.addColorStop(0, '#ffd700');
        upperGrad.addColorStop(0.5, '#ffdb4d');
        upperGrad.addColorStop(1, '#daa520');

        ctx.fillStyle = upperGrad;
        ctx.beginPath();
        ctx.moveTo(-headLen * 0.35, 0);
        ctx.quadraticCurveTo(-headLen * 0.3, -headW * 0.35, headLen * 0.1, -headW * 0.3);
        ctx.quadraticCurveTo(headLen * 0.5, -headW * 0.1, headLen * 0.55, 0);
        ctx.lineTo(-headLen * 0.35, 0);
        ctx.fill();
        ctx.restore();

        // Нижняя челюсть
        ctx.save();
        ctx.translate(0, jawOffset * 0.5);

        const lowerGrad = ctx.createLinearGradient(-headLen * 0.4, 0, headLen * 0.6, 0);
        lowerGrad.addColorStop(0, '#e6c200');
        lowerGrad.addColorStop(0.5, '#ffc800');
        lowerGrad.addColorStop(1, '#cc9900');

        ctx.fillStyle = lowerGrad;
        ctx.beginPath();
        ctx.moveTo(-headLen * 0.35, 0);
        ctx.lineTo(headLen * 0.55, 0);
        ctx.quadraticCurveTo(headLen * 0.5, headW * 0.1, headLen * 0.1, headW * 0.3);
        ctx.quadraticCurveTo(-headLen * 0.3, headW * 0.35, -headLen * 0.35, 0);
        ctx.fill();
        ctx.restore();

        // Рот (внутренняя часть)
        ctx.fillStyle = '#4a1a1a';
        ctx.beginPath();
        ctx.ellipse(headLen * 0.3, 0, headLen * 0.2, jawOffset, 0, 0, Math.PI * 2);
        ctx.fill();

        // Язык внутри рта
        ctx.fillStyle = '#cc4444';
        ctx.beginPath();
        ctx.ellipse(headLen * 0.25, 0, headLen * 0.1, jawOffset * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
    } else {
        // === ГОЛОВА - ОБЫЧНАЯ ТРЕУГОЛЬНАЯ ФОРМА ===
        const headGrad = ctx.createLinearGradient(-headLen * 0.4, 0, headLen * 0.6, 0);
        headGrad.addColorStop(0, '#ffd700');
        headGrad.addColorStop(0.3, '#ffdb4d');
        headGrad.addColorStop(0.6, '#ffc800');
        headGrad.addColorStop(1, '#daa520');

        ctx.fillStyle = headGrad;
        ctx.beginPath();
        // Треугольник с закруглёнными углами
        ctx.moveTo(-headLen * 0.35, 0);
        ctx.quadraticCurveTo(-headLen * 0.3, -headW * 0.45, headLen * 0.1, -headW * 0.4);
        ctx.quadraticCurveTo(headLen * 0.5, -headW * 0.2, headLen * 0.55, 0);
        ctx.quadraticCurveTo(headLen * 0.5, headW * 0.2, headLen * 0.1, headW * 0.4);
        ctx.quadraticCurveTo(-headLen * 0.3, headW * 0.45, -headLen * 0.35, 0);
        ctx.fill();
    }

    // Верхний блик
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, -headW * 0.15 - (isEating ? mouthOpen * headW * 0.3 : 0), headLen * 0.25, headW * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Чешуйки на голове
    ctx.fillStyle = 'rgba(218, 165, 32, 0.4)';
    ctx.beginPath();
    ctx.ellipse(-headLen * 0.1, -headW * 0.1 - (isEating ? mouthOpen * headW * 0.2 : 0), headLen * 0.12, headLen * 0.08, -0.2, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headLen * 0.05, -headW * 0.08 - (isEating ? mouthOpen * headW * 0.2 : 0), headLen * 0.1, headLen * 0.06, -0.2, Math.PI, 0);
    ctx.fill();

    // === ГЛАЗА ===
    const eyeX = headLen * 0.05;
    const eyeY = headW * 0.22;
    const eyeR = headW * 0.18;
    const eyeOffset = isEating ? mouthOpen * headW * 0.3 : 0;

    [eyeY + eyeOffset, -eyeY - eyeOffset].forEach(y => {
        // Глазница (тёмная обводка)
        ctx.fillStyle = '#4a3800';
        ctx.beginPath();
        ctx.ellipse(eyeX, y, eyeR + 1, eyeR * 0.85 + 1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Белок
        ctx.fillStyle = '#fffef5';
        ctx.beginPath();
        ctx.ellipse(eyeX, y, eyeR, eyeR * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();

        // Зрачок (вертикальный, янтарный/красный)
        const pupilGrad = ctx.createRadialGradient(eyeX, y, 0, eyeX, y, eyeR * 0.5);
        pupilGrad.addColorStop(0, '#ff6600');
        pupilGrad.addColorStop(0.5, '#cc3300');
        pupilGrad.addColorStop(1, '#660000');
        ctx.fillStyle = pupilGrad;
        ctx.beginPath();
        ctx.ellipse(eyeX + 1, y, eyeR * 0.25, eyeR * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Блик
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(eyeX - eyeR * 0.25, y - eyeR * 0.2, eyeR * 0.2, 0, Math.PI * 2);
        ctx.fill();
    });

    // Ноздри (смещаются при открытом рте)
    ctx.fillStyle = '#3d2b00';
    ctx.beginPath();
    ctx.ellipse(headLen * 0.4, -headW * 0.08 - eyeOffset * 0.5, 1.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headLen * 0.4, headW * 0.08 + eyeOffset * 0.5, 1.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// ==========================================
// Управление
// ==========================================

function setupEventListeners() {
    document.getElementById('btn-survival').addEventListener('click', startSurvivalMode);
    document.getElementById('btn-levels').addEventListener('click', () => {
        generateLevelButtons();
        showScreen('level-select');
    });
    document.getElementById('btn-leaderboard').addEventListener('click', () => showLeaderboard('survival'));

    document.getElementById('btn-back-levels').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('btn-back-leaderboard').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('btn-back-game').addEventListener('click', pauseGame);

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => showLeaderboard(btn.dataset.tab));
    });

    // Кнопки выбора цели для уровней
    document.querySelectorAll('.goal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.goal-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            pointsPerLevel = parseInt(btn.dataset.goal);
        });
    });

    document.getElementById('btn-resume').addEventListener('click', resumeGame);
    document.getElementById('btn-quit').addEventListener('click', quitGame);
    document.getElementById('btn-retry').addEventListener('click', retryGame);
    document.getElementById('btn-menu').addEventListener('click', quitGame);
    document.getElementById('btn-next-level').addEventListener('click', nextLevel);
    document.getElementById('btn-complete-menu').addEventListener('click', quitGame);

    document.getElementById('btn-up').addEventListener('click', () => setDirection(0, -1));
    document.getElementById('btn-down').addEventListener('click', () => setDirection(0, 1));
    document.getElementById('btn-left').addEventListener('click', () => setDirection(-1, 0));
    document.getElementById('btn-right').addEventListener('click', () => setDirection(1, 0));

    document.addEventListener('keydown', handleKeyDown);
    setupSwipeControls();
    document.addEventListener('dblclick', e => e.preventDefault());
}

function handleKeyDown(e) {
    if (!gameState.isPlaying) return;
    if (e.key === 'Escape') {
        gameState.isPaused ? resumeGame() : pauseGame();
        return;
    }
    if (gameState.isPaused) return;

    const keyMap = {
        'ArrowUp': [0, -1], 'w': [0, -1], 'W': [0, -1],
        'ArrowDown': [0, 1], 's': [0, 1], 'S': [0, 1],
        'ArrowLeft': [-1, 0], 'a': [-1, 0], 'A': [-1, 0],
        'ArrowRight': [1, 0], 'd': [1, 0], 'D': [1, 0]
    };
    if (keyMap[e.key]) setDirection(...keyMap[e.key]);
}

function setDirection(x, y) {
    if (!gameState.isPlaying || gameState.isPaused) return;
    if (gameState.direction.x === -x && gameState.direction.y === -y) return;
    if (gameState.direction.x === x && gameState.direction.y === y) return;
    gameState.nextDirection = { x, y };
    haptic('selection');
}

function setupSwipeControls() {
    let startX = 0, startY = 0;
    let isSwiping = false;

    // Свайпы работают по всему экрану
    document.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isSwiping = true;
    }, { passive: true });

    document.addEventListener('touchmove', e => {
        // Блокируем скролл окна во время игры
        if (gameState.isPlaying && !gameState.isPaused) {
            e.preventDefault();
        }

        if (!isSwiping || !gameState.isPlaying || gameState.isPaused) return;

        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        const minSwipe = 25; // Минимальная длина свайпа

        if (Math.abs(dx) > minSwipe || Math.abs(dy) > minSwipe) {
            if (Math.abs(dx) > Math.abs(dy)) {
                setDirection(dx > 0 ? 1 : -1, 0);
            } else {
                setDirection(0, dy > 0 ? 1 : -1);
            }
            // Обновляем начальную точку для непрерывного управления
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }
    }, { passive: false }); // passive: false для preventDefault

    document.addEventListener('touchend', () => {
        isSwiping = false;
    }, { passive: true });

    // Дополнительно блокируем pull-to-refresh в Telegram
    document.body.style.overscrollBehavior = 'none';
}

function haptic(type) {
    if (!tg?.HapticFeedback) return;
    const actions = {
        'light': () => tg.HapticFeedback.impactOccurred('light'),
        'selection': () => tg.HapticFeedback.selectionChanged(),
        'success': () => tg.HapticFeedback.notificationOccurred('success'),
        'error': () => tg.HapticFeedback.notificationOccurred('error')
    };
    actions[type]?.();
}

// ==========================================
// Запуск
// ==========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
