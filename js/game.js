// ==========================================
// 🐉 УРОБОРОС - Мифическая змейка v2.8
// ==========================================

const tg = window.Telegram?.WebApp;
let pointsPerLevel = 10;

// Состояние игры
let gameState = {
    mode: null,
    difficulty: DIFFICULTY.NORMAL, // Режим сложности
    currentLevel: 1,
    snake: [],
    food: { x: 0, y: 0 },
    foodStage: FOOD_STAGES,
    foodTimer: null,
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    score: 0,
    levelScore: 0,
    totalScore: 0,
    maxScore: 0, // Для режима бессмертия
    obstacles: [],
    gameLoop: null,
    animationFrame: null,
    speed: INITIAL_SPEED,
    isPlaying: false,
    isPaused: false,
    waitingForInput: false, // Ждём первого ввода
    time: 0,
    isEating: false,
    eatingTimer: 0,
    foodBulges: [] // { distanceFromTail: number, progress: number }
};

// Раздельный рейтинг по сложности
let records = {
    survival_immortal: [],
    survival_normal: [],
    survival_hardcore: [],
    levels_immortal: [],
    levels_normal: [],
    levels_hardcore: []
};
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
        if (tg.disableVerticalSwipes) {
            tg.disableVerticalSwipes();
        }
    }
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
    elements.survivalLevelSelect = document.getElementById('survival-level-select');
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
    elements.survivalLevelsGrid = document.getElementById('survival-levels-grid');
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

    if (gameState.isPlaying) {
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

        // Создаём canvas для превью
        const canvas = document.createElement('canvas');
        canvas.width = 60;
        canvas.height = 60;
        canvas.className = 'level-preview';
        drawLevelPreview(canvas, i - 1);
        btn.appendChild(canvas);

        // Номер уровня
        const num = document.createElement('span');
        num.className = 'level-num';
        num.textContent = i;
        btn.appendChild(num);

        if (i < unlockedLevels) btn.classList.add('completed');
        else if (i === unlockedLevels) btn.classList.add('current');
        else btn.disabled = true;

        btn.addEventListener('click', () => startLevelMode(i));
        elements.levelsGrid.appendChild(btn);
    }
}

