import {BASE_COIN} from '~/assets/variables.js';

export default {
    swap: [
        {
            title: `Buy ${BASE_COIN}`,
            description: 'Top up your balance with any of the supported cryptos to buy BIP.',
            icon: BASE_COIN,
            // color: '#fa5a00',
            stats: {
                price: BASE_COIN,
            },
            tags: ['Exchange', BASE_COIN],
            action: `/swap/${BASE_COIN}`,
            ru: {
                title: 'Купить BIP',
                description: 'Купите основную монету сети Minter и заработайте на росте курса.',
            },
        },
        {
            title: 'Buy HUB',
            description: 'Top up your balance with any of the supported cryptos to buy HUB.',
            icon: 'HUB',
            // color: '#fa5a00',
            stats: {
                price: 'HUB',
            },
            tags: ['Exchange', 'HUB'],
            action: '/swap/HUB',
            ru: {
                title: 'Купить HUB',
                description: 'Купите основную монету сайдчейна Minter Hub и заработайте на росте курса.',
            },
        },
        {
            title: 'Buy BEE',
            description: 'Top up your balance with any of the supported cryptos to buy BEE.',
            icon: 'BEE',
            // color: '#fa5a00',
            stats: {
                price: 'BEE',
            },
            tags: ['Exchange', 'BEE'],
            action: '/swap/BEE',
            ru: {
                title: 'Купить BEE',
                description: 'Купите основную монету кошелька Honee и заработайте на росте курса.',
            },
        },
    ],
    earn: [
        {
            title: `Delegate ${BASE_COIN}`,
            description: '‘Tie’ your BIP to any validator of the Minter Network and start getting rewards every hour.',
            icon: BASE_COIN,
            color: '#fa5a00',
            stats: {
                caption: 'APY',
                value: '40%',
            },
            tags: ['Staking', BASE_COIN],
            action: `/delegate/${BASE_COIN}`,
        },
        {
            title: 'Yield farming BEE / MUSD',
            description: 'Put your BEE and MUSD into a liquidity pool to start getting extra daily rewards.',
            icon: ['BEE', 'MUSD'],
            color: '#3f9c37',
            stats: {
                caption: 'APR in BEE',
                value: '100%',
            },
            tags: ['Farming', 'BEE', 'MUSD'],
            action: '/farm/BEE/MUSD',
        },
        {
            title: 'Yield farming USDTE / USDCE',
            description: 'Put your USDTE and USDCE into a liquidity pool to start getting extra daily rewards.',
            icon: ['USDTE', 'USDCE'],
            color: '#2ea496',
            stats: {
                caption: 'APR in BIP',
                value: '36.5%',
            },
            tags: ['Farming', 'USDTE', 'USDCE'],
            action: '/farm/USDTE/USDCE',
        },
    ],
    win: [
        {
            title: 'DONUT',
            description: 'Keep providing DONUT into a pool with BIP to increase your chances of winning by random.',
            icon: 'DONUT',
            color: '#c71b6e',
            stats: {
                caption: 'GIVEAWAY',
                value: '1%',
            },
            tags: ['Lottery', 'DONUT'],
            action: '/win/DONUT/BIP',
        },
    ],
};
