// ==========================================
// 🐉 УРОБОРОС - Рендеринг
// ==========================================

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

        const grad = ctx.createLinearGradient(x, y, x + size, y + size);
        grad.addColorStop(0, '#5a5a7a');
        grad.addColorStop(0.5, '#3a3a5a');
        grad.addColorStop(1, '#2a2a4a');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x + padding, y + padding, size, size, 3);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.roundRect(x + padding + 2, y + padding + 2, size - 4, size / 3, 2);
        ctx.fill();

        ctx.strokeStyle = '#6a6a9a';
        ctx.lineWidth = 1;
        ctx.stroke();
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

function drawSnake(ctx, cellSize) {
    const snake = gameState.snake;
    const len = snake.length;
    if (len === 0) return;

    const dir = gameState.direction;

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

    // Исправленная функция: используем distanceFromTail вместо segmentIndex
    function getBulgeScale(segIndex) {
        let scale = 1;
        for (const bulge of gameState.foodBulges) {
            // Проверяем что bulge находится в пределах тела
            if (bulge.distanceFromTail >= 0 && bulge.distanceFromTail < len) {
                const bulgeSegIndex = len - 1 - Math.floor(bulge.distanceFromTail);
                if (bulgeSegIndex === segIndex) {
                    const bulgeAmount = Math.sin(bulge.progress * Math.PI) * 0.35;
                    scale = Math.max(scale, 1 + bulgeAmount);
                }
            }
        }
        return scale;
    }

    function getColor(progress) {
        const r = Math.floor(255 - progress * 45);
        const g = Math.floor(195 - progress * 55);
        const b = Math.floor(45 - progress * 25);
        return { r, g, b };
    }

    function isTurn(i) {
        if (i <= 0 || i >= len - 1) return false;
        const prev = snake[i + 1];
        const curr = snake[i];
        const next = snake[i - 1];
        if (Math.abs(prev.x - curr.x) > 1 || Math.abs(prev.y - curr.y) > 1) return false;
        if (Math.abs(curr.x - next.x) > 1 || Math.abs(curr.y - next.y) > 1) return false;
        const dx1 = curr.x - prev.x;
        const dy1 = curr.y - prev.y;
        const dx2 = next.x - curr.x;
        const dy2 = next.y - curr.y;
        return dx1 !== dx2 || dy1 !== dy2;
    }

    // Тень
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
        const curr = getCoords(snake[i]);
        const next = getCoords(snake[i - 1]);
        const progress = i / Math.max(len - 1, 1);
        const bulge1 = getBulgeScale(i);
        const bulge2 = getBulgeScale(i - 1);
        const w1 = getWidth(i) * bulge1;
        const w2 = getWidth(i - 1) * bulge2;
        const col = getColor(progress);

        if (Math.abs(snake[i].x - snake[i - 1].x) > 1 || Math.abs(snake[i].y - snake[i - 1].y) > 1) continue;

        const angle = Math.atan2(next.y - curr.y, next.x - curr.x);
        const dist = Math.hypot(next.x - curr.x, next.y - curr.y);

        ctx.save();
        ctx.translate(curr.x, curr.y);
        ctx.rotate(angle);

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
            jointGrad.addColorStop(1, `rgb(${col.r - 20}, ${col.g - 20}, ${col.b - 10})`);

            ctx.fillStyle = jointGrad;
            ctx.beginPath();
            ctx.arc(seg.x, seg.y, w / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Чешуйки
    for (let i = len - 1; i >= 2; i--) {
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
        scaleGrad.addColorStop(1, `rgba(${col.r - 30}, ${col.g - 30}, ${col.b - 15}, 0.7)`);

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

    // Визуализация еды внутри тела (исправленная)
    for (const bulge of gameState.foodBulges) {
        if (bulge.distanceFromTail >= 0 && bulge.distanceFromTail < len - 1) {
            const segIdx = len - 1 - Math.floor(bulge.distanceFromTail);
            const nextIdx = segIdx + 1;

            if (segIdx >= 0 && nextIdx < len) {
                const curr = getCoords(snake[segIdx]);
                const next = getCoords(snake[nextIdx]);
                const localProgress = bulge.distanceFromTail % 1;

                const x = curr.x + (next.x - curr.x) * localProgress;
                const y = curr.y + (next.y - curr.y) * localProgress;
                const w = getWidth(segIdx) * 0.5;

                const foodGrad = ctx.createRadialGradient(x, y, 0, x, y, w);
                foodGrad.addColorStop(0, 'rgba(255, 220, 100, 0.7)');
                foodGrad.addColorStop(0.5, 'rgba(255, 180, 50, 0.4)');
                foodGrad.addColorStop(1, 'rgba(255, 150, 0, 0)');

                ctx.fillStyle = foodGrad;
                ctx.beginPath();
                ctx.arc(x, y, w, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Хвост (с проверкой на телепортацию)
    if (len > 1) {
        const tailSeg = snake[len - 1];
        const prevSeg = snake[len - 2];

        // Пропускаем рендер хвоста при телепортации (разница в координатах > 1)
        const isTeleporting = Math.abs(tailSeg.x - prevSeg.x) > 1 || Math.abs(tailSeg.y - prevSeg.y) > 1;

        if (!isTeleporting) {
            const tail = getCoords(tailSeg);
            const prev = getCoords(prevSeg);
            const tailW = getWidth(len - 1) * 0.7;
            const angle = Math.atan2(tail.y - prev.y, tail.x - prev.x);

            ctx.save();
            ctx.translate(tail.x, tail.y);
            ctx.rotate(angle);

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
    }

    // Голова
    drawSnakeHead(ctx, cellSize, snake, dir);
}

function drawSnakeHead(ctx, cellSize, snake, dir) {
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

    const isEating = gameState.isEating;
    const mouthOpen = isEating ? Math.sin((12 - gameState.eatingTimer) / 12 * Math.PI) * 0.3 : 0;

    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(angle);

    // Тень
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
        neckGrad.addColorStop(0, '#ffe066');
        neckGrad.addColorStop(0.5, '#ffd700');
        neckGrad.addColorStop(1, '#cc9900');
        ctx.fillStyle = neckGrad;
        ctx.beginPath();
        ctx.arc(-headLen * 0.35, 0, headW * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }

    // Голова с открытым ртом
    if (isEating && mouthOpen > 0.1) {
        const jawOffset = headW * mouthOpen;

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

        ctx.fillStyle = '#4a1a1a';
        ctx.beginPath();
        ctx.ellipse(headLen * 0.3, 0, headLen * 0.2, jawOffset, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#cc4444';
        ctx.beginPath();
        ctx.ellipse(headLen * 0.25, 0, headLen * 0.1, jawOffset * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
    } else {
        const headGrad = ctx.createLinearGradient(-headLen * 0.4, 0, headLen * 0.6, 0);
        headGrad.addColorStop(0, '#ffd700');
        headGrad.addColorStop(0.3, '#ffdb4d');
        headGrad.addColorStop(0.6, '#ffc800');
        headGrad.addColorStop(1, '#daa520');

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
    ctx.ellipse(0, -headW * 0.15 - (isEating ? mouthOpen * headW * 0.3 : 0), headLen * 0.25, headW * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Чешуйки
    ctx.fillStyle = 'rgba(218, 165, 32, 0.4)';
    ctx.beginPath();
    ctx.ellipse(-headLen * 0.1, -headW * 0.1 - (isEating ? mouthOpen * headW * 0.2 : 0), headLen * 0.12, headLen * 0.08, -0.2, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headLen * 0.05, -headW * 0.08 - (isEating ? mouthOpen * headW * 0.2 : 0), headLen * 0.1, headLen * 0.06, -0.2, Math.PI, 0);
    ctx.fill();

    // Глаза
    const eyeX = headLen * 0.05;
    const eyeY = headW * 0.22;
    const eyeR = headW * 0.18;
    const eyeOffset = isEating ? mouthOpen * headW * 0.3 : 0;

    [eyeY + eyeOffset, -eyeY - eyeOffset].forEach(y => {
        ctx.fillStyle = '#4a3800';
        ctx.beginPath();
        ctx.ellipse(eyeX, y, eyeR + 1, eyeR * 0.85 + 1, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fffef5';
        ctx.beginPath();
        ctx.ellipse(eyeX, y, eyeR, eyeR * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();

        const pupilGrad = ctx.createRadialGradient(eyeX, y, 0, eyeX, y, eyeR * 0.5);
        pupilGrad.addColorStop(0, '#ff6600');
        pupilGrad.addColorStop(0.5, '#cc3300');
        pupilGrad.addColorStop(1, '#660000');
        ctx.fillStyle = pupilGrad;
        ctx.beginPath();
        ctx.ellipse(eyeX + 1, y, eyeR * 0.25, eyeR * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(eyeX - eyeR * 0.25, y - eyeR * 0.2, eyeR * 0.2, 0, Math.PI * 2);
        ctx.fill();
    });

    // Ноздри
    ctx.fillStyle = '#3d2b00';
    ctx.beginPath();
    ctx.ellipse(headLen * 0.4, -headW * 0.08 - eyeOffset * 0.5, 1.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headLen * 0.4, headW * 0.08 + eyeOffset * 0.5, 1.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}
