// ==========================================
// 🐍 Змейка - Telegram Mini App
// ==========================================

// Инициализация Telegram Web App
const tg = window.Telegram?.WebApp;

// Настройки игры
const GRID_SIZE = 20; // Размер сетки
const INITIAL_SPEED = 150; // Начальная скорость (мс)
const SPEED_INCREASE = 5; // Ускорение за каждое яблоко

// Элементы DOM
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('best-score');
const finalScoreElement = document.getElementById('final-score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

// Кнопки управления
const btnUp = document.getElementById('btn-up');
const btnDown = document.getElementById('btn-down');
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');

// Состояние игры
let snake = [];
let food = { x: 0, y: 0 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let bestScore = 0;
let gameLoop = null;
let gameSpeed = INITIAL_SPEED;
let cellSize = 0;
let isPlaying = false;

// ==========================================
// Инициализация
// ==========================================

function init() {
    // Настройка Telegram Web App
    if (tg) {
        tg.ready();
        tg.expand();

        // Применяем тему Telegram
        if (tg.themeParams) {
            document.documentElement.style.setProperty('--bg-color', tg.themeParams.bg_color || '#1a1a2e');
            document.documentElement.style.setProperty('--text-color', tg.themeParams.text_color || '#e94560');
        }
    }

    // Загружаем лучший результат
    bestScore = parseInt(localStorage.getItem('snakeBestScore')) || 0;
    bestScoreElement.textContent = bestScore;

    // Настройка размеров canvas
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Привязка событий
    setupEventListeners();

    // Отрисовка начального экрана
    drawEmptyBoard();
}

function resizeCanvas() {
    const container = document.getElementById('game-container');
    const size = Math.min(container.clientWidth, container.clientHeight);
    canvas.width = size;
    canvas.height = size;
    cellSize = size / GRID_SIZE;

    if (!isPlaying) {
        drawEmptyBoard();
    }
}

function drawEmptyBoard() {
    // Фон
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Сетка
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
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

// ==========================================
// Управление игрой
// ==========================================

function startGame() {
    // Скрываем экраны
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');

    // Сброс состояния
    snake = [
        { x: Math.floor(GRID_SIZE / 2), y: Math.floor(GRID_SIZE / 2) }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    gameSpeed = INITIAL_SPEED;
    scoreElement.textContent = '0';
    isPlaying = true;

    // Создаём еду
    spawnFood();

    // Запускаем игровой цикл
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(gameStep, gameSpeed);

    // Вибрация при старте
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

function gameStep() {
    // Применяем следующее направление
    direction = { ...nextDirection };

    // Вычисляем новую позицию головы
    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;

    // Проверка столкновения со стенами
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        gameOver();
        return;
    }

    // Проверка столкновения с собой
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    // Добавляем новую голову
    snake.unshift(head);

    // Проверка еды
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = score;
        spawnFood();

        // Ускоряем игру
        if (gameSpeed > 50) {
            gameSpeed -= SPEED_INCREASE;
            clearInterval(gameLoop);
            gameLoop = setInterval(gameStep, gameSpeed);
        }

        // Вибрация при сборе еды
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
    } else {
        // Удаляем хвост, если не съели еду
        snake.pop();
    }

    // Отрисовка
    draw();
}

function gameOver() {
    isPlaying = false;
    clearInterval(gameLoop);
    gameLoop = null;

    // Обновляем лучший результат
    if (score > bestScore) {
        bestScore = score;
        bestScoreElement.textContent = bestScore;
        localStorage.setItem('snakeBestScore', bestScore);
    }

    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');

    // Вибрация при проигрыше
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('error');
    }
}

function spawnFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));

    food = newFood;
}

// ==========================================
// Отрисовка
// ==========================================

function draw() {
    // Очистка и фон
    drawEmptyBoard();

    // Рисуем еду (яблоко)
    drawFood();

    // Рисуем змейку
    drawSnake();
}

