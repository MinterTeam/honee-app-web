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
            {
                title: 'Yield farming TORNBSC / BIP',
                description: 'Put your TORNBSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['TORNBSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'TORNBSC', 'BIP'],
                action: '/farm/TORNBSC/BIP',
                ru: {
                    title: 'Фарминг TORNBSC / BIP',
                    description: 'Положите свои TORNBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming INJBSC / BIP',
                description: 'Put your INJBSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['INJBSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'INJBSC', 'BIP'],
                action: '/farm/INJBSC/BIP',
                ru: {
                    title: 'Фарминг INJBSC / BIP',
                    description: 'Положите свои INJBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming NEARBSC / BIP',
                description: 'Put your NEARBSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['NEARBSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'NEARBSC', 'BIP'],
                action: '/farm/NEARBSC/BIP',
                ru: {
                    title: 'Фарминг NEARBSC / BIP',
                    description: 'Положите свои NEARBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming BANDBSC / BIP',
                description: 'Put your BANDBSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['BANDBSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'BANDBSC', 'BIP'],
                action: '/farm/BANDBSC/BIP',
                ru: {
                    title: 'Фарминг BANDBSC / BIP',
                    description: 'Положите свои BANDBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming INSURBSC / BIP',
                description: 'Put your INSURBSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['INSURBSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'INSURBSC', 'BIP'],
                action: '/farm/INSURBSC/BIP',
                ru: {
                    title: 'Фарминг INSURBSC / BIP',
                    description: 'Положите свои INSURBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming USDCBSC / BIP',
                description: 'Put your USDCBSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['USDCBSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'USDCBSC', 'BIP'],
                action: '/farm/USDCBSC/BIP',
                ru: {
                    title: 'Фарминг USDCBSC / BIP',
                    description: 'Положите свои USDCBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming NFTBSC / BIP',
                description: 'Put your NFTBSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['NFTBSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'NFTBSC', 'BIP'],
                action: '/farm/NFTBSC/BIP',
                ru: {
                    title: 'Фарминг NFTBSC / BIP',
                    description: 'Положите свои NFTBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming MBOXBSC / BIP',
                description: 'Put your MBOXBSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['MBOXBSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'MBOXBSC', 'BIP'],
                action: '/farm/MBOXBSC/BIP',
                ru: {
                    title: 'Фарминг MBOXBSC / BIP',
                    description: 'Положите свои MBOXBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming ALICEBSC / BIP',
                description: 'Put your ALICEBSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['ALICEBSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'ALICEBSC', 'BIP'],
                action: '/farm/ALICEBSC/BIP',
                ru: {
                    title: 'Фарминг ALICEBSC / BIP',
                    description: 'Положите свои ALICEBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming AXSBSC / BIP',
                description: 'Put your AXSBSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['AXSBSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'AXSBSC', 'BIP'],
                action: '/farm/AXSBSC/BIP',
                ru: {
                    title: 'Фарминг AXSBSC / BIP',
                    description: 'Положите свои AXSBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming DEGOBSC / BIP',
                description: 'Put your DEGOBSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['DEGOBSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'DEGOBSC', 'BIP'],
                action: '/farm/DEGOBSC/BIP',
                ru: {
                    title: 'Фарминг DEGOBSC / BIP',
                    description: 'Положите свои DEGOBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
            {
                title: 'Yield farming DAIBSC / BIP',
                description: 'Put your DAIBSC and BIP into a liquidity pool to start getting extra daily rewards.',
                icon: ['DAIBSC', 'BIP'],
                stats: {
                    caption: 'APR in BIP',
                    value: '124%',
                },
                tags: ['Farming', 'DAIBSC', 'BIP'],
                action: '/farm/DAIBSC/BIP',
                ru: {
                    title: 'Фарминг DAIBSC / BIP',
                    description: 'Положите свои DAIBSC и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
                },
            },
        ],
    },
};