// Генерация кнопок арены для режима выживания (все доступны)
function generateSurvivalLevelButtons() {
    elements.survivalLevelsGrid.innerHTML = '';

    // Первая кнопка - пустая арена (уровень 0)
    const emptyBtn = document.createElement('button');
    emptyBtn.className = 'level-btn current';

    const emptyCanvas = document.createElement('canvas');
    emptyCanvas.width = 60;
    emptyCanvas.height = 60;
    emptyCanvas.className = 'level-preview';
    // Пустое превью
    const ctx = emptyCanvas.getContext('2d');
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 60, 60);
    emptyBtn.appendChild(emptyCanvas);

    const emptyNum = document.createElement('span');
    emptyNum.className = 'level-num';
    emptyNum.textContent = '∅';
    emptyBtn.appendChild(emptyNum);

    emptyBtn.addEventListener('click', () => startSurvivalMode(0));
    elements.survivalLevelsGrid.appendChild(emptyBtn);

    // Остальные уровни
    for (let i = 1; i <= TOTAL_LEVELS; i++) {
        const btn = document.createElement('button');
        btn.className = 'level-btn';

        const canvas = document.createElement('canvas');
        canvas.width = 60;
        canvas.height = 60;
        canvas.className = 'level-preview';
        drawLevelPreview(canvas, i - 1);
        btn.appendChild(canvas);

        const num = document.createElement('span');
        num.className = 'level-num';
        num.textContent = i;
        btn.appendChild(num);

        btn.addEventListener('click', () => startSurvivalMode(i));
        elements.survivalLevelsGrid.appendChild(btn);
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
    const difficulty = gameState.difficulty || DIFFICULTY.NORMAL;
    const key = `${tab}_${difficulty}`;
    const list = records[key] || [];

    // Показываем текущую сложность в заголовке
    const diffNames = {
        [DIFFICULTY.IMMORTAL]: '🌿 Бессмертие',
        [DIFFICULTY.NORMAL]: '⚔️ Обычный',
        [DIFFICULTY.HARDCORE]: '💀 Хардкор'
    };

    if (list.length === 0) {
        elements.leaderboardList.innerHTML = `<div class="empty-leaderboard">
            <p class="diff-indicator">${diffNames[difficulty]}</p>
            <p>🏆 Пока нет рекордов</p>
        </div>`;
        return;
    }

    const headerHtml = `<div class="leaderboard-diff-header">${diffNames[difficulty]}</div>`;

    elements.leaderboardList.innerHTML = headerHtml + list.map((record, index) => {
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
    const difficulty = gameState.difficulty || DIFFICULTY.NORMAL;
    const key = `${mode}_${difficulty}`;

    // Инициализируем если нет
    if (!records[key]) records[key] = [];

    const record = { score, date: Date.now(), level };
    records[key].push(record);
    records[key].sort((a, b) => b.score - a.score);
    records[key] = records[key].slice(0, 10);
    saveData();
    return records[key][0].date === record.date;
}

// ==========================================
// Запуск игры
// ==========================================

function startSurvivalMode(arenaLevel = 0) {
    gameState.mode = 'survival';
    gameState.currentLevel = arenaLevel;

    // Загружаем препятствия арены если выбран уровень > 0
    if (arenaLevel > 0 && arenaLevel <= TOTAL_LEVELS) {
        const config = LEVELS[arenaLevel - 1];
        gameState.obstacles = [...config.obstacles];
    } else {
        gameState.obstacles = [];
    }

    gameState.speed = INITIAL_SPEED;
    // Устанавливаем максимальный счёт для режима бессмертия (с учётом препятствий)
    gameState.maxScore = GRID_SIZE * GRID_SIZE - 1 - gameState.obstacles.length;
    elements.levelInfo.classList.add('hidden');
    startGame();
}

function setDifficulty(difficulty) {
    gameState.difficulty = difficulty;
    // Обновляем UI кнопок
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.difficulty === difficulty);
    });
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

    // Создаём змейку с начальной длиной
    gameState.snake = [safeStart];
    for (let i = 1; i < INITIAL_SNAKE_LENGTH; i++) {
        const tailX = safeStart.x - i;
        // Проверяем что хвост не выходит за границы и не на препятствии
        const wrappedX = (tailX + GRID_SIZE) % GRID_SIZE;
        if (!isObstacle(wrappedX, safeStart.y)) {
            gameState.snake.push({ x: wrappedX, y: safeStart.y });
        }
    }

    gameState.direction = { x: 1, y: 0 };
    gameState.nextDirection = { x: 1, y: 0 };
    gameState.score = 0;
    gameState.levelScore = 0;
    gameState.isPlaying = true;
    gameState.isPaused = false;
    gameState.waitingForInput = true; // Ждём первого ввода!
    gameState.time = 0;
    gameState.isEating = false;
    gameState.eatingTimer = 0;
    gameState.foodBulges = [];

    elements.score.textContent = '0';
    elements.levelScore.textContent = '0';

    spawnFood();

    // НЕ запускаем gameLoop сразу - ждём первого ввода
    if (gameState.gameLoop) clearInterval(gameState.gameLoop);

    // Запуск анимации (для отрисовки)
    if (gameState.animationFrame) cancelAnimationFrame(gameState.animationFrame);
    animate();
}

