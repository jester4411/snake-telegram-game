// ==========================================
// 🐉 УРОБОРОС - Рендеринг v2.8
// ==========================================

// Звёзды для фона (генерируются один раз)
let stars = [];
function initStars(count = 50) {
    stars = [];
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random(),
            y: Math.random(),
            size: Math.random() * 1.5 + 0.5,
            twinkle: Math.random() * Math.PI * 2
        });
    }
}
initStars();

function draw() {
    const ctx = elements.ctx;
    const canvas = elements.canvas;
    const cellSize = canvas.width / GRID_SIZE;

    drawBackground(ctx, canvas);
    drawObstacles(ctx, cellSize);
    drawFood(ctx, cellSize);
    drawSnake(ctx, cellSize);

    // Подсказка "Свайп для старта"
    if (gameState.waitingForInput) {
        drawStartHint(ctx, canvas);
    }
}

function drawStartHint(ctx, canvas) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 16px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Свайп или стрелка для старта', canvas.width / 2, canvas.height / 2);
    ctx.font = '24px -apple-system, sans-serif';
    ctx.fillText('👆', canvas.width / 2, canvas.height / 2 + 30);
}

function drawBackground(ctx, canvas) {
    const bgGrad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
    );
    bgGrad.addColorStop(0, '#1e1e3f');
    bgGrad.addColorStop(1, '#0d0d1a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Мерцающие звёзды
    const time = gameState.time || 0;
    stars.forEach(star => {
        const twinkle = 0.3 + Math.sin(time * 2 + star.twinkle) * 0.4;
        ctx.fillStyle = `rgba(255, 255, 200, ${twinkle})`;
        ctx.beginPath();
        ctx.arc(
            star.x * canvas.width,
            star.y * canvas.height,
            star.size,
            0, Math.PI * 2
        );
        ctx.fill();
    });

    // Сетка
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
        const cx = x + cellSize / 2;
        const cy = y + cellSize / 2;

        // Тёмное свечение вокруг
        const shadowGrad = ctx.createRadialGradient(cx, cy, size * 0.3, cx, cy, size * 0.8);
        shadowGrad.addColorStop(0, 'rgba(30, 30, 50, 0.8)');
        shadowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Основной блок - кристаллический эффект
        const grad = ctx.createLinearGradient(x, y, x + size, y + size);
        grad.addColorStop(0, '#6a6a8a');
        grad.addColorStop(0.3, '#4a4a6a');
        grad.addColorStop(0.7, '#3a3a5a');
        grad.addColorStop(1, '#2a2a4a');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x + padding, y + padding, size, size, 4);
        ctx.fill();

        // Верхний блик
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.roundRect(x + padding + 2, y + padding + 2, size - 4, size / 3, 2);
        ctx.fill();

        // Нижняя тень
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.roundRect(x + padding + 2, y + padding + size * 0.65, size - 4, size / 3 - 2, 2);
        ctx.fill();

        // Рамка
        ctx.strokeStyle = '#7a7a9a';
        ctx.lineWidth = 1;
        ctx.stroke();
    });
}

// Рисуем мини-превью уровня на кнопке
function drawLevelPreview(canvas, levelIndex) {
    const ctx = canvas.getContext('2d');
    const level = LEVELS[levelIndex];
    if (!level) return;

    const size = canvas.width;
    const cellSize = size / GRID_SIZE;

    // Фон
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, size, size);

    // Препятствия
    ctx.fillStyle = '#6a6a9a';
    level.obstacles.forEach(obs => {
        ctx.fillRect(obs.x * cellSize, obs.y * cellSize, cellSize - 0.5, cellSize - 0.5);
    });
}

function drawFood(ctx, cellSize) {
    const difficulty = gameState.difficulty || DIFFICULTY.NORMAL;

    if (difficulty === DIFFICULTY.IMMORTAL) {
        drawFoodFlower(ctx, cellSize);
    } else if (difficulty === DIFFICULTY.HARDCORE) {
        drawFoodRuby(ctx, cellSize);
    } else {
        drawFoodGolden(ctx, cellSize);
    }
}

