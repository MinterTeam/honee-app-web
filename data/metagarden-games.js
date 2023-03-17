/**
 * @type {Array<MetagardenGameCard>}
 */
export default [
    {
        title: 'Perfect City NFT',
        description: 'todo description',
        category: 'Strategy',
        coin: 'SHEKEL',
        slug: 'perfect-city',
        ru: {
            title: '',
            description: 'todo ru description',
            category: '',
        },
    },
    {
        title: 'Miner',
        description: 'todo description',
        coin: 'METAGARDEN',
        slug: 'mining-spot',
        ru: {
            title: 'Майнер',
        },
    },
    {
        title: 'Magic Box',
        description: 'todo description',
        category: 'Lottery',
        coin: 'METAGARDEN',
        slug: 'magic-box',
    },
    {
        title: 'Chess',
        description: 'todo description',
        category: 'Board game',
        coin: 'CHESS',
        slug: 'chess',
        isComingSoon: true,
        ru: {
            title: 'Шахматы',
        },
    },
    {
        title: 'Carrots Mafia',
        description: 'todo description',
        category: 'Strategy',
        coin: 'CARROTS',
        slug: 'carrots-mafia',
        isComingSoon: true,
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

