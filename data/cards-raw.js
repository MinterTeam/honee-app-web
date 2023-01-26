import {BASE_COIN} from '~/assets/variables.js';

/**
 * @type {CardCategoryMap}
 */
export default {
    earn: {
        title: 'Earning Options',
        cards: [
            {
                style: 'metagarden',
                caption: 'Mining',
                title: 'Buy mining spots',
                coin: `METAGARDEN`,
                description: 'metagarden — a play-to-earn platform with mini games. Become the platform miner to earn crypto.',
                buttonLabel: 'Buy spot',
                tags: [],
                action: `/metagarden/buy-spot`,
                ru: {
                    caption: 'Майнинг',
                    title: 'Майнинг-споты',
                    description: 'metagarden — play-to-earn платформа с мини-играми. Станьте майнером платформы, чтобы зарабатывать криптовалюту.',
                    buttonLabel: 'Купить спот',

                },
            },
            {
                caption: 'Liquidity mining',
                coin: ['BEE', 'MUSD'],
                description: 'Put your BEE and MUSD into a liquidity pool. Then stake received LP-656 tokens for getting extra daily rewards.',
                stats: {
                    apy: {
                        percent: '≈3',
                    },
                },
                tags: [],
                action: '/add-liquidity/BEE/MUSD',
                ru: {
                    caption: 'Майнинг ликвидностью',
                    description: 'Поместите свои BEE и MUSD в пул ликвидности. Затем застейкуйте полученные LP-656 токены для получения дополнительных ежедневных наград.',
                },
            },
            {
                caption: 'Yield farming',
                coin: ['BEE', 'MUSD'],
                description: 'Stake your LP-656 tokens with a 1-year lock to start getting extra daily rewards.',
                buttonLabel: 'Stake',
                stats: {
                    apr: {
                        percent: '36.5',
                    },
                },
                tags: ['Farming'],
                action: `/farm/378`,
                ru: {
                    description: 'Застейкуйте свои LP-656 токены с блокировкой на 1 год, чтобы получать дополнительные ежедневные награды.',
                    caption: 'Фарминг',
                    buttonLabel: 'Застейковать',
                },
            },
            {
                caption: 'Stake & Earn',
                coin: `BEE`,
                description: 'Stake BEE for 1, 2 or 3 years to get everyday rewards. The longer you stake, the more you earn!',
                stats: {
                    apr: {
                        percent: '5-20',
                    },
                },
                tags: ['Staking'],
                action: `/stake/19`,
                ru: {
                    description: 'Стейкуйте BEE на 1, 2 или 3 года, чтобы получать ежедневные награды. Чем больше период, тем больше вы зарабатываете!',
                    caption: 'Стейкинг',
                },
            },
            {
                caption: 'Stake & Earn',
                coin: `MUSD`,
                description: 'Stake MUSD for 1, 2 or 3 years to get everyday rewards. The longer you stake, the more you earn!',
                stats: {
                    apr: {
                        percent: '6-10',
                    },
                },
                tags: ['Staking'],
                action: `/stake/24`,
                ru: {
                    description: 'Стейкуйте MUSD на 1, 2 или 3 года, чтобы получать ежедневные награды. Чем больше период, тем больше вы зарабатываете!',
                    caption: 'Стейкинг',
                },
            },
            {
                caption: 'Stake & Earn',
                coin: `HUBSTAKE`,
                description: 'Stake HUBSTAKE for 1, 2, 3, 4 or 5 years to get everyday rewards. The longer you stake, the more you earn!',
                stats: {
                    apr: {
                        percent: '1-5',
                    },
                },
                tags: ['Staking'],
                action: `/stake/21`,
                ru: {
                    description: 'Стейкуйте HUBSTAKE на 1, 2, 3, 4 или 5 лет, чтобы получать ежедневные награды. Чем больше период, тем больше вы зарабатываете!',
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
                        rewardCoin: BASE_COIN,
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
                caption: 'Buy',
                coin: 'DETFAPY',
                description: 'Decentralized Trading Fund based on top 10 expert portfolios.',
                stats: {
                },
                tags: ['Exchange'],
                action: '/swap/DETFAPY',
                ru: {
                    description: 'Децентрализованный торговый фонд на основе Топ-10 портфелей экспертов.',
                    caption: 'Купить',
                },
            },
            {
                caption: 'Lucky Farmer',
                coin: 'CARROTS',
                description: 'Win up to 200% of your carrots daily by planting them in your garden.',
                buttonLabel: 'Plant',
                stats: {
                    caption: 'Win up to',
                    value: '200%',
                },
                tags: ['Lottery', 'CARROTS'],
                action: '/win/CARROTS/GARDEN',
                ru: {
                    caption: 'Везучий фермер',
                    description: 'Каждый день вы можете выиграть до 200% своих морковок, посадив их в саду.',
                    buttonLabel: 'Посадить',
                    stats: {
                        caption: 'Приз до',
                    },
                },
            },
            {
                style: 'portfolio-battle',
                caption: 'Contest',
                title: 'PORTFOLIO BATTLE',
                icon: '/img/icon-portfolio-battle.png',
                description: 'Join the Portfolio Battle and win crypto prizes every week.',
                buttonLabel: 'Learn More',
                tags: [],
                action: `/portfolio/battle`,
                ru: {
                    caption: 'Конкурс',
                    title: 'БИТВА ПОРТФЕЛЕЙ',
                    description: 'Присоединяйтесь к битве портфелей и выигрывайте крипто-призы каждую неделю.',
                    buttonLabel: 'Подробнее',

                },
            },
        ],
    },
    swap: {
        title: 'Buy',
        cards: [
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
            /*
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
                coin: 'CAWETH',
                description: 'A Hunters Dream is a decentralized financial payment network that rebuilds the traditional payment stack on the blockchain.',
                icon: 'CAWETH',
                stats: {
                },
                tags: ['Exchange'],
                action: '/swap/CAWETH',
                ru: {
                    description: 'A Hunters Dream — это децентрализованная финансовая платежная сеть, которая перестраивает традиционный платежный стек на блокчейне.',
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
            */
        ],
    },
};

/**
 * @typedef {object & CardListItemRaw} CardListItem
 * @property {string} actionType
 * @property {string} category
 */


/**
 * @typedef {object & CardDataText} CardListItemRaw
 * @property {string} action - url to action
 * @property {string|Array<string>} [coin] - coin symbol or list of coin symbols (used for `title`, `icon`, and `tags`)
 * @property {string|Array<string>} [icon]
 * @property {CardDataStats & CardDataText.stats} [stats]
 * @property {string[]} [tags]
 * @property {string} [style] - class to apply to card to style it
 * @property {CardDataText} [ru]
 */

/**
 * @typedef {object} CardDataText
 * @property {string} [caption]
 * @property {string} [title]
 * @property {string} [description]
 * @property {string} [buttonLabel]
 * @property {object} [stats]
 * @property {string} [stats.caption]
 * @property {string|number} [stats.value]
 */

/**
 * @typedef {object} CardDataStats
 * @property {CardDataStatsApr} [apr]
 * @property {CardDataStatsApr} [apy]
 */

/**
 * @typedef {object} CardDataStatsApr
 * @property {string|number} percent
 * @property {string} [rewardCoin]
 */

/**
 * @typedef {Object.<string, {title?: string, cards: Array<CardListItemRaw|CardListItem>}>} CardCategoryMap
 */
