import {BASE_COIN} from '~/assets/variables.js';

export default {
    swap: {
        title: 'Buy',
        cards: [
            {
                title: 'Buy BTC',
                description: 'Buy Bitcoin, the first cryptocurrency.',
                icon: 'BTC',
                stats: {
                    price: 'BTC',
                },
                tags: ['Exchange', 'BTC'],
                action: '/swap/BTC',
                ru: {
                    title: 'Купить BTC',
                    description: 'Приобретите Bitcoin, первую криптовалюту.',
                },
            },
            {
                title: 'Buy ETH',
                description: 'Buy Ether.',
                icon: 'ETH',
                stats: {
                    price: 'ETH',
                },
                tags: ['Exchange', 'ETH'],
                action: '/swap/ETH',
                ru: {
                    title: 'Купить ETH',
                    description: 'Приобретите основную монету сети Ethereum.',
                },
            },
            {
                title: 'Buy TON',
                description: 'Get a base coin of the TON Blockchain, a project that aims to unite all existing blockchains and the Internet itself into a single Web 3.0 network.',
                icon: 'TON',
                stats: {
                    price: 'TON',
                },
                tags: ['Exchange', 'TON'],
                action: '/swap/TON',
                ru: {
                    title: 'Купить TON',
                    description: 'Приобретите базовую монету TON — проекта, который стремится объединить все существующие блокчейны и сам Интернет в единую Web 3.0-сеть.',
                },
            },
            {
                title: 'Buy BNB',
                description: 'BNB is the cryptocurrency coin that powers the Binance ecosystem. BNB is one of the world\'s most popular utility tokens.',
                icon: 'BNB',
                stats: {
                    price: 'BNB',
                },
                tags: ['Exchange', 'BNB'],
                action: '/swap/BNB',
                ru: {
                    title: 'Купить BNB',
                    description: 'BNB — это криптовалюта, которая поддерживает экосистему Binance. BNB является одним из самых популярных utility-токенов в мире.',
                },
            },
            {
                title: 'Buy LUNABSC',
                description: 'Terra\'s native token, LUNA, is used to stabilize the price of the protocol\'s stablecoins. LUNA holders are also able to submit and vote on governance proposals, giving it the functionality of a governance token.',
                icon: 'LUNABSC',
                stats: {
                    price: 'LUNABSC',
                },
                tags: ['Exchange', 'LUNABSC'],
                action: '/swap/LUNABSC',
                ru: {
                    title: 'Купить LUNABSC',
                    description: 'Нативный токен Terra, LUNA, используется для стабилизации цены стейблкоинов протокола. Владельцы LUNA также могут подавать предложения по управлению и голосовать за них, придавая ему функциональность токена управления.',
                },
            },
            {
                title: `Buy ${BASE_COIN}`,
                description: 'Get native digital coin of Minter, a single decentralized network supporting many digital assets.',
                icon: BASE_COIN,
                stats: {
                    price: BASE_COIN,
                },
                tags: ['Exchange', BASE_COIN],
                action: `/swap/${BASE_COIN}`,
                ru: {
                    title: 'Купить BIP',
                    description: 'Приобретите основную монету Minter — единой децентрализованной сети с поддержкой многих цифровых активов.',
                },
            },
            {
                title: 'Buy HUB',
                description: 'Get native digital token of Minter Hub, a cross-chain bridge to global crypto liquidity.',
                icon: 'HUB',
                stats: {
                    price: 'HUB',
                },
                tags: ['Exchange', 'HUB'],
                action: '/swap/HUB',
                ru: {
                    title: 'Купить HUB',
                    description: 'Приобретите основной токен Minter Hub — кросс-чейн моста в глобальную криптоликвидность.',
                },
            },
            {
                title: 'Buy BEE',
                description: 'Get native digital coin of Honee, a simple crypto wallet that helps you earn.',
                icon: 'BEE',
                stats: {
                    price: 'BEE',
                },
                tags: ['Exchange', 'BEE'],
                action: '/swap/BEE',
                ru: {
                    title: 'Купить BEE',
                    description: 'Приобретите основную монету Honee — простейшего криптокошелька, который помогает вам зарабатывать.',
                },
            },
            {
                title: 'Buy SQD',
                description: 'Buy a Minter-powered meme token brought to you by fans of a popular series Squid Game.',
                icon: 'SQD',
                stats: {
                    price: 'SQD',
                },
                tags: ['Exchange', 'SQD'],
                action: '/swap/SQD',
                ru: {
                    title: 'Купить SQD',
                    description: 'Приобретите мем-коин фан-клуба популярного сериала «Игра в кальмара», выпущенный на блокчейне Minter.',
                },
            },
            {
                title: 'Buy ARCONA',
                description: 'Get a native token of ARCONA metaverse  that allows you to purchase digital lands and place any models.',
                icon: 'ARCONA',
                stats: {
                    price: 'ARCONA',
                },
                tags: ['Exchange', 'ARCONA'],
                action: '/swap/ARCONA',
                ru: {
                    title: 'Купить ARCONA',
                    description: 'Приобретите нативный токен метавселенной ARCONA, позволяющий покупать цифровые земли и размещать любые модели.',
                },
            },
            {
                title: 'Buy GMTBSC',
                description: 'STEPN is a self-styled “Web3 lifestyle app” with GameFi elements. It combines aspects of a play-to-earn game with a fitness app to create a new category coined “move-to-earn.”',
                icon: 'GMTBSC',
                stats: {
                    price: 'GMTBSC',
                },
                tags: ['Exchange', 'GMTBSC'],
                action: '/swap/GMTBSC',
                ru: {
                    title: 'Купить GMTBSC',
                    description: 'STEPN — это лайфстайл-приложение с элементами GameFi. Он сочетает в себе аспекты игры «играй, чтобы заработать» и фитнес-приложение с новой категорией «двигайся, чтобы зарабатывать».',
                },
            },
        ],
    },
    earn: {
        cards: [
            {
                title: `Delegation of ${BASE_COIN}`,
                description: '‘Tie’ your BIP to any validator of the Minter Network and start getting rewards every hour.',
                icon: BASE_COIN,
                stats: {
                    caption: 'APY',
                    value: '10%',
                },
                tags: ['Staking', BASE_COIN],
                action: `/delegate/${BASE_COIN}`,
                ru: {
                    title: 'Делегирование BIP',
                    description: '«Привяжите» свои BIP к любому валидатору сети Minter и начните получать награды каждый час.',
                },
            },
            {
                title: 'Yield farming HUB / BNB',
                description: 'Put your HUB and BNB into a liquidity pool to start getting extra daily rewards.',
                icon: ['HUB', 'BNB'],
                stats: {
                    caption: 'APR in HUB',
                    value: '121.5%',
                },
                tags: ['Farming', 'HUB', 'BNB'],
                action: '/farm/HUB/BNB',
                ru: {
                    title: 'Фарминг HUB / BNB',
                    description: 'Положите свои HUB и BNB в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming BIP / MUSD',
                description: 'Put your BIP and MUSD into a liquidity pool to start getting extra daily rewards.',
                icon: ['BIP', 'MUSD'],
                stats: {
                    caption: 'APR in BIP',
                    value: '121.5%',
                },
                tags: ['Farming', 'BIP', 'MUSD'],
                action: '/farm/BIP/MUSD',
                ru: {
                    title: 'Фарминг BIP / MUSD',
                    description: 'Положите свои BIP и MUSD в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming BEE / MUSD',
                description: 'Put your BEE and MUSD into a liquidity pool to start getting extra daily rewards.',
                icon: ['BEE', 'MUSD'],
                stats: {
                    caption: 'APR in MUSD',
                    value: '121.5%',
                },
                tags: ['Farming', 'BEE', 'MUSD'],
                action: '/farm/BEE/MUSD',
                ru: {
                    title: 'Фарминг BEE / MUSD',
                    description: 'Положите свои BEE и MUSD в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming LUNABSC / HUB',
                description: 'Put your LUNABSC and HUB into a liquidity pool to start getting extra daily rewards.',
                icon: ['LUNABSC', 'HUB'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'LUNABSC', 'HUB'],
                action: '/farm/LUNABSC/HUB',
                ru: {
                    title: 'Фарминг LUNABSC / HUB',
                    description: 'Положите свои LUNABSC и HUB в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming GMTBSC / BIP',
                description: 'Put your GMTBSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['GMTBSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'GMTBSC', 'BIP'],
                action: '/farm/GMTBSC/BIP',
                ru: {
                    title: 'Фарминг GMTBSC / BIP',
                    description: 'Положите свои GMTBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
        ],
    },
};
