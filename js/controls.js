// ==========================================
// 🐉 УРОБОРОС - Управление
// ==========================================

function setupEventListeners() {
    document.getElementById('btn-survival').addEventListener('click', () => {
        generateSurvivalLevelButtons();
        showScreen('survival-level-select');
    });
    document.getElementById('btn-levels').addEventListener('click', () => {
        generateLevelButtons();
        showScreen('level-select');
    });
    document.getElementById('btn-leaderboard').addEventListener('click', () => showLeaderboard('survival'));

    // Обработчики выбора сложности
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setDifficulty(btn.dataset.difficulty);
            haptic('selection');
        });
    });

    document.getElementById('btn-back-levels').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('btn-back-survival-levels').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('btn-back-leaderboard').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('btn-back-game').addEventListener('click', pauseGame);

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => showLeaderboard(btn.dataset.tab));
    });

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

    document.getElementById('btn-up').addEventListener('click', () => handleInput(0, -1));
    document.getElementById('btn-down').addEventListener('click', () => handleInput(0, 1));
    document.getElementById('btn-left').addEventListener('click', () => handleInput(-1, 0));
    document.getElementById('btn-right').addEventListener('click', () => handleInput(1, 0));

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
    if (keyMap[e.key]) handleInput(...keyMap[e.key]);
}

// Обработчик ввода - запускает игру при первом вводе
function handleInput(x, y) {
    if (!gameState.isPlaying || gameState.isPaused) return;

    // Первый ввод - запускаем движение
    if (gameState.waitingForInput) {
        gameState.waitingForInput = false;
        gameState.direction = { x, y };
        gameState.nextDirection = { x, y };
        // Запускаем игровой цикл
        if (gameState.gameLoop) clearInterval(gameState.gameLoop);
        gameState.gameLoop = setInterval(gameStep, gameState.speed);
        haptic('light');
        return;
    }

    setDirection(x, y);
}

function setDirection(x, y) {
    if (gameState.direction.x === -x && gameState.direction.y === -y) return;
    if (gameState.direction.x === x && gameState.direction.y === y) return;
    gameState.nextDirection = { x, y };
    haptic('selection');
}

function setupSwipeControls() {
    let startX = 0, startY = 0;
    let isSwiping = false;

    document.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isSwiping = true;
    }, { passive: true });

    document.addEventListener('touchmove', e => {
        if (gameState.isPlaying && !gameState.isPaused) {
            e.preventDefault();
        }

        if (!isSwiping || !gameState.isPlaying || gameState.isPaused) return;

        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        const minSwipe = 25;

        if (Math.abs(dx) > minSwipe || Math.abs(dy) > minSwipe) {
            if (Math.abs(dx) > Math.abs(dy)) {
                handleInput(dx > 0 ? 1 : -1, 0);
            } else {
                handleInput(0, dy > 0 ? 1 : -1);
            }
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }
    }, { passive: false });

    document.addEventListener('touchend', () => {
        isSwiping = false;
    }, { passive: true });

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
