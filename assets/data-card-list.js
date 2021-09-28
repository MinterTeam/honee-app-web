export default {
    swap: [
        {
            title: 'Buy BIP',
            description: 'Top up your balance with any of the supported cryptos to buy BIP.',
            icon: 'BIP',
            // color: '#fa5a00',
            stats: {
                price: 'BIP',
            },
            tags: ['Exchange', 'BIP'],
            action: '/swap/BIP',
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
        },
    ],
    earn: [
        {
            title: 'Delegate BIP',
            description: '‘Tie’ your BIP to any validator of the Minter Network and start getting rewards every hour.',
            icon: 'BIP',
            color: '#fa5a00',
            stats: {
                caption: 'APY',
                value: '40%',
            },
            tags: ['Staking', 'BIP'],
            action: '/delegate/BIP',
        },
        {
            title: 'Yield farming BEE / MUSD',
            description: 'Put your BEE and MUSD into a liquidity pool to start getting extra daily rewards.',
            icon: ['BEE', 'MUSD'],
            color: '#3f9c37',
            stats: {
                caption: 'APR in BEE',
                value: '36.5%',
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
