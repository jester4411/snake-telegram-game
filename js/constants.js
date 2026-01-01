// ==========================================
// 🐉 УРОБОРОС - Константы и уровни
// ==========================================

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREASE = 3;
const MIN_SPEED = 60;
const TOTAL_LEVELS = 25;
const INITIAL_SNAKE_LENGTH = 4; // Начальный размер змейки

// Настройки еды
const FOOD_LIFETIME = 8000;
const FOOD_STAGES = 5;
const FOOD_STAGE_TIME = FOOD_LIFETIME / FOOD_STAGES;

// Режимы сложности
const DIFFICULTY = {
    IMMORTAL: 'immortal',  // Бессмертие: сквозь стены и хвост, макс = клетки
    NORMAL: 'normal',      // Обычный: сквозь стены, смерть от хвоста
    HARDCORE: 'hardcore'   // Хардкор: смерть от стен и хвоста
};

// Уровни (25 штук)
const LEVELS = [
    // 1-5: Простые
    { obstacles: [], speed: 150, name: "Пробуждение" },
    {
        obstacles: [
            { x: 9, y: 9 }, { x: 10, y: 9 },
            { x: 9, y: 10 }, { x: 10, y: 10 }
        ],
        speed: 145, name: "Алтарь"
    },
    {
        obstacles: [
            { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 4, y: 5 },
            { x: 14, y: 4 }, { x: 15, y: 4 }, { x: 15, y: 5 },
            { x: 4, y: 14 }, { x: 4, y: 15 }, { x: 5, y: 15 },
            { x: 15, y: 14 }, { x: 14, y: 15 }, { x: 15, y: 15 }
        ],
        speed: 140, name: "Четыре стража"
    },
    {
        obstacles: [
            ...Array.from({ length: 14 }, (_, i) => ({ x: 3 + i, y: 6 })),
            ...Array.from({ length: 14 }, (_, i) => ({ x: 3 + i, y: 13 }))
        ],
        speed: 135, name: "Коридор"
    },
    {
        obstacles: [
            { x: 5, y: 5 }, { x: 5, y: 6 }, { x: 5, y: 7 },
            { x: 14, y: 5 }, { x: 14, y: 6 }, { x: 14, y: 7 },
            { x: 5, y: 12 }, { x: 5, y: 13 }, { x: 5, y: 14 },
            { x: 14, y: 12 }, { x: 14, y: 13 }, { x: 14, y: 14 },
            { x: 9, y: 8 }, { x: 10, y: 8 },
            { x: 9, y: 11 }, { x: 10, y: 11 }
        ],
        speed: 130, name: "Столбы"
    },
    // 6-10: Средние
    {
        obstacles: [
            ...Array.from({ length: 7 }, (_, i) => ({ x: 9, y: 1 + i })),
            ...Array.from({ length: 7 }, (_, i) => ({ x: 10, y: 1 + i })),
            ...Array.from({ length: 7 }, (_, i) => ({ x: 9, y: 12 + i })),
            ...Array.from({ length: 7 }, (_, i) => ({ x: 10, y: 12 + i }))
        ],
        speed: 125, name: "Врата"
    },
    {
        obstacles: [
            ...Array.from({ length: 12 }, (_, i) => ({ x: 4, y: 4 + i })),
            ...Array.from({ length: 8 }, (_, i) => ({ x: 5 + i, y: 15 })),
            ...Array.from({ length: 8 }, (_, i) => ({ x: 12, y: 8 + i })),
            ...Array.from({ length: 4 }, (_, i) => ({ x: 8 + i, y: 8 }))
        ],
        speed: 120, name: "Спираль"
    },
    {
        obstacles: [
            // Арена - угловые стены, центр открыт
            ...Array.from({ length: 5 }, (_, i) => ({ x: 3 + i, y: 3 })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 12 + i, y: 3 })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 3 + i, y: 16 })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 12 + i, y: 16 })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 3, y: 4 + i })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 3, y: 11 + i })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 16, y: 4 + i })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 16, y: 11 + i })),
            // Центральные столбы смещены
            { x: 9, y: 7 }, { x: 10, y: 7 },
            { x: 9, y: 12 }, { x: 10, y: 12 }
        ],
        speed: 115, name: "Арена"
    },
    {
        obstacles: [
            ...Array.from({ length: 6 }, (_, i) => ({ x: 2 + i, y: 2 + i })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 17 - i, y: 2 + i })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 2 + i, y: 17 - i })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 17 - i, y: 17 - i })),
            { x: 9, y: 7 }, { x: 10, y: 7 },
            { x: 9, y: 12 }, { x: 10, y: 12 },
            { x: 7, y: 9 }, { x: 7, y: 10 },
            { x: 12, y: 9 }, { x: 12, y: 10 }
        ],
        speed: 110, name: "Хаос"
    },
    {
        obstacles: [
            // Храм - центр открыт для спавна
            ...Array.from({ length: 6 }, (_, i) => ({ x: 1 + i, y: 2 })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 13 + i, y: 2 })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 1 + i, y: 17 })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 13 + i, y: 17 })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 2, y: 3 + i })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 2, y: 11 + i })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 17, y: 3 + i })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 17, y: 11 + i })),
            // Внутренние стены - не блокируют центр (10,10)
            ...Array.from({ length: 4 }, (_, i) => ({ x: 6 + i, y: 6 })),
            ...Array.from({ length: 4 }, (_, i) => ({ x: 10 + i, y: 6 })),
            ...Array.from({ length: 4 }, (_, i) => ({ x: 6 + i, y: 13 })),
            ...Array.from({ length: 4 }, (_, i) => ({ x: 10 + i, y: 13 })),
            { x: 6, y: 7 }, { x: 6, y: 8 },
            { x: 13, y: 11 }, { x: 13, y: 12 }
        ],
        speed: 105, name: "Храм Уробороса"
    },
    // 11-15: Сложные
    {
        obstacles: [
            // Верхняя стена с проходами
            ...Array.from({ length: 7 }, (_, i) => ({ x: 1 + i, y: 5 })),
            ...Array.from({ length: 7 }, (_, i) => ({ x: 12 + i, y: 5 })),
            // Нижняя стена с проходами
            ...Array.from({ length: 7 }, (_, i) => ({ x: 1 + i, y: 14 })),
            ...Array.from({ length: 7 }, (_, i) => ({ x: 12 + i, y: 14 })),
            // Центральный блок
            { x: 9, y: 9 }, { x: 10, y: 9 }, { x: 9, y: 10 }, { x: 10, y: 10 }
        ],
        speed: 100, name: "Тиски"
    },
    {
        obstacles: [
            // Верхняя стена с проходом посередине
            ...Array.from({ length: 4 }, (_, i) => ({ x: 5 + i, y: 5 })),
            ...Array.from({ length: 4 }, (_, i) => ({ x: 11 + i, y: 5 })),
            // Нижняя стена с проходом посередине
            ...Array.from({ length: 4 }, (_, i) => ({ x: 5 + i, y: 14 })),
            ...Array.from({ length: 4 }, (_, i) => ({ x: 11 + i, y: 14 })),
            // Левая стена с проходом
            ...Array.from({ length: 3 }, (_, i) => ({ x: 5, y: 6 + i })),
            ...Array.from({ length: 3 }, (_, i) => ({ x: 5, y: 11 + i })),
            // Правая стена с проходом
            ...Array.from({ length: 3 }, (_, i) => ({ x: 14, y: 6 + i })),
            ...Array.from({ length: 3 }, (_, i) => ({ x: 14, y: 11 + i }))
        ],
        speed: 95, name: "Клетка"
    },
    {
        obstacles: [
            // Раскол - две горизонтальные стены с проходом в центре
            ...Array.from({ length: 7 }, (_, i) => ({ x: 2 + i, y: 9 })),
            ...Array.from({ length: 7 }, (_, i) => ({ x: 11 + i, y: 9 })),
            ...Array.from({ length: 7 }, (_, i) => ({ x: 2 + i, y: 10 })),
            ...Array.from({ length: 7 }, (_, i) => ({ x: 11 + i, y: 10 })),
        ],
        speed: 90, name: "Раскол"
    },
    {
        obstacles: [
            ...Array.from({ length: 6 }, (_, i) => ({ x: 3, y: 3 + i })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 16, y: 3 + i })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 3, y: 11 + i })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 16, y: 11 + i })),
            ...Array.from({ length: 4 }, (_, i) => ({ x: 8 + i, y: 3 })),
            ...Array.from({ length: 4 }, (_, i) => ({ x: 8 + i, y: 16 })),
            { x: 7, y: 7 }, { x: 12, y: 7 }, { x: 7, y: 12 }, { x: 12, y: 12 }
        ],
        speed: 85, name: "Крест"
    },
    {
        obstacles: [
            // Верхняя стена с проходами
            ...Array.from({ length: 3 }, (_, i) => ({ x: 6 + i, y: 4 })),
            ...Array.from({ length: 3 }, (_, i) => ({ x: 11 + i, y: 4 })),
            // Нижняя стена с проходами
            ...Array.from({ length: 3 }, (_, i) => ({ x: 6 + i, y: 15 })),
            ...Array.from({ length: 3 }, (_, i) => ({ x: 11 + i, y: 15 })),
            // Левая стена с проходом
            ...Array.from({ length: 4 }, (_, i) => ({ x: 4, y: 5 + i })),
            ...Array.from({ length: 4 }, (_, i) => ({ x: 4, y: 11 + i })),
            // Правая стена с проходом
            ...Array.from({ length: 4 }, (_, i) => ({ x: 15, y: 5 + i })),
            ...Array.from({ length: 4 }, (_, i) => ({ x: 15, y: 11 + i })),
            // Центральный блок
            { x: 9, y: 9 }, { x: 10, y: 9 }, { x: 9, y: 10 }, { x: 10, y: 10 }
        ],
        speed: 80, name: "Осада"
    },
    // 16-20: Очень сложные
    {
        obstacles: [
            ...Array.from({ length: 3 }, (_, i) => ({ x: 4 + i * 4, y: 4 })),
            ...Array.from({ length: 3 }, (_, i) => ({ x: 4 + i * 4, y: 5 })),
            ...Array.from({ length: 3 }, (_, i) => ({ x: 4 + i * 4, y: 6 })),
            ...Array.from({ length: 3 }, (_, i) => ({ x: 4 + i * 4, y: 13 })),
            ...Array.from({ length: 3 }, (_, i) => ({ x: 4 + i * 4, y: 14 })),
            ...Array.from({ length: 3 }, (_, i) => ({ x: 4 + i * 4, y: 15 })),
        ],
        speed: 78, name: "Башни"
    },
    {
        obstacles: [
            // Верхняя стена с проходами
            ...Array.from({ length: 5 }, (_, i) => ({ x: 3 + i, y: 3 })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 12 + i, y: 3 })),
            // Нижняя стена с проходами
            ...Array.from({ length: 5 }, (_, i) => ({ x: 3 + i, y: 16 })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 12 + i, y: 16 })),
            // Левая стена с проходом
            ...Array.from({ length: 5 }, (_, i) => ({ x: 3, y: 4 + i })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 3, y: 11 + i })),
            // Правая стена с проходом
            ...Array.from({ length: 5 }, (_, i) => ({ x: 16, y: 4 + i })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 16, y: 11 + i })),
            // Внутренние стены
            ...Array.from({ length: 6 }, (_, i) => ({ x: 7 + i, y: 7 })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 7 + i, y: 12 })),
        ],
        speed: 75, name: "Лабиринт"
    },
    {
        obstacles: [
            ...Array.from({ length: 10 }, (_, i) => ({ x: i, y: i })),
            ...Array.from({ length: 10 }, (_, i) => ({ x: 19 - i, y: i })),
            ...Array.from({ length: 10 }, (_, i) => ({ x: i, y: 19 - i })),
            ...Array.from({ length: 10 }, (_, i) => ({ x: 19 - i, y: 19 - i })),
        ],
        speed: 72, name: "Звезда"
    },
    {
        obstacles: [
            ...Array.from({ length: 5 }, (_, i) => ({ x: 2, y: 2 + i * 3 })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 5, y: 4 + i * 3 })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 8, y: 2 + i * 3 })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 11, y: 4 + i * 3 })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 14, y: 2 + i * 3 })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 17, y: 4 + i * 3 })),
        ],
        speed: 70, name: "Пунктир"
    },
    {
        obstacles: [
            // Спираль с проходами
            { x: 9, y: 9 }, { x: 10, y: 9 },
            // Верхняя часть спирали
            ...Array.from({ length: 3 }, (_, i) => ({ x: 8 + i, y: 7 })),
            // Правая часть спирали
            ...Array.from({ length: 3 }, (_, i) => ({ x: 12, y: 7 + i })),
            ...Array.from({ length: 2 }, (_, i) => ({ x: 12, y: 12 + i })),
            // Нижняя часть спирали
            ...Array.from({ length: 3 }, (_, i) => ({ x: 7 + i, y: 13 })),
            // Левая часть спирали
            ...Array.from({ length: 3 }, (_, i) => ({ x: 6, y: 7 + i })),
            ...Array.from({ length: 2 }, (_, i) => ({ x: 6, y: 12 + i })),
            // Внешний контур
            ...Array.from({ length: 5 }, (_, i) => ({ x: 5 + i, y: 5 })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 14, y: 5 + i })),
        ],
        speed: 68, name: "Водоворот"
    },
    // 21-25: Экстремальные
    {
        obstacles: [
            ...Array.from({ length: 18 }, (_, i) => ({ x: 1 + i, y: 4 })),
            ...Array.from({ length: 18 }, (_, i) => ({ x: 1 + i, y: 9 })),
            ...Array.from({ length: 18 }, (_, i) => ({ x: 1 + i, y: 14 })),
        ],
        speed: 65, name: "Полосы"
    },
    {
        obstacles: [
            // Внешний периметр с проходами
            ...Array.from({ length: 6 }, (_, i) => ({ x: 2 + i, y: 2 })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 12 + i, y: 2 })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 2 + i, y: 17 })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 12 + i, y: 17 })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 2, y: 3 + i })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 2, y: 12 + i })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 17, y: 3 + i })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 17, y: 12 + i })),
            // Внутренний контур с проходами
            ...Array.from({ length: 3 }, (_, i) => ({ x: 6 + i, y: 6 })),
            ...Array.from({ length: 3 }, (_, i) => ({ x: 11 + i, y: 6 })),
            ...Array.from({ length: 3 }, (_, i) => ({ x: 6 + i, y: 13 })),
            ...Array.from({ length: 3 }, (_, i) => ({ x: 11 + i, y: 13 })),
            ...Array.from({ length: 2 }, (_, i) => ({ x: 6, y: 7 + i })),
            ...Array.from({ length: 2 }, (_, i) => ({ x: 6, y: 11 + i })),
            ...Array.from({ length: 2 }, (_, i) => ({ x: 13, y: 7 + i })),
            ...Array.from({ length: 2 }, (_, i) => ({ x: 13, y: 11 + i })),
        ],
        speed: 62, name: "Крепость"
    },
    {
        obstacles: [
            // Множество островков - центр свободен для спавна
            { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 3, y: 4 },
            { x: 15, y: 3 }, { x: 16, y: 3 }, { x: 16, y: 4 },
            { x: 3, y: 15 }, { x: 3, y: 16 }, { x: 4, y: 16 },
            { x: 16, y: 15 }, { x: 15, y: 16 }, { x: 16, y: 16 },
            { x: 9, y: 3 }, { x: 10, y: 3 },
            { x: 3, y: 9 }, { x: 3, y: 10 },
            { x: 16, y: 9 }, { x: 16, y: 10 },
            { x: 9, y: 16 }, { x: 10, y: 16 },
            // Центральный остров смещён выше
            { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 9, y: 8 }, { x: 10, y: 8 },
            { x: 6, y: 6 }, { x: 13, y: 6 }, { x: 6, y: 13 }, { x: 13, y: 13 },
        ],
        speed: 60, name: "Острова"
    },
    {
        obstacles: [
            ...Array.from({ length: 8 }, (_, i) => ({ x: 2 + i * 2, y: 3 })),
            ...Array.from({ length: 8 }, (_, i) => ({ x: 3 + i * 2, y: 6 })),
            ...Array.from({ length: 8 }, (_, i) => ({ x: 2 + i * 2, y: 9 })),
            ...Array.from({ length: 8 }, (_, i) => ({ x: 3 + i * 2, y: 12 })),
            ...Array.from({ length: 8 }, (_, i) => ({ x: 2 + i * 2, y: 15 })),
        ],
        speed: 58, name: "Шахматы"
    },
    {
        obstacles: [
            // Финальный босс - сложный лабиринт с проходами
            // Верхняя стена с проходом
            ...Array.from({ length: 7 }, (_, i) => ({ x: 1 + i, y: 1 })),
            ...Array.from({ length: 7 }, (_, i) => ({ x: 12 + i, y: 1 })),
            // Нижняя стена с проходом
            ...Array.from({ length: 7 }, (_, i) => ({ x: 1 + i, y: 18 })),
            ...Array.from({ length: 7 }, (_, i) => ({ x: 12 + i, y: 18 })),
            // Левая стена с проходом
            ...Array.from({ length: 6 }, (_, i) => ({ x: 1, y: 2 + i })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 1, y: 12 + i })),
            // Правая стена с проходом
            ...Array.from({ length: 6 }, (_, i) => ({ x: 18, y: 2 + i })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 18, y: 12 + i })),
            // Внутренние стены
            ...Array.from({ length: 5 }, (_, i) => ({ x: 4, y: 4 + i })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 15, y: 11 + i })),
            ...Array.from({ length: 8 }, (_, i) => ({ x: 6 + i, y: 6 })),
            ...Array.from({ length: 8 }, (_, i) => ({ x: 6 + i, y: 13 })),
            // Центральные столбы по бокам
            { x: 8, y: 9 }, { x: 8, y: 10 }, { x: 11, y: 9 }, { x: 11, y: 10 },
        ],
        speed: 55, name: "Финал Уробороса"
    }
];
