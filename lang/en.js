export default {
    index: {
        'features-description': 'Find out why Honee is {0} crypto wallet',

        'investments-tabs-label-0': 'Everything',
        'investments-tabs-label-portfolio': 'Portfolios',
        'investments-tabs-label-stake': 'Stakes',
    },
    action: {
        'title-buy': 'Buy BIP, HUB, & BEE',
        'title-buy-coin': 'Buy {coin}',
        'title-swap': 'Swap coins',
        'title-swap-combined': 'Swap {coin0} {conjunction} {coin1}',
        'title-swap-coin0-empty': 'coins',
        'title-swap-conjunction': 'for',
        'title-swap-bsc': 'Swap via BSC',
        'title-send': 'Send coins',
        'title-win': 'Win',
        'title-farm': 'Yield farm',
        'title-add-liquidity': 'Provide liquidity to pool',
        'title-add-liquidity-zap': 'Provide liquidity to pool',
        'title-remove-liquidity': 'Remove liquidity from pool',
        'title-delegate': 'Delegate',
        'title-unbond': 'Unbond',
        'title-stake': 'Stake & Earn',
        'title-not-found': 'Action not found',
    },
    premium: {
        'activate-title': 'Become a Premium user',
        'activate-title-short': 'Get Premium',
    },
    portfolio: {
        'warning-price-impact-description': 'You will lose ≈{impact}% of coins because of fees and/or low liquidity pools involved in swaps. Try to change the spending amount.',
    },
    form: {
        'delegation-delegate-confirm-note': 'Note: in case of unbond, your coins will return to your address in approximately <strong>30&nbsp;days</strong> (518&#x202F;400 blocks) and will not be generating rewards during this&nbsp;period.',
        'delegation-unbond-confirm-description': 'If you unbond coins, they will return to your address in approximately <strong>30&nbsp;days</strong> (518&#x202F;400 blocks) and will not be generating rewards during this&nbsp;period.',
        'delegation-move-confirm-description': 'Are you sure you want to move your coins? They will appear to new masternode in approximately <strong>30&nbsp;days</strong> (518&#x202F;400 blocks) and will not be generating rewards during this period.',
    },
    'mg-lootbox': {
        'new-lootbox-button-plural': 'a new lootbox | {n} lootboxes',
    },
    borrow: {
        you_pledge: "You pledge",
        you_borrow: "You borrow",
        approve: "Approve",
        borrow: "Borrow",
        not_enough_usd: "Not enough {coin1name} in the pool. Change will be returned back to you.",
        terms_and_rules: '<div class="block">\n' +
            '              <h5 class="title is-h5">Description</h5>\n' +
            '              This service lets you quickly get {coin1name} by putting up your {coin0name} tokens as collateral. You can repay {coin1name} within 365 days; the longer the period, the bigger the interest rate. If the {coin0name} you’ve put up decreases in price by 25% or more, the lender may claim it. In such case, you won’t have to repay {coin1name}.\n' +
            '            </div>\n' +
            '\n' +
            '            <div class="block">\n' +
            '              <h5 class="title is-h5">Example</h5>\n' +
            '              You have 10 {coin0name} that is worth 200 {coin1name}. By putting up 10 {coin0name}, you borrow 100 {coin1name} (two times less). Say, in 6 months’ time, you want to repay the loan, so you’ll have to send 106 {coin1name} (100 {coin1name} + 6% accrued over that period) in order to get your 10 {coin0name} back. If the total worth of 10 {coin0name}s and the interest generated went down to 154.5 {coin1name} (-25%), the lender would have the right to keep your {coin0name}s, meaning you wouldn’t have to return 106 {coin1name} anymore.\n' +
            '            </div>\n' +
            '\n' +
            '            <div class="block">\n' +
            '              <h5 class="title is-h5">Terms</h5>\n' +
            '              <ul>\n' +
            '                <li>You will receive 50% of pledged {coin0name} value in {coin1name}.</li>\n' +
            '                <li>The interest is 12% per annum. 1% is charged once you receive {coin1name} and then continues to charge every 30th day.</li>\n' +
            '                <li>You will pay interest at the time of repaying the debt.</li>\n' +
            '                <li>If the collateral of the loan (loan + accrued interest) falls below 150%, the pledged amount of {coin0name} may be transferred to the lender.</li>\n' +
            '                <li>You can return {coin1name} + % for the period of usage at any time in order to receive your {coin0name} back.</li>\n' +
            '                <li>The maximum loan period is 365 days. If by this time, you will not have returned the {coin1name}, then {coin0name} may be transferred to the lender.</li>\n' +
            '                <li>The minimum loan amount is $1.</li>\n' +
            '              </ul>\n' +
            '            </div>',
        loans_form: {
            title: "Loans",
            date: "Date",
            borrowed: "Borrowed",
            pledged: "Pledged",
            to_repay: "To repay",
            approve: "Approve",
            repay: "Repay with {coin1name}",
            sell_and_repay: "Sell {coin0name} & Repay",
            closed: "CLOSED",
        },
    },
    lend: {
        you_lend: "You lend",
        approve: "Approve",
        lend: "Lend",
        terms_and_rules: '<div class="block">\n' +
            '              <h5 class="title is-h5">Description</h5>\n' +
            '              This service lets you lend your {coin1name} and earn interest. Before the borrower gets your {coin1name}, they put up their {coin0name} tokens as collateral. If these tokens decrease in price by 25% or more, you may claim them. In such case, the borrower won’t have to repay {coin1name}, while you’ll be able to sell their {coin0name}.\n' +
            '            </div>\n' +
            '\n' +
            '            <div class="block">\n' +
            '              <h5 class="title is-h5">Example</h5>\n' +
            '              You’re lending 100 {coin1name} to the borrower who puts up 10 {coin0name} worth 200 {coin1name} in return (two times the worth of your {coin1name}). Say, in 6 months’ time, the borrower wants to repay the loan, so they send you 106 {coin1name} (100 {coin1name} + 6% accrued over that period) and get their 10 {coin0name} back. If the total worth of 10 {coin0name}s and the interest generated were to go down to 154.5 {coin1name} (-25%), you’d have the right to keep the borrower’s {coin0name}s, while the borrower wouldn’t have to return 106 {coin1name} anymore.\n' +
            '            </div>\n' +
            '\n' +
            '            <div class="block">\n' +
            '              <h5 class="title is-h5">Terms</h5>\n' +
            '              <ul>\n' +
            '                <li>You can send {coin1name} and wait for someone to borrow it.</li>\n' +
            '                <li>If there is more than 1 lender in the queue, then the funds are used according to the FIFO algorithm.</li>\n' +
            '                <li>Unused {coin1name} can be withdrawn at any time.</li>\n' +
            '                <li>The interest is 12% per annum. 1% is charged once the borrower receives {coin1name} and then continues to charge every 30th day.</li>\n' +
            '                <li>You will receive interest when the debt is repaid.</li>\n' +
            '                <li>If the collateral for the used {coin1name} drops below 150%, then you have an opportunity to take the collateral in order to sell it and get your {coin1name} back (10% of the {coin0name} amount goes to Fund).</li>\n' +
            '                <li>The minimum amount is $1. The maximum is $10,000.</li>\n' +
            '              </ul>\n' +
            '            </div>',
        lends_table: {
            title: "Lends",
            amount: "Amount",
            left: "Left",
            withdraw: "Withdraw",
        },
        borrows_table: {
            title: "Borrows",
            date: "Date",
            borrowed: "Borrowed",
            pledged: "Pledged",
            to_repay: "To repay",
            liquidate: "Liquidate",
            closed: "CLOSED",
        },
    },
};
