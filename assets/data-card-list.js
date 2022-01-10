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
            title: 'Buy TON for ETH',
            description: 'Get a base coin of the TON Blockchain, a project that aims to unite all existing blockchains and the Internet itself into a single Web 3.0 network.',
            icon: 'TON',
            stats: {
                price: 'TON',
            },
            tags: ['Deposit', 'TON'],
            action: '/buy/TON',
            ru: {
                title: 'Купить TON за ETH',
                description: 'Приобретите базовую монету TON — проекта, который стремится объединить все существующие блокчейны и сам Интернет в единую Web 3.0-сеть.',
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
            title: 'Buy SHIB for ETH',
            description: 'SHIBA INU is a 2020–2021 crypto phenomenon. A memecoin first, it soon became legendary making it in the top 10 cryptos and getting listed on the largest exchanges such as Coinbase.',
            icon: 'SHIB',
            stats: {
                price: 'SHIB',
            },
            tags: ['Deposit', 'SHIB'],
            action: '/buy/SHIB',
            ru: {
                title: 'Купить SHIB за ETH',
                description: 'SHIBA INU — крипто-феномен 2020–2021. Мемкойн, который вскоре стал легендарным и занял строчку в топ-10 криптовалют, а также был добавлен на крупнейшие биржи, такие как Coinbase.',
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
            title: 'Buy METAINDEX for ETH',
            description: 'METAINDEX (MVI on Ethereum) represents a basket of tokens of virtual worlds also known as metaverses.',
            icon: 'METAINDEX',
            stats: {
                price: 'METAINDEX',
            },
            tags: ['Deposit', 'METAINDEX'],
            action: '/buy/METAINDEX',
            ru: {
                title: 'Купить METAINDEX за ETH',
                description: 'METAINDEX (MVI на Ethereum) представляет собой корзину токенов виртуальных миров (метавселенных).',
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
            title: 'Yield farming BNB / BIP',
            description: 'Put your BNB and BIP into a liquidity pool to start getting extra daily rewards.',
            icon: ['BNB', 'BIP'],
            stats: {
                caption: 'APR in BNB',
                value: '36.5%',
            },
            tags: ['Farming', 'BNB', 'BIP'],
            action: '/farm/BNB/BIP',
            ru: {
                title: 'Фарминг BNB / BIP',
                description: 'Положите свои BNB и BIP в пул ликвидности и получайте дополнительные вознаграждения ежедневно.',
            },
        },
    ],
    win: [
        {
            title: 'DONUT',
            description: 'Provide liquidity to the DONUT-BIP pool to take part in daily giveaways. The more liquidity you provide, the better the chances you have!',
            icon: 'DONUT',
            stats: {
                caption: 'GIVEAWAY',
                value: '1%',
            },
            tags: ['Lottery', 'DONUT'],
            action: '/win/DONUT/BIP',
            ru: {
                title: 'DONUT',
                description: 'Предоставляйте ликвидность в пул DONUT-BIP, чтобы участвовать в ежедневной лотерее. Чем выше ликвидность, тем больше шансов!',
            },
        },
        {
            title: 'HUBABUBA',
            description: 'Provide liquidity to the HUBABUBA-HUB pool to take part in daily giveaways. The more liquidity you provide, the better the chances you have!',
            icon: 'HUBABUBA',
            stats: {
                caption: 'GIVEAWAY',
                value: 'Up to 1%',
            },
            tags: ['Lottery', 'HUBABUBA'],
            action: '/win/HUBABUBA/HUB',
            ru: {
                title: 'HUBABUBA',
                description: 'Предоставляйте ликвидность в пул HUBABUBA-HUB, чтобы участвовать в ежедневной лотерее. Чем выше ликвидность, тем больше шансов!',
            },
        },
    ],
};
