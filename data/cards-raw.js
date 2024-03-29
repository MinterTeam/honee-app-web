import {BASE_COIN} from '~/assets/variables.js';

/**
 * @type {{[key: string]: (...presetParams: Array) => CardListItemRaw}}
 */
export const cardPresetList = {
    farm(coin0, coin1) {
        return {
            action: `/farm/${coin0}/${coin1}`,
            tags: ['Farming'],
            coin: [coin0, coin1],
            caption: 'Yield farming',
            description: `Put your ${coin0} and ${coin1} into a liquidity pool for getting daily rewards.`,
            buttonLabel: 'Earn with farming',
            ru: {
                caption: 'Фарминг',
                description: `Поместите свои ${coin0} и ${coin1} в пул ликвидности, чтобы получать ежедневные вознаграждения.`,
                buttonLabel: 'Заработать на фарминге',
            },
        };
    },
    stake(id) {
        return {
            action: `/stake/${id}`,
            tags: ['Staking'],
            caption: 'Stake & Earn',
            buttonLabel: 'Earn with staking',
            ru: {
                caption: 'Стейкинг',
                buttonLabel: 'Заработать на стейкинге',
            },
        };
    },
    delegate(coin) {
        return {
            caption: 'Delegate',
            coin,
            description: `‘Tie’ your ${coin} to any validator of the Minter Network and start getting rewards every hour.`,
            stats: {
                apy: {
                    percent: 10,
                    rewardCoin: BASE_COIN,
                },
            },
            tags: ['Staking'],
            action: `/delegate/${coin}`,
            ru: {
                description: `«Привяжите» свои ${coin} к любому валидатору сети Minter и начните получать награды каждый час.`,
                caption: 'Делегирование',
            },
        };
    },
    swap(coinToBuy) {
        return {
            caption: 'Buy',
            coin: coinToBuy,
            tags: ['Exchange'],
            action: `/swap/${coinToBuy}`,
            ru: {
                caption: 'Купить',
            },
        };
    },
};
const presets = cardPresetList;


/**
 * @type {CardCategoryMap}
 */