// Зеленые цветы для режима Бессмертие
function drawFoodFlower(ctx, cellSize) {
    const x = gameState.food.x * cellSize + cellSize / 2;
    const y = gameState.food.y * cellSize + cellSize / 2;
    const baseRadius = cellSize / 2 - 3;

    const brightness = gameState.foodStage / FOOD_STAGES;
    const pulseScale = 1 + Math.sin(gameState.time * 4) * 0.1;
    const radius = baseRadius * pulseScale * (0.7 + brightness * 0.3);

    // Зеленое свечение
    const glowRadius = radius * (2 + brightness);
    const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
    const glowAlpha = 0.4 * brightness;
    glow.addColorStop(0, `rgba(100, 255, 100, ${glowAlpha})`);
    glow.addColorStop(0.5, `rgba(50, 200, 50, ${glowAlpha * 0.5})`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Лепестки цветка
    const petalCount = 5;
    const petalLen = radius * 0.9;
    const petalWidth = radius * 0.5;
    const coreAlpha = 0.5 + brightness * 0.5;

    for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2 + gameState.time * 0.5;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        const petalGrad = ctx.createLinearGradient(0, 0, petalLen, 0);
        petalGrad.addColorStop(0, `rgba(100, 220, 100, ${coreAlpha})`);
        petalGrad.addColorStop(0.5, `rgba(50, 180, 50, ${coreAlpha})`);
        petalGrad.addColorStop(1, `rgba(30, 150, 30, ${coreAlpha * 0.6})`);

        ctx.fillStyle = petalGrad;
        ctx.beginPath();
        ctx.ellipse(petalLen * 0.5, 0, petalLen * 0.5, petalWidth * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // Центр цветка
    const centerGrad = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.4);
    centerGrad.addColorStop(0, `rgba(255, 255, 150, ${coreAlpha})`);
    centerGrad.addColorStop(0.5, `rgba(255, 220, 50, ${coreAlpha})`);
    centerGrad.addColorStop(1, `rgba(200, 180, 0, ${coreAlpha * 0.8})`);

    ctx.fillStyle = centerGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Блик
    ctx.fillStyle = `rgba(255, 255, 255, ${0.5 * brightness})`;
    ctx.beginPath();
    ctx.arc(x - radius * 0.1, y - radius * 0.1, radius * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Таймер
    if (brightness < 1) {
        ctx.strokeStyle = `rgba(100, 255, 100, ${1 - brightness})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, radius + 4, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * brightness));
        ctx.stroke();
    }
}

// Красные рубины для режима Хардкор
function drawFoodRuby(ctx, cellSize) {
    const x = gameState.food.x * cellSize + cellSize / 2;
    const y = gameState.food.y * cellSize + cellSize / 2;
    const baseRadius = cellSize / 2 - 3;

    const brightness = gameState.foodStage / FOOD_STAGES;
    const pulseScale = 1 + Math.sin(gameState.time * 4) * 0.1;
    const radius = baseRadius * pulseScale * (0.7 + brightness * 0.3);

    // Красное свечение
    const glowRadius = radius * (2 + brightness);
    const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
    const glowAlpha = 0.5 * brightness;
    glow.addColorStop(0, `rgba(255, 50, 50, ${glowAlpha})`);
    glow.addColorStop(0.5, `rgba(200, 0, 50, ${glowAlpha * 0.5})`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Рубин (ромб/кристалл)
    const coreAlpha = 0.6 + brightness * 0.4;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(gameState.time * 0.3);

    // Основная форма рубина
    const rubyGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
    rubyGrad.addColorStop(0, `rgba(255, 100, 100, ${coreAlpha})`);
    rubyGrad.addColorStop(0.3, `rgba(220, 30, 50, ${coreAlpha})`);
    rubyGrad.addColorStop(0.7, `rgba(180, 0, 30, ${coreAlpha})`);
    rubyGrad.addColorStop(1, `rgba(100, 0, 20, ${coreAlpha * 0.8})`);

    ctx.fillStyle = rubyGrad;
    ctx.beginPath();
    ctx.moveTo(0, -radius);
    ctx.lineTo(radius * 0.7, 0);
    ctx.lineTo(0, radius);
    ctx.lineTo(-radius * 0.7, 0);
    ctx.closePath();
    ctx.fill();

    // Грани кристалла
    ctx.fillStyle = `rgba(255, 150, 150, ${coreAlpha * 0.4})`;
    ctx.beginPath();
    ctx.moveTo(0, -radius);
    ctx.lineTo(radius * 0.7, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    // Блик
    ctx.fillStyle = `rgba(255, 255, 255, ${0.7 * brightness})`;
    ctx.beginPath();
    ctx.ellipse(-radius * 0.15, -radius * 0.4, radius * 0.2, radius * 0.15, -0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Таймер
    if (brightness < 1) {
        ctx.strokeStyle = `rgba(255, 50, 50, ${1 - brightness})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, radius + 4, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * brightness));
        ctx.stroke();
    }
}

