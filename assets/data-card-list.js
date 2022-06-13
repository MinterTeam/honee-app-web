import {BASE_COIN} from '~/assets/variables.js';

export default {
    earn: {
        //@TODO icon from coin
        //@TODO title from coin
        //@TODO tags from coin
        //@TODO stats from apr field
        cards: [
            {
                caption: 'Stake & Earn',
                title: `BEE`,
                description: 'Stake BEE for 1, 2 or 3 years to get everyday rewards. The longer you stake, the more you earn!',
                icon: 'BEE',
                stats: {
                    caption: 'APR',
                    value: 'from 6 to 24%',
                },
                tags: ['Staking', 'BEE'],
                action: `/stake/BEE`,
                ru: {
                    title: 'BEE',
                    description: 'Стейкуйте BEE на 1, 2 или 3 года, чтобы получать ежедневные награды. Чем больше период, тем больше вы зарабатываете!',
                    caption: 'Стейкинг',
                    stats: {
                        caption: 'Годовых',
                        value: 'от 6 до 24%',
                    },
                },
            },
            {
                caption: 'Delegate',
                title: `${BASE_COIN}`,
                description: '‘Tie’ your BIP to any validator of the Minter Network and start getting rewards every hour.',
                icon: BASE_COIN,
                stats: {
                    caption: 'APY',
                    value: '10%',
                },
                tags: ['Staking', BASE_COIN],
                action: `/delegate/${BASE_COIN}`,
                ru: {
                    title: 'BIP',
                    description: '«Привяжите» свои BIP к любому валидатору сети Minter и начните получать награды каждый час.',
                    caption: 'Делегирование',
                },
            },
            {
                caption: 'Yield farming',
                title: 'HUB / BNB',
                description: 'Put your HUB and BNB into a liquidity pool to start getting extra daily rewards.',
                icon: ['HUB', 'BNB'],
                stats: {
                    caption: 'APR in HUB',
                    value: '121.5%',
                },
                tags: ['Farming', 'HUB', 'BNB'],
                action: '/farm/HUB/BNB',
                ru: {
                    title: 'HUB / BNB',
                    description: 'Положите свои HUB и BNB в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                    caption: 'Фарминг',
                },
            },
            {
                caption: 'Yield farming',
                title: 'BIP / MUSD',
                description: 'Put your BIP and MUSD into a liquidity pool to start getting extra daily rewards.',
                icon: ['BIP', 'MUSD'],
                stats: {
                    caption: 'APR in BIP',
                    value: '121.5%',
                },
                tags: ['Farming', 'BIP', 'MUSD'],
                action: '/farm/BIP/MUSD',
                ru: {
                    title: 'BIP / MUSD',
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
                title: 'BEE',
                description: 'Get native digital coin of Honee crypto wallet. Soon you\'ll be able to stake BEE to get everyday rewards.',
                icon: 'BEE',
                stats: {

                },
                tags: ['Exchange', 'BEE'],
                action: '/swap/BEE',
                ru: {
                    title: 'BEE',
                    description: 'Приобретите монету крипто-кошелька Honee. Вскоре вы сможете отправить BEE в стейкинг, чтобы получать ежедневные награды.',
                    caption: 'Купить',
                },
            },
            {
                caption: 'Buy',
                title: 'HUB',
                description: 'Get native digital token of Minter Hub, a cross-chain bridge to global crypto liquidity.',
                icon: 'HUB',
                stats: {

                },
                tags: ['Exchange', 'HUB'],
                action: '/swap/HUB',
                ru: {
                    title: 'HUB',
                    description: 'Приобретите основной токен Minter Hub — кросс-чейн моста в глобальную криптоликвидность.',
                    caption: 'Купить',
                },
            },
            {
                caption: 'Buy',
                title: `${BASE_COIN}`,
                description: 'Get native digital coin of Minter, a single decentralized network supporting many digital assets.',
                icon: BASE_COIN,
                stats: {
                    price: BASE_COIN,
                },
                tags: ['Exchange', BASE_COIN],
                action: `/swap/${BASE_COIN}`,
                ru: {
                    title: 'BIP',
                    description: 'Приобретите основную монету Minter — единой децентрализованной сети с поддержкой многих цифровых активов.',
                    caption: 'Купить',
                },
            },
            {
                caption: 'Buy',
                title: 'BTC',
                description: 'Buy Bitcoin, the first cryptocurrency.',
                icon: 'BTC',
                stats: {

                },
                tags: ['Exchange', 'BTC'],
                action: '/swap/BTC',
                ru: {
                    title: 'BTC',
                    description: 'Приобретите Bitcoin, первую криптовалюту.',
                    caption: 'Купить',
                },
            },
            {
                caption: 'Buy',
                title: 'ETH',
                description: 'Ethereum is a decentralized open-source blockchain system that features its own cryptocurrency, Ether.',
                icon: 'ETH',
                stats: {

                },
                tags: ['Exchange', 'ETH'],
                action: '/swap/ETH',
                ru: {
                    title: 'ETH',
                    description: 'Ethereum — это платформа смарт-контрактов, которая позволяет разработчикам создавать децентрализованные приложения (DApps). Ether (ETH) - это нативная цифровая валюта платформы Ethereum.',
                    caption: 'Купить',
                },
            },
            {
                caption: 'Buy',
                title: 'BNB',
                description: 'BNB is the cryptocurrency coin that powers the Binance ecosystem. BNB is one of the world\'s most popular utility tokens.',
                icon: 'BNB',
                stats: {

                },
                tags: ['Exchange', 'BNB'],
                action: '/swap/BNB',
                ru: {
                    title: 'BNB',
                    description: 'BNB — это криптовалюта, которая поддерживает экосистему Binance. BNB является одним из самых популярных utility-токенов в мире.',
                    caption: 'Купить',
                },
            },
            {
                caption: 'Buy',
                title: 'TON',
                description: 'Get a base coin of the TON Blockchain, a project that aims to unite all existing blockchains and the Internet itself into a single Web 3.0 network.',
                icon: 'TON',
                stats: {

                },
                tags: ['Exchange', 'TON'],
                action: '/swap/TON',
                ru: {
                    title: 'TON',
                    description: 'Приобретите базовую монету TON — проекта, который стремится объединить все существующие блокчейны и сам Интернет в единую Web 3.0-сеть.',
                    caption: 'Купить',
                },
            },
            {
                caption: 'Buy',
                title: 'SQD',
                description: 'Buy a Minter-powered meme token brought to you by fans of a popular series Squid Game.',
                icon: 'SQD',
                stats: {

                },
                tags: ['Exchange', 'SQD'],
                action: '/swap/SQD',
                ru: {
                    title: 'SQD',
                    description: 'Приобретите мем-коин фан-клуба популярного сериала «Игра в кальмара», выпущенный на блокчейне Minter.',
                    caption: 'Купить',
                },
            },
            {
                caption: 'Buy',
                title: 'ARCONA',
                description: 'Get a native token of ARCONA metaverse  that allows you to purchase digital lands and place any models.',
                icon: 'ARCONA',
                stats: {

                },
                tags: ['Exchange', 'ARCONA'],
                action: '/swap/ARCONA',
                ru: {
                    title: 'ARCONA',
                    description: 'Приобретите нативный токен метавселенной ARCONA, позволяющий покупать цифровые земли и размещать любые модели.',
                    caption: 'Купить',
                },
            },
            {
                caption: 'Buy',
                title: 'GMTBSC',
                description: 'STEPN is a self-styled “Web3 lifestyle app” with GameFi elements. It combines aspects of a play-to-earn game with a fitness app to create a new category coined “move-to-earn.”',
                icon: 'GMTBSC',
                stats: {

                },
                tags: ['Exchange', 'GMTBSC'],
                action: '/swap/GMTBSC',
                ru: {
                    title: 'GMTBSC',
                    description: 'STEPN — это лайфстайл-приложение с элементами GameFi. Он сочетает в себе аспекты игры «играй, чтобы заработать» и фитнес-приложение с новой категорией «двигайся, чтобы зарабатывать».',
                    caption: 'Купить',
                },
            },
        ],
    },
};