export default {
    earn: {
        title: 'Earning Options',
        cards: [
            {
                style: 'metagarden-buy-spot',
                caption: 'Mining',
                title: 'Miners',
                coin: `METAGARDEN`,
                description: 'Metagarden — a play-to-earn platform with mini games. Become the platform miner to earn crypto.',
                buttonLabel: 'Buy miners',
                tags: [],
                action: `/metagarden/buy-miner`,
                ru: {
                    caption: 'Майнинг',
                    title: 'Майнеры',
                    description: 'Metagarden — play-to-earn платформа с мини-играми. Станьте майнером платформы, чтобы зарабатывать криптовалюту.',
                    buttonLabel: 'Купить майнеры',

                },
            },
            /*makeCard(presets.farm('WONDER', 'BNB'), {
                stats: {
                    apr: {
                        percent: '120',
                    },
                },
            }),*/
            {
                style: 'extended-card card--bee-buy',
                caption: 'Buy',
                coin: 'BEE',
                description: 'BEE is a native Honee crypto wallet token. Provides users with many opportunities to earn crypto.',
                stats: {
                    price: true,
                },
                tags: ['Exchange'],
                action: '/topup/coin/BEE',
                buttonLabel: 'Buy BEE',
                ru: {
                    description: 'BEE — токен крипто-кошелька Honee. Предоставляет пользователям множество возможностей для заработка.',
                    caption: 'Купить',
                    buttonLabel: 'Купить BEE',
                },
            },
            /*makeCard(presets.stake(19), {
                style: 'extended-card card--bee-staking',
                coin: `BEE`,
                description: 'Stake BEE for 1, 2 or 3 years to get everyday rewards. The longer you stake, the more you earn!',
                tooltip: '',
                video: '',
                stats: {
                    apr: {
                        percent: '5-20',
                    },
                },
                ru: {
                    description: 'Стейкуйте BEE на 1, 2 или 3 года, чтобы получать ежедневные награды. Чем больше период, тем больше вы зарабатываете!',
                    tooltip: '',
                    video: '',
                },
            }),*/
            /*makeCard(presets.farm('BEE', 'USDTE'), {
                style: 'extended-card card--bee-farming',
                stats: {
                    apr: {
                        percent: '73',
                    },
                },
            }),
            makeCard(presets.farm('BEE', 'USDTBSC'), {
                style: 'extended-card card--bee-farming-2',
                stats: {
                    apr: {
                        percent: '73',
                    },
                },
            }),*/
            /*makeCard(presets.farm('METAGARDEN', 'USDTE'), {
                stats: {
                    apr: {
                        percent: '73',
                    },
                },
            }),
            makeCard(presets.farm('METAGARDEN', 'USDTBSC'), {
                stats: {
                    apr: {
                        percent: '73',
                    },
                },
            }),*/
            /*makeCard(presets.stake(32), {
                coin: `METAGARDEN`,
                description: 'Stake METAGARDEN for 1, 2 or 3 years to get everyday rewards. The longer you stake, the more you earn!',
                stats: {
                    apr: {
                        percent: '5-20',
                    },
                },
                ru: {
                    description: 'Стейкуйте METAGARDEN на 1, 2 или 3 года, чтобы получать ежедневные награды. Чем больше период, тем больше вы зарабатываете!',
                },
            }),*/
            /*makeCard(presets.stake(24), {
                coin: `MUSD`,
                description: 'Stake MUSD for 1, 2 or 3 years to get everyday rewards. The longer you stake, the more you earn!',
                stats: {
                    apr: {
                        percent: '6-10',
                    },
                },
                ru: {
                    description: 'Стейкуйте MUSD на 1, 2 или 3 года, чтобы получать ежедневные награды. Чем больше период, тем больше вы зарабатываете!',
                },
            }),*/
            /*makeCard(presets.stake(21), {
                coin: `HUBSTAKE`,
                description: 'Stake HUBSTAKE for 1, 2 or 3 years to get everyday rewards. The longer you stake, the more you earn!',
                stats: {
                    apr: {
                        percent: '1-5',
                    },
                },
                ru: {
                    description: 'Стейкуйте HUBSTAKE на 1, 2 или 3 года, чтобы получать ежедневные награды. Чем больше период, тем больше вы зарабатываете!',
                },
            }),*/
            makeCard(presets.delegate(BASE_COIN)),
            /*makeCard(presets.swap('DETFAPY'), {
                description: 'Decentralized Trading Fund based on top 10 expert portfolios.',
                ru: {
                    description: 'Децентрализованный торговый фонд на основе Топ-10 портфелей экспертов.',
                },
            }),
            makeCard(presets.farm('RABBITS', 'METAGARDEN'), {
                stats: {
                    apr: {
                        percent: '61',
                    },
                },
            }),
            makeCard(presets.farm('CARROTS', 'METAGARDEN'), {
                stats: {
                    apr: {
                        percent: '61',
                    },
                },
            }),
            makeCard(presets.farm('BUNNY', 'METAGARDEN'), {
                stats: {
                    apr: {
                        percent: '61',
                    },
                },
            }),
            makeCard(presets.farm('WATER', 'METAGARDEN'), {
                stats: {
                    apr: {
                        percent: '61',
                    },
                },
            }),
            makeCard(presets.farm('GARDEN', 'METAGARDEN'), {
                stats: {
                    apr: {
                        percent: '61',
                    },
                },
            }),
            makeCard(presets.farm('SNATCH', 'METAGARDEN'), {
                stats: {
                    apr: {
                        percent: '61',
                    },
                },
            }),
            makeCard(presets.farm('WONDER', 'METAGARDEN'), {
                stats: {
                    apr: {
                        percent: '61',
                    },
                },
            }),
            makeCard(presets.farm('HEISTGAME', 'METAGARDEN'), {
                stats: {
                    apr: {
                        percent: '61',
                    },
                },
            }),*/
            /*{
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
            },*/
            makeCard(presets.stake(54), {
                coin: `INTERSTAKE`,
                description: 'Stake INTERSTAKE for 1, 2 or 3 years to get everyday rewards. The longer you stake, the more you earn!',
                stats: {
                    apr: {
                        percent: '6-24',
                    },
                },
                ru: {
                    description: 'Стейкуйте INTERSTAKE на 1, 2 или 3 года, чтобы получать ежедневные награды. Чем больше период, тем больше вы зарабатываете!',
                },
            }),
        ],
    },
    swap: {
        title: 'Buy',
        cards: [
            makeCard(presets.swap('BTC'), {
                description: 'Buy Bitcoin, the first cryptocurrency.',
                ru: {
                    description: 'Приобретите Bitcoin, первую криптовалюту.',
                },
            }),
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
 * Merge preset card with custom card data
 * @param {CardListItemRaw} presetCard
 * @param {CardListItemRaw} [card]
 * @return {CardListItemRaw}
 */
export function makeCard(presetCard, card) {
    return {
        ...presetCard,
        ...card,
        ru: {
            ...presetCard.ru,
            ...card?.ru,
        },
    };
}

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
 * @property {string} [tooltip]
 * @property {string} [video]
 * @property {string} [buttonLabel]
 * @property {object} [stats]
 * @property {string} [stats.caption]
 * @property {string|number} [stats.value]
 */

/**
 * @typedef {{apr: CardDataStatsApr} | {apy: CardDataStatsApr} | {price: boolean}} CardDataStats - predefined stats presets
 *# @property {CardDataStatsApr} [apr]
 *# @property {CardDataStatsApr} [apy]
 *# @property {boolean} [price]
 */

/**
 * @typedef {object} CardDataStatsApr
 * @property {string|number} percent
 * @property {string} [rewardCoin]
 */

/**
 * @typedef {Object.<string, {title?: string, cards: Array<CardListItemRaw|CardListItem>}>} CardCategoryMap
 */