function drawSnake() {
    snake.forEach((segment, index) => {
        const x = segment.x * cellSize;
        const y = segment.y * cellSize;
        const padding = 2;
        const size = cellSize - padding * 2;
        const radius = size / 4;

        // Цвет: голова темнее
        if (index === 0) {
            ctx.fillStyle = '#00cc6a';
        } else {
            // Градиент от головы к хвосту
            const opacity = 1 - (index / snake.length) * 0.4;
            ctx.fillStyle = `rgba(0, 255, 136, ${opacity})`;
        }

        // Рисуем скруглённый прямоугольник
        ctx.beginPath();
        ctx.roundRect(x + padding, y + padding, size, size, radius);
        ctx.fill();

        // Глаза на голове
        if (index === 0) {
            ctx.fillStyle = 'white';
            const eyeSize = cellSize / 6;
            const eyeOffset = cellSize / 4;

            // Позиция глаз зависит от направления
            let eye1x, eye1y, eye2x, eye2y;

            if (direction.x === 1) { // Вправо
                eye1x = x + cellSize * 0.65;
                eye1y = y + cellSize * 0.3;
                eye2x = x + cellSize * 0.65;
                eye2y = y + cellSize * 0.6;
            } else if (direction.x === -1) { // Влево
                eye1x = x + cellSize * 0.25;
                eye1y = y + cellSize * 0.3;
                eye2x = x + cellSize * 0.25;
                eye2y = y + cellSize * 0.6;
            } else if (direction.y === -1) { // Вверх
                eye1x = x + cellSize * 0.3;
                eye1y = y + cellSize * 0.25;
                eye2x = x + cellSize * 0.6;
                eye2y = y + cellSize * 0.25;
            } else { // Вниз
                eye1x = x + cellSize * 0.3;
                eye1y = y + cellSize * 0.65;
                eye2x = x + cellSize * 0.6;
                eye2y = y + cellSize * 0.65;
            }

            ctx.beginPath();
            ctx.arc(eye1x, eye1y, eyeSize, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(eye2x, eye2y, eyeSize, 0, Math.PI * 2);
            ctx.fill();

            // Зрачки
            ctx.fillStyle = '#1a1a2e';
            ctx.beginPath();
            ctx.arc(eye1x, eye1y, eyeSize / 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(eye2x, eye2y, eyeSize / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function drawFood() {
    const x = food.x * cellSize + cellSize / 2;
    const y = food.y * cellSize + cellSize / 2;
    const radius = cellSize / 2 - 4;

    // Яблоко
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Блик
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(x - radius / 3, y - radius / 3, radius / 3, 0, Math.PI * 2);
    ctx.fill();

    // Листик
    ctx.fillStyle = '#00cc6a';
    ctx.beginPath();
    ctx.ellipse(x + 2, y - radius - 2, 4, 6, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
}

// ==========================================
// Обработка ввода
// ==========================================

function setupEventListeners() {
    // Кнопки старта
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);

    // Клавиатура
    document.addEventListener('keydown', handleKeyDown);

    // Мобильные кнопки
    btnUp.addEventListener('click', () => setDirection(0, -1));
    btnDown.addEventListener('click', () => setDirection(0, 1));
    btnLeft.addEventListener('click', () => setDirection(-1, 0));
    btnRight.addEventListener('click', () => setDirection(1, 0));

    // Предотвращаем zoom на двойное нажатие
    document.addEventListener('dblclick', (e) => e.preventDefault());

    // Свайпы
    setupSwipeControls();
}

function handleKeyDown(e) {
    // Пробел или Enter для старта
    if ((e.key === ' ' || e.key === 'Enter') && !isPlaying) {
        if (!startScreen.classList.contains('hidden') || !gameOverScreen.classList.contains('hidden')) {
            startGame();
            return;
        }
    }

    if (!isPlaying) return;

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
    if (!isPlaying) return;

    // Нельзя развернуться на 180 градусов
    if (direction.x === -x && direction.y === -y) return;

    // Нельзя двигаться в том же направлении
    if (direction.x === x && direction.y === y) return;

    nextDirection = { x, y };

    // Лёгкая вибрация при повороте
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.selectionChanged();
    }
}

function setupSwipeControls() {
    let touchStartX = 0;
    let touchStartY = 0;
    const minSwipeDistance = 30;

    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    canvas.addEventListener('touchend', (e) => {
        if (!isPlaying) return;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Горизонтальный свайп
            if (Math.abs(diffX) > minSwipeDistance) {
                setDirection(diffX > 0 ? 1 : -1, 0);
            }
        } else {
            // Вертикальный свайп
            if (Math.abs(diffY) > minSwipeDistance) {
                setDirection(0, diffY > 0 ? 1 : -1);
            }
        }
    }, { passive: true });
}

// ==========================================
// Запуск
// ==========================================

// Ждём загрузки страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
