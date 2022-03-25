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
            {
                title: 'Buy DOTBSC',
                description: 'Polkadot’s native DOT token serves three clear purposes: staking for operations and security, facilitating network governance, and bonding tokens to connect parachains.',
                icon: 'DOTBSC',
                stats: {
                    price: 'DOTBSC',
                },
                tags: ['Exchange', 'DOTBSC'],
                action: '/swap/DOTBSC',
                ru: {
                    title: 'Купить DOTBSC',
                    description: 'Токен DOT (Polkadot), выполняет три основные задачи: обеспечивает управление сетью, ее операционную деятельность, а также задействован в создании парачейнов.',
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
                title: 'Buy ALPACA',
                description: 'Alpaca Finance is the largest lending protocol allowing leveraged yield farming on BNB Chain.',
                icon: 'ALPACA',
                stats: {
                    price: 'ALPACA',
                },
                tags: ['Exchange', 'ALPACA'],
                action: '/swap/ALPACA',
                ru: {
                    title: 'Купить ALPACA',
                    description: 'Alpaca Finance – это крупнейший протокол кредитования, позволяющий получать высокую доходность в доходном фермерстве на BNB Chain.',
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
                title: 'Yield farming SUSHIBSC / BIP',
                description: 'Put your SUSHIBSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['SUSHIBSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'SUSHIBSC', 'BIP'],
                action: '/farm/SUSHIBSC/BIP',
                ru: {
                    title: 'Фарминг SUSHIBSC / BIP',
                    description: 'Положите свои SUSHIBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming BAKEBSC / BIP',
                description: 'Put your BAKEBSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['BAKEBSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'BAKEBSC', 'BIP'],
                action: '/farm/BAKEBSC/BIP',
                ru: {
                    title: 'Фарминг BAKEBSC / BIP',
                    description: 'Положите свои BAKEBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming ANYBSC / BIP',
                description: 'Put your ANYBSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['ANYBSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'ANYBSC', 'BIP'],
                action: '/farm/ANYBSC/BIP',
                ru: {
                    title: 'Фарминг ANYBSC / BIP',
                    description: 'Положите свои ANYBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming DODOBSC / BIP',
                description: 'Put your DODOBSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['DODOBSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'DODOBSC', 'BIP'],
                action: '/farm/DODOBSC/BIP',
                ru: {
                    title: 'Фарминг DODOBSC / BIP',
                    description: 'Положите свои DODOBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming BANANABSC / BIP',
                description: 'Put your BANANABSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['BANANABSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'BANANABSC', 'BIP'],
                action: '/farm/BANANABSC/BIP',
                ru: {
                    title: 'Фарминг BANANABSC / BIP',
                    description: 'Положите свои BANANABSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming BURGERBSC / BIP',
                description: 'Put your BURGERBSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['BURGERBSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'BURGERBSC', 'BIP'],
                action: '/farm/BURGERBSC/BIP',
                ru: {
                    title: 'Фарминг BURGERBSC / BIP',
                    description: 'Положите свои BURGERBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming BSWBSC / BIP',
                description: 'Put your BSWBSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['BSWBSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'BSWBSC', 'BIP'],
                action: '/farm/BSWBSC/BIP',
                ru: {
                    title: 'Фарминг BSWBSC / BIP',
                    description: 'Положите свои BSWBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming POWERBANK / BIP',
                description: 'Put your POWERBANK and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['POWERBANK', 'BIP'],
                stats: {
                    caption: 'APR in POWERBANK',
                    value: '36.5%',
                },
                tags: ['Farming', 'POWERBANK', 'BIP'],
                action: '/farm/POWERBANK/BIP',
                ru: {
                    title: 'Фарминг POWERBANK / BIP',
                    description: 'Положите свои POWERBANK и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming SQD / BIP',
                description: 'Put your SQD and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['SQD', 'BIP'],
                stats: {
                    caption: 'APR in MUSD',
                    value: '124%',
                },
                tags: ['Farming', 'SQD', 'BIP'],
                action: '/farm/SQD/BIP',
                ru: {
                    title: 'Фарминг SQD / BIP',
                    description: 'Положите свои SQD и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming ADABSC / BIP',
                description: 'Put your ADABSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['ADABSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'ADABSC', 'BIP'],
                action: '/farm/ADABSC/BIP',
                ru: {
                    title: 'Фарминг ADABSC / BIP',
                    description: 'Положите свои ADABSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming LINKBSC / BIP',
                description: 'Put your LINKBSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['LINKBSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'LINKBSC', 'BIP'],
                action: '/farm/LINKBSC/BIP',
                ru: {
                    title: 'Фарминг LINKBSC / BIP',
                    description: 'Положите свои LINKBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming XRPBSC / BIP',
                description: 'Put your XRPBSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['XRPBSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'XRPBSC', 'BIP'],
                action: '/farm/XRPBSC/BIP',
                ru: {
                    title: 'Фарминг XRPBSC / BIP',
                    description: 'Положите свои XRPBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming ATOMBSC / BIP',
                description: 'Put your ATOMBSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['ATOMBSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'ATOMBSC', 'BIP'],
                action: '/farm/ATOMBSC/BIP',
                ru: {
                    title: 'Фарминг ATOMBSC / BIP',
                    description: 'Положите свои ATOMBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming COMPBSC / BIP',
                description: 'Put your COMPBSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['COMPBSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'COMPBSC', 'BIP'],
                action: '/farm/COMPBSC/BIP',
                ru: {
                    title: 'Фарминг COMPBSC / BIP',
                    description: 'Положите свои COMPBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming LTCBSC / BIP',
                description: 'Put your LTCBSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['LTCBSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'LTCBSC', 'BIP'],
                action: '/farm/LTCBSC/BIP',
                ru: {
                    title: 'Фарминг LTCBSC / BIP',
                    description: 'Положите свои LTCBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming AAVEBSC / BIP',
                description: 'Put your AAVEBSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['AAVEBSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'AAVEBSC', 'BIP'],
                action: '/farm/AAVEBSC/BIP',
                ru: {
                    title: 'Фарминг AAVEBSC / BIP',
                    description: 'Положите свои AAVEBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming TWTBSC / BIP',
                description: 'Put your TWTBSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['TWTBSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'TWTBSC', 'BIP'],
                action: '/farm/TWTBSC/BIP',
                ru: {
                    title: 'Фарминг TWTBSC / BIP',
                    description: 'Положите свои TWTBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming C98BSC / BIP',
                description: 'Put your C98BSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['C98BSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'C98BSC', 'BIP'],
                action: '/farm/C98BSC/BIP',
                ru: {
                    title: 'Фарминг C98BSC / BIP',
                    description: 'Положите свои C98BSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming SFPBSC / BIP',
                description: 'Put your SFPBSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['SFPBSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'SFPBSC', 'BIP'],
                action: '/farm/SFPBSC/BIP',
                ru: {
                    title: 'Фарминг SFPBSC / BIP',
                    description: 'Положите свои SFPBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
        ],
    },
    win: {
        cards: [
            {
                title: 'BIP',
                description: 'Provide liquidity to the BIP-MUSD pool to take part in daily giveaways.',
                icon: 'BIP',
                stats: {
                    caption: 'GIVEAWAY',
                    value: '33.3%',
                },
                tags: ['Lottery', 'BIP'],
                action: '/win/BIP/MUSD',
                ru: {
                    title: 'BIP',
                    description: 'Предоставляйте ликвидность в пул BIP-MUSD, чтобы участвовать в ежедневной лотерее.',
                },
            },
        ],
    },
};