// Золотой шар для обычного режима
function drawFoodGolden(ctx, cellSize) {
    const x = gameState.food.x * cellSize + cellSize / 2;
    const y = gameState.food.y * cellSize + cellSize / 2;
    const baseRadius = cellSize / 2 - 3;

    const brightness = gameState.foodStage / FOOD_STAGES;
    const pulseScale = 1 + Math.sin(gameState.time * 4) * 0.1;
    const radius = baseRadius * pulseScale * (0.7 + brightness * 0.3);

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

    const highlightAlpha = 0.6 * brightness;
    ctx.fillStyle = `rgba(255, 255, 255, ${highlightAlpha})`;
    ctx.beginPath();
    ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    if (brightness < 1) {
        ctx.strokeStyle = `rgba(255, 100, 100, ${1 - brightness})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, radius + 4, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * brightness));
        ctx.stroke();
    }
}

// Получение цветовой схемы змейки по сложности
function getSnakeColors() {
    const difficulty = gameState.difficulty || DIFFICULTY.NORMAL;

    if (difficulty === DIFFICULTY.IMMORTAL) {
        // Зеленая змейка
        return {
            headLight: '#66ff66',
            headMid: '#44dd44',
            headDark: '#22aa22',
            bodyBase: { r: 80, g: 200, b: 80 },
            tailLight: '#55cc55',
            tailMid: '#44aa44',
            tailDark: '#338833',
            eyePupil: ['#22aa22', '#116611', '#004400'],
            neckLight: '#88ff88',
            neckMid: '#66dd66',
            neckDark: '#44aa44'
        };
    } else if (difficulty === DIFFICULTY.HARDCORE) {
        // Красная змейка
        return {
            headLight: '#ff6666',
            headMid: '#dd4444',
            headDark: '#aa2222',
            bodyBase: { r: 200, g: 80, b: 80 },
            tailLight: '#cc5555',
            tailMid: '#aa4444',
            tailDark: '#883333',
            eyePupil: ['#ffcc00', '#cc9900', '#996600'],
            neckLight: '#ff8888',
            neckMid: '#dd6666',
            neckDark: '#aa4444'
        };
    } else {
        // Золотая змейка (по умолчанию)
        return {
            headLight: '#ffe066',
            headMid: '#ffd700',
            headDark: '#cc9900',
            bodyBase: { r: 255, g: 195, b: 45 },
            tailLight: '#c9941a',
            tailMid: '#a67c15',
            tailDark: '#8b6914',
            eyePupil: ['#ff6600', '#cc3300', '#660000'],
            neckLight: '#ffe066',
            neckMid: '#ffd700',
            neckDark: '#cc9900'
        };
    }
}

function drawSnake(ctx, cellSize) {
    const snake = gameState.snake;
    const len = snake.length;
    if (len === 0) return;

    const dir = gameState.direction;
    const colors = getSnakeColors();

    function getCoords(seg) {
        return {
            x: seg.x * cellSize + cellSize / 2,
            y: seg.y * cellSize + cellSize / 2
        };
    }

    function getWidth(i) {
        const progress = i / Math.max(len - 1, 1);
        return cellSize * 0.8 * (1 - progress * 0.35);
    }

    function getBulgeScale(segIndex) {
        let scale = 1;
        for (const bulge of gameState.foodBulges) {
            if (bulge.distanceFromTail >= 0 && bulge.distanceFromTail < len) {
                const bulgeSegIndex = len - 1 - Math.floor(bulge.distanceFromTail);
                // Проверяем текущий и соседние сегменты для плавности
                const dist = Math.abs(bulgeSegIndex - segIndex);
                if (dist <= 1) {
                    // Более выраженная выпуклость
                    const bulgeAmount = Math.sin(bulge.progress * Math.PI) * 0.5 * (dist === 0 ? 1 : 0.5);
                    scale = Math.max(scale, 1 + bulgeAmount);
                }
            }
        }
        return scale;
    }

    // Цвет тела с учётом режима
    function getColor(progress) {
        const base = colors.bodyBase;
        const r = Math.floor(base.r - progress * 45);
        const g = Math.floor(base.g - progress * 55);
        const b = Math.floor(base.b - progress * 25);
        return { r: Math.max(0, r), g: Math.max(0, g), b: Math.max(0, b) };
    }

    // Проверка телепортации между двумя сегментами
    function isTeleport(i, j) {
        return Math.abs(snake[i].x - snake[j].x) > 1 || Math.abs(snake[i].y - snake[j].y) > 1;
    }

    function isTurn(i) {
        if (i <= 0 || i >= len - 1) return false;
        if (isTeleport(i, i + 1) || isTeleport(i, i - 1)) return false;
        const prev = snake[i + 1];
        const curr = snake[i];
        const next = snake[i - 1];
        const dx1 = curr.x - prev.x;
        const dy1 = curr.y - prev.y;
        const dx2 = next.x - curr.x;
        const dy2 = next.y - curr.y;
        return dx1 !== dx2 || dy1 !== dy2;
    }

    // Находим реальный конец змейки (последний сегмент без телепортации)
    function findRealTailIndex() {
        for (let i = len - 1; i >= 1; i--) {
            if (!isTeleport(i, i - 1)) {
                return i;
            }
        }
        return len - 1;
    }

    const realTailIdx = findRealTailIndex();

    // Тень для всех сегментов (обе части змейки видны при телепортации)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (let i = len - 1; i >= 0; i--) {
        const seg = getCoords(snake[i]);
        const w = getWidth(i) * getBulgeScale(i);
        ctx.beginPath();
        ctx.ellipse(seg.x + 2, seg.y + 3, w / 2, w / 2 * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Тело
    for (let i = len - 1; i >= 1; i--) {
        // Пропускаем телепортацию
        if (isTeleport(i, i - 1)) continue;

        const curr = getCoords(snake[i]);
        const next = getCoords(snake[i - 1]);
        const progress = i / Math.max(len - 1, 1);
        const bulge1 = getBulgeScale(i);
        const bulge2 = getBulgeScale(i - 1);
        const w1 = getWidth(i) * bulge1;
        const w2 = getWidth(i - 1) * bulge2;
        const col = getColor(progress);

        const angle = Math.atan2(next.y - curr.y, next.x - curr.x);
        const dist = Math.hypot(next.x - curr.x, next.y - curr.y);

        ctx.save();
        ctx.translate(curr.x, curr.y);
        ctx.rotate(angle);

        const grad = ctx.createLinearGradient(0, -w1 / 2, 0, w1 / 2);
        grad.addColorStop(0, `rgb(${col.r + 35}, ${col.g + 30}, ${col.b + 25})`);
        grad.addColorStop(0.25, `rgb(${col.r}, ${col.g}, ${col.b})`);
        grad.addColorStop(0.75, `rgb(${col.r}, ${col.g}, ${col.b})`);
        grad.addColorStop(1, `rgb(${Math.max(0, col.r - 35)}, ${Math.max(0, col.g - 35)}, ${Math.max(0, col.b - 15)})`);

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

    // Сочленения на поворотах
    for (let i = len - 2; i >= 1; i--) {
        if (isTurn(i)) {
            const seg = getCoords(snake[i]);
            const progress = i / Math.max(len - 1, 1);
            const w = getWidth(i) * getBulgeScale(i);
            const col = getColor(progress);

            const jointGrad = ctx.createRadialGradient(seg.x, seg.y, 0, seg.x, seg.y, w / 2);
            jointGrad.addColorStop(0, `rgb(${col.r + 20}, ${col.g + 20}, ${col.b + 15})`);
            jointGrad.addColorStop(0.7, `rgb(${col.r}, ${col.g}, ${col.b})`);
            jointGrad.addColorStop(1, `rgb(${Math.max(0, col.r - 20)}, ${Math.max(0, col.g - 20)}, ${Math.max(0, col.b - 10)})`);

            ctx.fillStyle = jointGrad;
            ctx.beginPath();
            ctx.arc(seg.x, seg.y, w / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Расширения к стенам при телепортации + заглушки
    for (let i = len - 2; i >= 0; i--) {
        if (i > 0 && isTeleport(i, i - 1)) {
            const currSeg = snake[i];
            const nextSeg = snake[i - 1];
            const seg = getCoords(currSeg);
            const progress = i / Math.max(len - 1, 1);
            const w = getWidth(i) * getBulgeScale(i);
            const col = getColor(progress);

            // Определяем направление телепортации и рисуем расширение к стене
            let edgeX = seg.x, edgeY = seg.y;
            if (currSeg.x === 0 && nextSeg.x === GRID_SIZE - 1) {
                edgeX = 0; // Левая стена
            } else if (currSeg.x === GRID_SIZE - 1 && nextSeg.x === 0) {
                edgeX = cellSize * GRID_SIZE; // Правая стена
            }
            if (currSeg.y === 0 && nextSeg.y === GRID_SIZE - 1) {
                edgeY = 0; // Верхняя стена
            } else if (currSeg.y === GRID_SIZE - 1 && nextSeg.y === 0) {
                edgeY = cellSize * GRID_SIZE; // Нижняя стена
            }

            // Рисуем соединение от сегмента к стене
            if (edgeX !== seg.x || edgeY !== seg.y) {
                const grad = ctx.createLinearGradient(seg.x, seg.y, edgeX, edgeY);
                grad.addColorStop(0, `rgb(${col.r}, ${col.g}, ${col.b})`);
                grad.addColorStop(1, `rgb(${Math.max(0, col.r - 15)}, ${Math.max(0, col.g - 15)}, ${Math.max(0, col.b - 10)})`);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.moveTo(seg.x - w / 2 * (edgeY !== seg.y ? 1 : 0), seg.y - w / 2 * (edgeX !== seg.x ? 1 : 0));
                ctx.lineTo(seg.x + w / 2 * (edgeY !== seg.y ? 1 : 0), seg.y + w / 2 * (edgeX !== seg.x ? 1 : 0));
                ctx.lineTo(edgeX + w / 2 * (edgeY !== seg.y ? 1 : 0), edgeY + w / 2 * (edgeX !== seg.x ? 1 : 0));
                ctx.lineTo(edgeX - w / 2 * (edgeY !== seg.y ? 1 : 0), edgeY - w / 2 * (edgeX !== seg.x ? 1 : 0));
                ctx.closePath();
                ctx.fill();
            }

            // Заглушка на сегменте
            const capGrad = ctx.createRadialGradient(seg.x, seg.y, 0, seg.x, seg.y, w / 2);
            capGrad.addColorStop(0, `rgb(${col.r + 15}, ${col.g + 15}, ${col.b + 10})`);
            capGrad.addColorStop(0.6, `rgb(${col.r}, ${col.g}, ${col.b})`);
            capGrad.addColorStop(1, `rgb(${Math.max(0, col.r - 25)}, ${Math.max(0, col.g - 25)}, ${Math.max(0, col.b - 15)})`);
            ctx.fillStyle = capGrad;
            ctx.beginPath();
            ctx.arc(seg.x, seg.y, w / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Чешуйки (пропускаем сегменты на границе телепортации к голове)
    for (let i = len - 1; i >= 2; i--) {
        // Пропускаем если этот сегмент телепортируется к следующему (к голове)
        if (isTeleport(i, i - 1)) continue;
        // Также пропускаем если предыдущий сегмент (к хвосту) телепортирован
        if (i < len - 1 && isTeleport(i, i + 1)) continue;

        const seg = getCoords(snake[i]);
        const prev = i < len - 1 ? getCoords(snake[i + 1]) : seg;
        const progress = i / Math.max(len - 1, 1);
        const w = getWidth(i) * getBulgeScale(i);
        const col = getColor(progress);

        const angle = Math.atan2(seg.y - prev.y, seg.x - prev.x);

        ctx.save();
        ctx.translate(seg.x, seg.y);
        ctx.rotate(angle);

        const scaleW = w * 0.6;
        const scaleH = w * 0.35;

        const scaleGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, scaleW);
        scaleGrad.addColorStop(0, `rgba(${col.r + 50}, ${col.g + 45}, ${col.b + 40}, 0.9)`);
        scaleGrad.addColorStop(0.6, `rgba(${col.r}, ${col.g}, ${col.b}, 0.8)`);
        scaleGrad.addColorStop(1, `rgba(${Math.max(0, col.r - 30)}, ${Math.max(0, col.g - 30)}, ${Math.max(0, col.b - 15)}, 0.7)`);

        ctx.fillStyle = scaleGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, scaleW, scaleH, 0, Math.PI, 0);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 200, ${0.25 - progress * 0.15})`;
        ctx.beginPath();
        ctx.ellipse(-scaleW * 0.2, -scaleH * 0.3, scaleW * 0.25, scaleH * 0.3, -0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // Визуализация еды внутри тела (светящийся шар) - цвет зависит от сложности
    const difficulty = gameState.difficulty || DIFFICULTY.NORMAL;
    let bulgeColors;
    if (difficulty === DIFFICULTY.IMMORTAL) {
        // Зеленый для бессмертия
        bulgeColors = {
            outer1: 'rgba(100, 255, 150, 0.5)',
            outer2: 'rgba(50, 200, 100, 0.2)',
            core1: 'rgba(150, 255, 200, 0.9)',
            core2: 'rgba(80, 220, 120, 0.7)',
            core3: 'rgba(50, 180, 80, 0.3)'
        };
    } else if (difficulty === DIFFICULTY.HARDCORE) {
        // Красный для хардкора
        bulgeColors = {
            outer1: 'rgba(255, 100, 100, 0.5)',
            outer2: 'rgba(200, 50, 50, 0.2)',
            core1: 'rgba(255, 150, 150, 0.9)',
            core2: 'rgba(220, 80, 80, 0.7)',
            core3: 'rgba(180, 50, 50, 0.3)'
        };
    } else {
        // Золотой для обычного
        bulgeColors = {
            outer1: 'rgba(255, 200, 50, 0.5)',
            outer2: 'rgba(255, 150, 0, 0.2)',
            core1: 'rgba(255, 255, 150, 0.9)',
            core2: 'rgba(255, 220, 80, 0.7)',
            core3: 'rgba(255, 180, 50, 0.3)'
        };
    }

    for (const bulge of gameState.foodBulges) {
        if (bulge.distanceFromTail >= 0 && bulge.distanceFromTail < len) {
            const segIdx = len - 1 - Math.floor(bulge.distanceFromTail);
            const nextIdx = Math.min(segIdx + 1, len - 1);

            if (segIdx >= 0 && segIdx < len && !isTeleport(segIdx, nextIdx)) {
                const curr = getCoords(snake[segIdx]);
                const next = segIdx !== nextIdx ? getCoords(snake[nextIdx]) : curr;
                const localProgress = bulge.distanceFromTail % 1;

                const x = curr.x + (next.x - curr.x) * localProgress;
                const y = curr.y + (next.y - curr.y) * localProgress;
                const bulgeIntensity = Math.sin(bulge.progress * Math.PI);
                const w = getWidth(segIdx) * (0.4 + bulgeIntensity * 0.3);

                // Свечение вокруг еды
                const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, w * 2);
                outerGlow.addColorStop(0, bulgeColors.outer1);
                outerGlow.addColorStop(0.5, bulgeColors.outer2);
                outerGlow.addColorStop(1, 'transparent');
                ctx.fillStyle = outerGlow;
                ctx.beginPath();
                ctx.arc(x, y, w * 2, 0, Math.PI * 2);
                ctx.fill();

                // Ядро еды
                const foodGrad = ctx.createRadialGradient(x, y, 0, x, y, w);
                foodGrad.addColorStop(0, bulgeColors.core1);
                foodGrad.addColorStop(0.4, bulgeColors.core2);
                foodGrad.addColorStop(1, bulgeColors.core3);

                ctx.fillStyle = foodGrad;
                ctx.beginPath();
                ctx.arc(x, y, w, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Хвост - рисуем только на реальном конце змейки
    if (len > 1 && realTailIdx > 0 && !isTeleport(realTailIdx, realTailIdx - 1)) {
        const tailSeg = snake[realTailIdx];
        const prevSeg = snake[realTailIdx - 1];

        const tail = getCoords(tailSeg);
        const prev = getCoords(prevSeg);
        const tailW = getWidth(realTailIdx) * 0.7;
        const angle = Math.atan2(tail.y - prev.y, tail.x - prev.x);

        ctx.save();
        ctx.translate(tail.x, tail.y);
        ctx.rotate(angle);

        const tailGrad = ctx.createLinearGradient(-tailW, 0, tailW * 2, 0);
        tailGrad.addColorStop(0, colors.tailLight);
        tailGrad.addColorStop(0.5, colors.tailMid);
        tailGrad.addColorStop(1, colors.tailDark);

        ctx.fillStyle = tailGrad;
        ctx.beginPath();
        ctx.moveTo(-tailW, -tailW * 0.6);
        ctx.quadraticCurveTo(tailW, -tailW * 0.3, tailW * 1.5, 0);
        ctx.quadraticCurveTo(tailW, tailW * 0.3, -tailW, tailW * 0.6);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    // Свечение вокруг головы
    if (len > 0) {
        const head = getCoords(snake[0]);
        const glowRadius = cellSize * 1.5;
        const difficulty = gameState.difficulty || DIFFICULTY.NORMAL;
        let glowColor;

        if (difficulty === DIFFICULTY.IMMORTAL) {
            glowColor = 'rgba(100, 255, 100, 0.15)';
        } else if (difficulty === DIFFICULTY.HARDCORE) {
            glowColor = 'rgba(255, 100, 100, 0.15)';
        } else {
            glowColor = 'rgba(255, 215, 0, 0.15)';
        }

        const headGlow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, glowRadius);
        headGlow.addColorStop(0, glowColor);
        headGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = headGlow;
        ctx.beginPath();
        ctx.arc(head.x, head.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Голова
    drawSnakeHead(ctx, cellSize, snake, dir, colors, gameState.food);
}

function drawSnakeHead(ctx, cellSize, snake, dir, colors, food) {
    if (snake.length < 1) return;

    const head = snake[0];
    const hx = head.x * cellSize + cellSize / 2;
    const hy = head.y * cellSize + cellSize / 2;

    const headLen = cellSize * 1.3;
    const headW = cellSize * 0.9;

    let angle = 0;
    if (dir.x === 1) angle = 0;
    else if (dir.x === -1) angle = Math.PI;
    else if (dir.y === -1) angle = -Math.PI / 2;
    else angle = Math.PI / 2;

    // Вычисляем направление взгляда к еде
    let lookX = 0, lookY = 0;
    if (food) {
        const fx = food.x * cellSize + cellSize / 2;
        const fy = food.y * cellSize + cellSize / 2;
        const foodAngle = Math.atan2(fy - hy, fx - hx);
        const relativeAngle = foodAngle - angle; // Угол относительно направления головы
        // Ограничиваем смещение зрачка
        const maxOffset = 0.35;
        lookX = Math.cos(relativeAngle) * maxOffset;
        lookY = Math.sin(relativeAngle) * maxOffset;
    }

    const isEating = gameState.isEating;
    // Анимация: голова приподнимается спереди и заглатывает
    const eatProgress = isEating ? Math.sin((12 - gameState.eatingTimer) / 12 * Math.PI) : 0;
    const headLift = eatProgress * 0.25; // Подъём передней части (более выраженный)
    const headScale = 1 + eatProgress * 0.18; // Значительное увеличение при глотании

    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(angle);

    // Тень (смещается при поедании)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.moveTo(-headLen * 0.4, 0);
    ctx.lineTo(headLen * 0.3, -headW * 0.4);
    ctx.lineTo(headLen * 0.6, 0);
    ctx.lineTo(headLen * 0.3, headW * 0.4);
    ctx.closePath();
    ctx.fill();

    // Шея
    if (snake.length > 1) {
        const neckGrad = ctx.createLinearGradient(0, -headW * 0.4, 0, headW * 0.4);
        neckGrad.addColorStop(0, colors.neckLight);
        neckGrad.addColorStop(0.5, colors.neckMid);
        neckGrad.addColorStop(1, colors.neckDark);
        ctx.fillStyle = neckGrad;
        ctx.beginPath();
        ctx.arc(-headLen * 0.35, 0, headW * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }

    // Голова при поедании - приподнимается спереди
    if (isEating && eatProgress > 0.1) {
        // Поворачиваем голову вокруг задней части (приподнимаем морду)
        ctx.save();
        ctx.translate(-headLen * 0.2, 0);
        ctx.rotate(-headLift); // Отрицательный угол = морда вверх
        ctx.translate(headLen * 0.2, 0);
        ctx.scale(headScale, headScale);

        // Основная голова (приподнятая)
        const headGrad = ctx.createLinearGradient(-headLen * 0.4, 0, headLen * 0.6, 0);
        headGrad.addColorStop(0, colors.headMid);
        headGrad.addColorStop(0.3, colors.headLight);
        headGrad.addColorStop(0.6, colors.headMid);
        headGrad.addColorStop(1, colors.headDark);

        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.moveTo(-headLen * 0.35, 0);
        ctx.quadraticCurveTo(-headLen * 0.3, -headW * 0.45, headLen * 0.1, -headW * 0.4);
        ctx.quadraticCurveTo(headLen * 0.5, -headW * 0.2, headLen * 0.55, 0);
        ctx.quadraticCurveTo(headLen * 0.5, headW * 0.2, headLen * 0.1, headW * 0.4);
        ctx.quadraticCurveTo(-headLen * 0.3, headW * 0.45, -headLen * 0.35, 0);
        ctx.fill();

        // Открытый рот снизу (виден когда голова приподнята)
        const mouthOpen = eatProgress * headW * 0.45; // Широко раскрытый рот
        ctx.fillStyle = '#2a0a0a';
        ctx.beginPath();
        ctx.ellipse(headLen * 0.35, headW * 0.2, headLen * 0.2, mouthOpen, 0, 0, Math.PI * 2);
        ctx.fill();

        // Язык (более заметный)
        if (eatProgress > 0.2) {
            ctx.fillStyle = '#dd5555';
            ctx.beginPath();
            ctx.ellipse(headLen * 0.32, headW * 0.15, headLen * 0.12, mouthOpen * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    } else {
        const headGrad = ctx.createLinearGradient(-headLen * 0.4, 0, headLen * 0.6, 0);
        headGrad.addColorStop(0, colors.headMid);
        headGrad.addColorStop(0.3, colors.headLight);
        headGrad.addColorStop(0.6, colors.headMid);
        headGrad.addColorStop(1, colors.headDark);

        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.moveTo(-headLen * 0.35, 0);
        ctx.quadraticCurveTo(-headLen * 0.3, -headW * 0.45, headLen * 0.1, -headW * 0.4);
        ctx.quadraticCurveTo(headLen * 0.5, -headW * 0.2, headLen * 0.55, 0);
        ctx.quadraticCurveTo(headLen * 0.5, headW * 0.2, headLen * 0.1, headW * 0.4);
        ctx.quadraticCurveTo(-headLen * 0.3, headW * 0.45, -headLen * 0.35, 0);
        ctx.fill();
    }

    // Блик
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, -headW * 0.15, headLen * 0.25, headW * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Чешуйки на голове
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(-headLen * 0.1, -headW * 0.1, headLen * 0.12, headLen * 0.08, -0.2, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headLen * 0.05, -headW * 0.08, headLen * 0.1, headLen * 0.06, -0.2, Math.PI, 0);
    ctx.fill();

    // Глаза
    const eyeX = headLen * 0.05;
    const eyeY = headW * 0.22;
    const eyeR = headW * 0.18;

    // Смещение зрачка к еде (в локальных координатах глаза)
    const pupilOffsetX = lookX * eyeR * 0.6;
    const pupilOffsetY = lookY * eyeR * 0.5;

    [eyeY, -eyeY].forEach(y => {
        // Обводка глаза
        ctx.fillStyle = '#2a2a2a';
        ctx.beginPath();
        ctx.ellipse(eyeX, y, eyeR + 1, eyeR * 0.85 + 1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Белок глаза
        ctx.fillStyle = '#fffef5';
        ctx.beginPath();
        ctx.ellipse(eyeX, y, eyeR, eyeR * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();

        // Зрачок (смещается к еде) - оба глаза смотрят в одном направлении
        const pupilGrad = ctx.createRadialGradient(
            eyeX + pupilOffsetX, y + pupilOffsetY, 0,
            eyeX + pupilOffsetX, y + pupilOffsetY, eyeR * 0.5
        );
        pupilGrad.addColorStop(0, colors.eyePupil[0]);
        pupilGrad.addColorStop(0.5, colors.eyePupil[1]);
        pupilGrad.addColorStop(1, colors.eyePupil[2]);
        ctx.fillStyle = pupilGrad;
        ctx.beginPath();
        ctx.ellipse(eyeX + pupilOffsetX, y + pupilOffsetY, eyeR * 0.25, eyeR * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Блик на глазу (статичный, не следит за едой)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(eyeX - eyeR * 0.25, y - eyeR * 0.2, eyeR * 0.2, 0, Math.PI * 2);
        ctx.fill();
    });

    // Ноздри
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.ellipse(headLen * 0.4, -headW * 0.08, 1.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headLen * 0.4, headW * 0.08, 1.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}
