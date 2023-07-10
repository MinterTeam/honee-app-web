/**
 * @type {Array<MetagardenGameCard>}
 */
export default [
    {
        title: 'Perfect City NFT',
        description: 'An economic game with virtual cities where you have to buy and upgrade towers to find the perfect balance between investment and profitability.',
        category: 'Strategy',
        coin: 'SHEKEL',
        slug: 'perfect-city',
        ru: {
            description: 'Экономическая игра с виртуальными городами, в которой вам потребуется покупать и прокачивать башни, чтобы найти идеальный баланс между вложениями и доходностью.',
            category: 'Стратегия',
        },
    },
    {
        title: 'Lucky Miner',
        description: 'Become a miner of METAGARDEN tokens. It\'s an exciting process in the form of a game. You\'ll be receiving daily rewards with many other bonuses.',
        coin: 'METAGARDEN',
        slug: 'miner',
        ru: {
            title: 'Майнер',
            description: 'Майнинг токенов платформы Metagarden — это увлекательный процесс в игровой форме. Купите майнер и получайте ежедневные вознаграждения с множеством других бонусов.',
        },
    },
    {
        title: 'Wonder',
        description: 'Win, collect and sell unique NFTs that can be found in different WonderBoxes!',
        category: 'Lottery',
        coin: 'WONDER',
        slug: 'magic-box',
        ru: {
            description: 'Выигрывайте, собирайте и продавайте уникальные NFT, которые можно найти в разных ВандерБоксах!',
            category: 'Лотерея',
        },
    },
    {
        title: 'Snatch',
        description: 'A multiplayer game where you have to unlock bank safes to collect prizes.',
        category: 'Lottery',
        coin: 'SNATCH',
        slug: 'snatch',
        ru: {
            description: 'Многопользовательская игра, в которой необходимо открывать банковские ячейки, чтобы забирать призы.',
            category: 'Лотерея',
        },
    },
    {
        title: 'Heist',
        description: '',
        coin: 'HEIST',
        slug: 'heist',
        isComingSoon: true,
        ru: {
            description: '',
        },
    },
    {
        title: 'Chess',
        description: 'Play classic chess against each other. Earn crypto by playing chess matches, climb the rankings to get rewards.',
        category: 'Board game',
        coin: 'CHESS',
        slug: 'chess',
        isComingSoon: true,
        ru: {
            title: 'Шахматы',
            description: 'Играйте в классические шахматы друг против друга. Зарабатывайте крипту в индивидульных матчах или турнирах.',
            category: 'Настольная игра',
        },
    },
    {
        title: 'Carrots Mafia',
        description: 'Take other people\'s carrots and protect your own! Create your own game strategy, look for weak opponents or team up in groups.',
        category: 'Strategy',
        coin: 'CARROTS',
        slug: 'carrots-mafia',
        isComingSoon: true,
        ru: {
            description: 'Забирайте чужие морковки и защищайте свои! Придумывайте собственную стратегию игры, ищите слабых соперников или объединяйтесь в группировки.',
            category: 'Стратегия',
        },
    },
];


/**
 * @typedef {MetagardenGameCardText & object} MetagardenGameCard
 * @property {string} coin
 * @property {string} slug
 * @property {boolean} [isComingSoon]
 * @property {Partial<MetagardenGameCardText>} [ru]
 */

/**
 * @typedef {object} MetagardenGameCardText
 * @property {string} title
 * @property {string} description
 * @property {string} category
 */

