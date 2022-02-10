import {BASE_COIN} from '~/assets/variables.js';

export default {
    swap: [
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
            title: 'Buy SHIB',
            description: 'SHIBA INU is a 2020–2021 crypto phenomenon. A memecoin first, it soon became legendary making it in the top 10 cryptos and getting listed on the largest exchanges such as Coinbase.',
            icon: 'SHIB',
            stats: {
                price: 'SHIB',
            },
            tags: ['Exchange', 'SHIB'],
            action: '/swap/SHIB',
            ru: {
                title: 'Купить SHIB',
                description: 'SHIBA INU — крипто-феномен 2020–2021. Мемкойн, который вскоре стал легендарным и занял строчку в топ-10 криптовалют, а также был добавлен на крупнейшие биржи, такие как Coinbase.',
            },
        },  
        {
            title: 'Buy METAINDEX',
            description: 'METAINDEX (MVI on Ethereum) represents a basket of tokens of virtual worlds also known as metaverses.',
            icon: 'METAINDEX',
            stats: {
                price: 'METAINDEX',
            },
            tags: ['Exchange', 'METAINDEX'],
            action: '/swap/METAINDEX',
            ru: {
                title: 'Купить METAINDEX',
                description: 'METAINDEX (MVI на Ethereum) представляет собой корзину токенов виртуальных миров (метавселенных).',
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
            title: 'Buy UNIBSC',
            description: 'The UNI token serves the purpose of enabling shared community ownership in the growth and development of the Uniswap decentralized protocol.',
            icon: 'UNIBSC',
            stats: {
                price: 'UNIBSC',
            },
            tags: ['Exchange', 'UNIBSC'],
            action: '/swap/UNIBSC',
            ru: {
                title: 'Купить UNIBSC',
                description: 'Токен UNI служит для обеспечения совместного участия сообщества в росте и развитии децентрализованного протокола Uniswap.',
            },
        },
        {
            title: 'Buy DOGEBSC',
            description: 'Dogecoin (DOGE) is based on the popular "doge" Internet meme "doge", one of the most popular meme-tokens.',
            icon: 'DOGEBSC',
            stats: {
                price: 'DOGEBSC',
            },
            tags: ['Exchange', 'DOGEBSC'],
            action: '/swap/DOGEBSC',
            ru: {
                title: 'Купить DOGEBSC',
                description: 'Dogecoin (DOGE) родился из популярного интернет-мема «doge», один из самых популярных мем-токенов.',
            },
        },
        {
            title: 'Buy MATICBSC',
            description: 'The MATIC tokens are used for payment services on Polygon and as a settlement currency between users who operate within the Polygon ecosystem.',
            icon: 'MATICBSC',
            stats: {
                price: 'MATICBSC',
            },
            tags: ['Exchange', 'MATICBSC'],
            action: '/swap/MATICBSC',
            ru: {
                title: 'Купить MATICBSC',
                description: 'Токены MATIC используются для платежей на Polygon и в качестве валюты расчетов между пользователями, которые работают в экосистеме Polygon.',
            },
        },
        {
            title: 'Buy CAKEBSC',
            description: 'The PancakeSwap token CAKE is a BEP20 token that originally launched on Binance Smart Chain. The main function of CAKE is to incentivize the liquidity provision to the PancakeSwap platform.',
            icon: 'CAKEBSC',
            stats: {
                price: 'CAKEBSC',
            },
            tags: ['Exchange', 'CAKEBSC'],
            action: '/swap/CAKEBSC',
            ru: {
                title: 'Купить CAKEBSC',
                description: 'Токен PancakeSwap CAKE — это токен BEP20, который изначально был запущен на Binance Smart Chain. Основная функция CAKE — стимулировать предоставление ликвидности платформе PancakeSwap.',
            },
        },
    ],
    earn: [
        {
            title: `Delegation of ${BASE_COIN}`,
            description: '‘Tie’ your BIP to any validator of the Minter Network and start getting rewards every hour.',
            icon: BASE_COIN,
            stats: {
                caption: 'APY',
                value: '40%',
            },
            tags: ['Staking', BASE_COIN],
            action: `/delegate/${BASE_COIN}`,
            ru: {
                title: 'Делегирование BIP',
                description: '«Привяжите» свои BIP к любому валидатору сети Minter и начните получать награды каждый час.',
            },
        },
        {
            title: 'Yield farming HUB / BIP',
            description: 'Put your HUB and BIP into a liquidity pool to start getting extra daily rewards.',
            icon: ['HUB', 'BIP'],
            stats: {
                caption: 'APR in BIP',
                value: '36.5%',
            },
            tags: ['Farming', 'HUB', 'BIP'],
            action: '/farm/HUB/BIP',
            ru: {
                title: 'Фарминг HUB / BIP',
                description: 'Положите свои HUB и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
            },
        },
        {
            title: 'Yield farming BIP / USDTE',
            description: 'Put your BIP and USDTE into a liquidity pool to start getting extra daily rewards.',
            icon: ['BIP', 'USDTE'],
            stats: {
                caption: 'APR in USDTE',
                value: '36.5%',
            },
            tags: ['Farming', 'BIP', 'USDTE'],
            action: '/farm/BIP/USDTE',
            ru: {
                title: 'Фарминг BIP / USDTE',
                description: 'Положите свои BIP и USDTE в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
            },
        },
        {
            title: 'Yield farming UNIBSC / BIP',
            description: 'Put your UNIBSC and BIP into a liquidity pool to start getting extra daily rewards.',
            icon: ['UNIBSC', 'BIP'],
            stats: {
                caption: 'APR in BIP',
                value: '124%',
            },
            tags: ['Farming', 'UNIBSC', 'BIP'],
            action: '/farm/UNIBSC/BIP',
            ru: {
                title: 'Фарминг UNIBSC / BIP',
                description: 'Положите свои UNIBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
            },
        },
        {
            title: 'Yield farming DOGEBSC / BIP',
            description: 'Put your DOGEBSC and BIP into a liquidity pool to start getting extra daily rewards.',
            icon: ['DOGEBSC', 'BIP'],
            stats: {
                caption: 'APR in BIP',
                value: '124%',
            },
            tags: ['Farming', 'DOGEBSC', 'BIP'],
            action: '/farm/DOGEBSC/BIP',
            ru: {
                title: 'Фарминг DOGEBSC / BIP',
                description: 'Положите свои DOGEBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
            },
        },
        {
            title: 'Yield farming MATICBSC / BIP',
            description: 'Put your MATICBSC and BIP into a liquidity pool to start getting extra daily rewards.',
            icon: ['MATICBSC', 'BIP'],
            stats: {
                caption: 'APR in BIP',
                value: '124%',
            },
            tags: ['Farming', 'MATICBSC', 'BIP'],
            action: '/farm/MATICBSC/BIP',
            ru: {
                title: 'Фарминг MATICBSC / BIP',
                description: 'Положите свои MATICBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
            },
        },
        {
            title: 'Yield farming CAKEBSC / BIP',
            description: 'Put your CAKEBSC and BIP into a liquidity pool to start getting extra daily rewards.',
            icon: ['CAKEBSC', 'BIP'],
            stats: {
                caption: 'APR in BIP',
                value: '124%',
            },
            tags: ['Farming', 'CAKEBSC', 'BIP'],
            action: '/farm/CAKEBSC/BIP',
            ru: {
                title: 'Фарминг CAKEBSC / BIP',
                description: 'Положите свои CAKEBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
            },
        },
        {
            title: 'Yield farming HUB / BNB',
            description: 'Put your HUB and BNB into a liquidity pool to start getting extra daily rewards.',
            icon: ['HUB', 'BNB'],
            stats: {
                caption: 'APR in HUB',
                value: '36.5%',
            },
            tags: ['Farming', 'HUB', 'BNB'],
            action: '/farm/HUB/BNB',
            ru: {
                title: 'Фарминг HUB / BNB',
                description: 'Положите свои HUB и BNB в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
            },
        },
    ],
};
