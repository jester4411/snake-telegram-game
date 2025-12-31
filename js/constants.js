// ==========================================
// 🐉 УРОБОРОС - Константы и уровни
// ==========================================

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREASE = 3;
const MIN_SPEED = 60;
const TOTAL_LEVELS = 10;

// Настройки еды
const FOOD_LIFETIME = 8000;
const FOOD_STAGES = 5;
const FOOD_STAGE_TIME = FOOD_LIFETIME / FOOD_STAGES;

// Уровни
const LEVELS = [
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
        speed: 115, name: "Спираль"
    },
    {
        obstacles: [
            ...Array.from({ length: 5 }, (_, i) => ({ x: 3 + i, y: 3 })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 12 + i, y: 3 })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 3 + i, y: 16 })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 12 + i, y: 16 })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 3, y: 4 + i })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 3, y: 11 + i })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 16, y: 4 + i })),
            ...Array.from({ length: 5 }, (_, i) => ({ x: 16, y: 11 + i })),
            { x: 9, y: 9 }, { x: 10, y: 9 },
            { x: 9, y: 10 }, { x: 10, y: 10 }
        ],
        speed: 105, name: "Арена"
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
        speed: 95, name: "Хаос"
    },
    {
        obstacles: [
            ...Array.from({ length: 6 }, (_, i) => ({ x: 1 + i, y: 2 })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 13 + i, y: 2 })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 1 + i, y: 17 })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 13 + i, y: 17 })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 2, y: 3 + i })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 2, y: 11 + i })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 17, y: 3 + i })),
            ...Array.from({ length: 6 }, (_, i) => ({ x: 17, y: 11 + i })),
            ...Array.from({ length: 4 }, (_, i) => ({ x: 7 + i, y: 7 })),
            ...Array.from({ length: 4 }, (_, i) => ({ x: 7 + i, y: 12 })),
            { x: 7, y: 8 }, { x: 7, y: 9 }, { x: 7, y: 10 }, { x: 7, y: 11 },
            { x: 10, y: 8 }, { x: 10, y: 9 }, { x: 10, y: 10 }, { x: 10, y: 11 }
        ],
        speed: 85, name: "Храм Уробороса"
    }
];
