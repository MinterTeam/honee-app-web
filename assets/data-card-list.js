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
            title: 'Yield farming BEE / MUSD',
            description: 'Put your BEE and MUSD into a liquidity pool to start getting extra daily rewards.',
            icon: ['BEE', 'MUSD'],
            stats: {
                caption: 'APR in BEE',
                value: '100%',
            },
            tags: ['Farming', 'BEE', 'MUSD'],
            action: '/farm/BEE/MUSD',
            ru: {
                title: 'Фарминг BEE / MUSD',
                description: 'Положите свои BEE и MUSD в пул ликвидности и начните получать дополнительные вознаграждения ежедневно.',
            },
        },
        {
            title: 'Yield farming USDTE / USDCE',
            description: 'Put your USDTE and USDCE into a liquidity pool to start getting extra daily rewards.',
            icon: ['USDTE', 'USDCE'],
            stats: {
                caption: 'APR in BIP',
                value: '36.5%',
            },
            tags: ['Farming', 'USDTE', 'USDCE'],
            action: '/farm/USDTE/USDCE',
            ru: {
                title: 'Фарминг USDTE / USDCE',
                description: 'Положите свои USDT и USDC в пул ликвидности и начните получать дополнительные вознаграждения ежедневно.',
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
    ],
};
