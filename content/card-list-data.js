import {BASE_COIN} from '~/assets/variables.js';

/**
 * @type {CardCategoryMap}
 */
export default {
    earn: {
        //@TODO tags from coin
        //@TODO stats from apr field
        cards: [
            {
                caption: 'Stake & Earn',
                coin: `BEE`,
                description: 'Stake BEE for 1, 2 or 3 years to get everyday rewards. The longer you stake, the more you earn!',
                stats: {
                    apr: {
                        percent: '6-24',
                    },
                },
                tags: ['Staking'],
                action: `/stake/BEE`,
                ru: {
                    description: 'Стейкуйте BEE на 1, 2 или 3 года, чтобы получать ежедневные награды. Чем больше период, тем больше вы зарабатываете!',
                    caption: 'Стейкинг',
                },
            },
            {
                caption: 'Delegate',
                coin: BASE_COIN,
                description: '‘Tie’ your BIP to any validator of the Minter Network and start getting rewards every hour.',
                stats: {
                    apy: {
                        percent: 10,
                    },
                },
                tags: ['Staking'],
                action: `/delegate/${BASE_COIN}`,
                ru: {
                    description: '«Привяжите» свои BIP к любому валидатору сети Minter и начните получать награды каждый час.',
                    caption: 'Делегирование',
                },
            },
            {
                caption: 'Yield farming',
                coin: ['HUB', 'BNB'],
                description: 'Put your HUB and BNB into a liquidity pool to start getting extra daily rewards.',
                stats: {
                    apr: {
                        percent: 121.5,
                        rewardCoin: 'HUB',
                    },
                },
                tags: ['Farming'],
                action: '/farm/HUB/BNB',
                ru: {
                    description: 'Положите свои HUB и BNB в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                    caption: 'Фарминг',
                },
            },
            {
                caption: 'Yield farming',
                coin: ['BIP', 'MUSD'],
                description: 'Put your BIP and MUSD into a liquidity pool to start getting extra daily rewards.',
                stats: {
                    apr: {
                        percent: 121.5,
                        rewardCoin: 'BIP',
                    },
                },
                tags: ['Farming'],
                action: '/farm/BIP/MUSD',
                ru: {
                    description: 'Положите свои BIP и MUSD в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                    caption: 'Фарминг',
                },
            },
        ],
    },
    swap: {
        title: 'Buy',
        cards: [
            {
                caption: 'Buy',
                coin: 'BEE',
                description: 'Get native digital coin of Honee crypto wallet. Soon you\'ll be able to stake BEE to get everyday rewards.',
                stats: {
                },
                tags: ['Exchange'],
                action: '/swap/BEE',
                ru: {
                    description: 'Приобретите монету крипто-кошелька Honee. Вскоре вы сможете отправить BEE в стейкинг, чтобы получать ежедневные награды.',
                    caption: 'Купить',
                },
            },
            {
                caption: 'Buy',
                coin: 'HUB',
                description: 'Get native digital token of Minter Hub, a cross-chain bridge to global crypto liquidity.',
                stats: {

                },
                tags: ['Exchange'],
                action: '/swap/HUB',
                ru: {
                    description: 'Приобретите основной токен Minter Hub — кросс-чейн моста в глобальную криптоликвидность.',
                    caption: 'Купить',
                },
            },
            {
                caption: 'Buy',
                coin: BASE_COIN,
                description: 'Get native digital coin of Minter, a single decentralized network supporting many digital assets.',
                stats: {
                    price: BASE_COIN,
                },
                tags: ['Exchange'],
                action: `/swap/${BASE_COIN}`,
                ru: {
                    description: 'Приобретите основную монету Minter — единой децентрализованной сети с поддержкой многих цифровых активов.',
                    caption: 'Купить',
                },
            },
            {
                caption: 'Buy',
                coin: 'BTC',
                description: 'Buy Bitcoin, the first cryptocurrency.',
                stats: {
                },
                tags: ['Exchange'],
                action: '/swap/BTC',
                ru: {
                    description: 'Приобретите Bitcoin, первую криптовалюту.',
                    caption: 'Купить',
                },
            },
            {
                caption: 'Buy',
                coin: 'ETH',
                description: 'Ethereum is a decentralized open-source blockchain system that features its own cryptocurrency, Ether.',
                stats: {
                },
                tags: ['Exchange'],
                action: '/swap/ETH',
                ru: {
                    description: 'Ethereum — это платформа смарт-контрактов, которая позволяет разработчикам создавать децентрализованные приложения (DApps). Ether (ETH) - это нативная цифровая валюта платформы Ethereum.',
                    caption: 'Купить',
                },
            },
            {
                caption: 'Buy',
                coin: 'BNB',
                description: 'BNB is the cryptocurrency coin that powers the Binance ecosystem. BNB is one of the world\'s most popular utility tokens.',
                stats: {
                },
                tags: ['Exchange'],
                action: '/swap/BNB',
                ru: {
                    description: 'BNB — это криптовалюта, которая поддерживает экосистему Binance. BNB является одним из самых популярных utility-токенов в мире.',
                    caption: 'Купить',
                },
            },
            {
                caption: 'Buy',
                coin: 'TON',
                description: 'Get a base coin of the TON Blockchain, a project that aims to unite all existing blockchains and the Internet itself into a single Web 3.0 network.',
                stats: {
                },
                tags: ['Exchange'],
                action: '/swap/TON',
                ru: {
                    description: 'Приобретите базовую монету TON — проекта, который стремится объединить все существующие блокчейны и сам Интернет в единую Web 3.0-сеть.',
                    caption: 'Купить',
                },
            },
            {
                caption: 'Buy',
                coin: 'SQD',
                description: 'Buy a Minter-powered meme token brought to you by fans of a popular series Squid Game.',
                icon: 'SQD',
                stats: {
                },
                tags: ['Exchange'],
                action: '/swap/SQD',
                ru: {
                    description: 'Приобретите мем-коин фан-клуба популярного сериала «Игра в кальмара», выпущенный на блокчейне Minter.',
                    caption: 'Купить',
                },
            },
            {
                caption: 'Buy',
                coin: 'ARCONA',
                description: 'Get a native token of ARCONA metaverse  that allows you to purchase digital lands and place any models.',
                stats: {
                },
                tags: ['Exchange'],
                action: '/swap/ARCONA',
                ru: {
                    description: 'Приобретите нативный токен метавселенной ARCONA, позволяющий покупать цифровые земли и размещать любые модели.',
                    caption: 'Купить',
                },
            },
            {
                caption: 'Buy',
                coin: 'GMTBSC',
                description: 'STEPN is a self-styled “Web3 lifestyle app” with GameFi elements. It combines aspects of a play-to-earn game with a fitness app to create a new category coined “move-to-earn.”',
                stats: {
                },
                tags: ['Exchange'],
                action: '/swap/GMTBSC',
                ru: {
                    description: 'STEPN — это лайфстайл-приложение с элементами GameFi. Он сочетает в себе аспекты игры «играй, чтобы заработать» и фитнес-приложение с новой категорией «двигайся, чтобы зарабатывать».',
                    caption: 'Купить',
                },
            },
        ],
    },
};


/**
 * @typedef {CardDataText} CardListItem
 * @property {string} action - url to action
 * @property {string|Array<string>} [coin] - coin symbol or list of coin symbols (used for `title`, `icon`, and `tags`)
 * @property {string|Array<string>} [icon]
 * @property {CardDataStats} [stats]
 * @property {string[]} [tags]
 * @property {CardDataText} [ru]
 */

/**
 * @typedef {object} CardDataText
 * @property {string} [caption]
 * @property {string} [title]
 * @property {string} [description]
 * @property {object} [stats]
 * @property {string} [stats.caption]
 * @property {string|number} [stats.value]
 */

/**
 * @typedef {CardDataText.stats} CardDataStats
 * @property {CardDataStatsApr} [apr]
 * @property {CardDataStatsApr} [apy]
 */

/**
 * @typedef {object} CardDataStatsApr
 * @property {string|number} percent
 * @property {string} [rewardCoin]
 */

/**
 * @typedef {Object.<string, {title?: string, cards: Array<CardListItem>}>} CardCategoryMap
 */