function animate() {
    if (!gameState.isPlaying) return;
    if (gameState.isPaused) return;

    gameState.time += 0.05;

    // Обновляем таймер поедания
    if (gameState.isEating) {
        gameState.eatingTimer--;
        if (gameState.eatingTimer <= 0) {
            gameState.isEating = false;
        }
    }

    // Обновляем движение еды по телу (только если игра активна)
    if (!gameState.waitingForInput) {
        gameState.foodBulges = gameState.foodBulges.filter(bulge => {
            bulge.distanceFromTail += 0.06;
            // Удаляем когда дошло до конца (хвоста)
            return bulge.distanceFromTail < gameState.snake.length;
        });
    }

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
    if (!gameState.isPlaying || gameState.isPaused || gameState.waitingForInput) return;

    gameState.direction = { ...gameState.nextDirection };

    let head = { ...gameState.snake[0] };
    head.x += gameState.direction.x;
    head.y += gameState.direction.y;

    const difficulty = gameState.difficulty;

    // Обработка стен в зависимости от режима
    if (difficulty === DIFFICULTY.HARDCORE) {
        // Хардкор: смерть при столкновении со стеной
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
            gameOver();
            return;
        }
    } else {
        // Обычный и Бессмертие: телепортация через стены
        head.x = (head.x + GRID_SIZE) % GRID_SIZE;
        head.y = (head.y + GRID_SIZE) % GRID_SIZE;
    }

    // Обработка столкновения с хвостом
    const hitSelf = gameState.snake.some(seg => seg.x === head.x && seg.y === head.y);
    if (hitSelf) {
        if (difficulty === DIFFICULTY.IMMORTAL) {
            // Бессмертие: проходим сквозь себя, но проверяем максимальный счёт
            if (gameState.score >= gameState.maxScore) {
                // Достигли максимума - победа!
                immortalWin();
                return;
            }
        } else {
            // Обычный и Хардкор: смерть от хвоста
            gameOver();
            return;
        }
    }

    // Проверка столкновения с препятствиями
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

// Победа в режиме бессмертия
function immortalWin() {
    gameState.isPlaying = false;
    clearInterval(gameState.gameLoop);
    if (gameState.foodTimer) clearInterval(gameState.foodTimer);
    if (gameState.animationFrame) cancelAnimationFrame(gameState.animationFrame);

    haptic('success');

    addRecord('survival', gameState.score, null);
    elements.totalScore.textContent = gameState.score;

    // Показываем экран победы
    document.getElementById('game-complete').querySelector('h2').textContent = '🌟 Бессмертие достигнуто!';
    document.getElementById('game-complete').querySelector('p').textContent = `Заполнено клеток: ${gameState.score}/${gameState.maxScore}`;
    elements.gameComplete.classList.remove('hidden');
}

function eatFood() {
    gameState.score++;
    gameState.levelScore++;
    elements.score.textContent = gameState.score;
    elements.levelScore.textContent = gameState.levelScore;

    if (gameState.foodTimer) {
        clearInterval(gameState.foodTimer);
        gameState.foodTimer = null;
    }

    // Анимация поедания
    gameState.isEating = true;
    gameState.eatingTimer = 12;

    // Добавляем еду которая путешествует от головы к хвосту
    // distanceFromTail = расстояние от хвоста (0 = хвост, len = голова)
    gameState.foodBulges.push({
        distanceFromTail: gameState.snake.length - 1, // начинаем у головы
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

    if (gameState.foodTimer) clearInterval(gameState.foodTimer);
    gameState.foodTimer = setInterval(() => {
        if (!gameState.isPlaying || gameState.isPaused || gameState.waitingForInput) return;

        gameState.foodStage--;
        if (gameState.foodStage <= 0) {
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
    if (!gameState.waitingForInput) {
        gameState.gameLoop = setInterval(gameStep, gameState.speed);
    }
    animate();
}

function quitGame() {
    gameState.isPlaying = false;
    gameState.isPaused = false;
    gameState.waitingForInput = false;
    clearInterval(gameState.gameLoop);
    if (gameState.foodTimer) clearInterval(gameState.foodTimer);
    if (gameState.animationFrame) cancelAnimationFrame(gameState.animationFrame);
    showScreen('main-menu');
}

// ==========================================
// Запуск
// ==========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
