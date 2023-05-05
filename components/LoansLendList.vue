<script>
import {getProviderByChain, fromErcDecimals} from 'minter-js-web3-sdk/src/web3.js';
import {getLoan, getLend, LEND_COIN, COLLATERAL_COIN, LOANS_CONTRACT_ADDRESS, getCollateralPrice} from '~/api/web3-loans.js';
import loansABI from '~/assets/abi/loans.json';
import {pretty, getDate, getTime} from '~/assets/utils.js';


// baseCollateralRate / rateDenom
// 200 / 100
const BASE_COLLATERAL_RATE = 2;

const web3Eth = getProviderByChain(56);
const contract = new web3Eth.Contract(loansABI, LOANS_CONTRACT_ADDRESS);

export default {
    LEND_COIN,
    COLLATERAL_COIN,
    fetch() {
        this.fetchPrice();
        return this.fetchLends();
    },
    data() {
        return {
            collateralPrice: 0,
            lendList: [],
            loanList: [],
            borrowList: [],
        };
    },
    computed: {
        smartWalletAddress() {
            return this.$store.getters.smartWalletAddress;
        },
    },
    methods: {
        pretty,
        getRepayTimestamp(timestamp) {
            // plus 1 year
            return timestamp + 365 * 24 * 60 * 60 * 1000;
        },
        getDate,
        getTime: (value) => getTime(value, true),
        calculateCost(lendCoinAmount) {
            if (!(this.collateralPrice > 0)) {
                return 0;
            }
            return lendCoinAmount / this.collateralPrice;
        },
        /**
         * @param {MinterLoansLoan} loan
         * @return {number}
         */
        getHealth(loan) {
            // loan value
            const repaymentCostInCollateral = this.calculateCost(loan.amountToRepay);
            const ltv = repaymentCostInCollateral / loan.collateralAmount * 100;
            return Math.max(Math.floor(100 - ltv), 0);
        },
        fetchPrice() {
            return getCollateralPrice()
                .then((price) => {
                    this.collateralPrice = price;
                });
        },
        async fetchLends() {
            const address = this.smartWalletAddress.toLowerCase();
            // loans
            {
                let loans = [];
                let borrowers = [];

                for (let id = 0; id < 1000; id++) {
                    let item;
                    try {
                        item = await getLoan(id);
                    } catch(e) {
                        break;
                    }

                    if (item.borrower === address) {
                        loans.push(item);
                    }

                    if (item.lender === address) {
                        borrowers.push(item);
                    }
                }

                this.loanList = Object.freeze(loans.reverse());
                this.borrowList = Object.freeze(borrowers.reverse());
            }

            {
                let head = await contract.methods.lendsHead().call();
                let tail = await contract.methods.lendsTail().call();
                head = parseInt(head);
                tail = parseInt(tail);

                let list = [];
                let current = head;
                for (;;) {
                    let lend;
                    try {
                        lend = await getLend(current);
                    } catch (e) {
                        break;
                    }

                    if (lend.lender === address && !lend.dropped) {
                        list.push(lend);
                    }

                    if (current === tail || lend.next === 0) {
                        break;
                    }

                    current = lend.next;
                }

                this.lendList = Object.freeze(list.reverse());
            }
        },
    },
};
</script>

<template>
    <div>
        <!-- my loans-->
        <h2 class="u-h1 u-mb-15">{{ $td('Loans', 'loans.manage-loans-title') }}</h2>
        <div class="card card__content">
            <div v-if="loanList.length > 0" class="table-wrap">
                <table>
                    <thead>
                    <tr>
                        <th class="u-hidden-small-down">#ID</th>
                        <th class="u-hidden-small-down">{{ $t('borrow.loans_form.date') }}</th>
                        <th>{{ $t('borrow.loans_form.pledged') }} / {{ $t('borrow.loans_form.borrowed') }}</th>
                        <th>{{ $td('Payment date', 'loans.payment-date') }}</th>
                        <th>{{ $td('Health', 'loans.health') }}</th>
                        <th>{{ $t('borrow.loans_form.to_repay') }}</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr :key="loan.id" v-for="loan in loanList" class="u-fw-600 u-text-medium">
                        <td class="u-hidden-small-down u-fw-400">{{ loan.id }}</td>
                        <td class="u-hidden-small-down">
                            {{ getDate(loan.borrowingTime) }} <br>
                            {{ getTime(loan.borrowingTime) }}
                        </td>
                        <td>
                            {{ pretty(loan.collateralAmount) }} {{ $options.COLLATERAL_COIN }} <br>
                            {{ pretty(loan.borrowedAmount) }} {{ $options.LEND_COIN }}
                        </td>
                        <td>
                            <template v-if="!loan.closed">
                                {{ getDate(getRepayTimestamp(loan.borrowingTime)) }} <br>
                                {{ getTime(getRepayTimestamp(loan.borrowingTime)) }}
                            </template>
                        </td>
                        <td>
                            <template v-if="!loan.closed">
                                {{ getHealth(loan) }}% / 25%
                            </template>
                        </td>
                        <td>
                            <template v-if="!loan.closed">
                                {{ pretty(loan.amountToRepay) }} {{ $options.LEND_COIN }}
                            </template>
                        </td>
                        <td class="u-text-right">
                            <nuxt-link v-if="!loan.closed" class="button button--ghost-main loans__table-button" :to="$i18nGetPreferredPath(`/loans/repay/${loan.id}`)">
                                {{ $td('Repay', 'loans.repay-button') }}
                            </nuxt-link>
                            <div v-else class="button button--light is-inactive loans__table-button">{{ $t('borrow.loans_form.closed') }}</div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <div v-else-if="$fetchState.pending">Loading…</div>
            <div v-else>You have no loans yet</div>

            <nuxt-link class="button button--main u-mt-15 button--full-mobile" :to="$i18nGetPreferredPath('/loans/borrow')">{{ $td('Borrow', 'todo') }}</nuxt-link>
        </div>

        <!-- borrows of my lends -->
        <template v-if="borrowList.length > 0">
            <h2 class="u-h1 u-mb-15 u-mt-25">{{ $td('Borrowers', 'loans.manage-borrowers-title') }}</h2>
            <div class="card card__content">
                <div class="table-wrap">
                    <table>
                        <thead>
                        <tr>
                            <th class="u-hidden-small-down">#ID</th>
                            <th class="u-hidden-small-down">{{ $t('lend.borrows_table.date') }}</th>
                            <th>{{ $t('lend.borrows_table.pledged') }} / {{ $t('lend.borrows_table.borrowed') }}</th>
                            <th>{{ $td('Payment date', 'loans.payment-date') }}</th>
                            <th>{{ $td('Health', 'loans.health') }}</th>
                            <th>{{ $td('To liquidate', 'loans.to-liquidate') }}</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr :key="loan.id" v-for="loan in borrowList" class="u-fw-600 u-text-medium">
                            <td class="u-hidden-small-down u-fw-400">{{ loan.id }}</td>
                            <td class="u-hidden-small-down">
                                {{ getDate(loan.borrowingTime) }} <br>
                                {{ getTime(loan.borrowingTime) }}
                            </td>
                            <td>
                                {{ pretty(loan.collateralAmount) }} {{ $options.COLLATERAL_COIN }} <br>
                                {{ pretty(loan.borrowedAmount) }} {{ $options.LEND_COIN }}
                            </td>
                            <td>
                                <template v-if="!loan.closed">
                                    {{ getDate(getRepayTimestamp(loan.borrowingTime)) }} <br>
                                    {{ getTime(getRepayTimestamp(loan.borrowingTime)) }}
                                </template>
                            </td>
                            <td>
                                <template v-if="!loan.closed">
                                    {{ getHealth(loan) }}% / 25%
                                </template>
                            </td>
                            <td>
                                <div v-if="!loan.closed && loan.mayBeLiquidated">
                                    {{ pretty(loan.collateralAmount) }} {{ $options.COLLATERAL_COIN }}
                                </div>
                            </td>
                            <td class="u-text-right">
                                <nuxt-link v-if="!loan.closed && loan.mayBeLiquidated" class="button button--ghost-main loans__table-button" :to="$i18nGetPreferredPath(`/loans/liquidate/${loan.id}`)">
                                    {{ $td('Liquidate', 'loans.liquidate-button') }}
                                </nuxt-link>
                                <div v-if="loan.closed" class="button button--light is-inactive loans__table-button">{{ $t('lend.borrows_table.closed') }}</div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </template>

        <!-- my lends -->
        <h2 class="u-h1 u-mb-15 u-mt-25">{{ $td('Lends', 'loans.manage-lends-title') }}</h2>
        <div class="card card__content">
            <div v-if="lendList.length > 0" class="table-wrap">
                <table>
                    <thead>
                    <tr>
                        <th class="u-hidden-small-down">#ID</th>
                        <th>{{ $t('lend.lends_table.amount') }}</th>
                        <th>{{ $td('Used', 'loans.used') }} / {{ $td('Unused', 'loans.unused') }}</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr :key="lend.id" v-for="lend in lendList" class="u-fw-600 u-text-medium">
                        <td class="u-hidden-small-down u-fw-400">{{ lend.id }}</td>
                        <td>{{ pretty(lend.initialAmount) }} {{ $options.LEND_COIN }}</td>
                        <td>
                            <div class="u-text-green">
                                {{ pretty(lend.initialAmount - lend.leftAmount) }} {{ $options.LEND_COIN }}
                            </div>
                            {{ pretty(lend.leftAmount) }} {{ $options.LEND_COIN }}
                        </td>
                        <td class="u-text-right">
                            <nuxt-link class="button button--ghost-main loans__table-button" :to="$i18nGetPreferredPath(`/loans/withdraw/${lend.id}`)" :disabled="lend.leftAmount === 0">
                                {{ $t('lend.lends_table.withdraw') }}
                            </nuxt-link>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <div v-else-if="$fetchState.pending">Loading…</div>
            <div v-else>You have no active lends</div>

            <nuxt-link class="button button--main u-mt-15 button--full-mobile" :to="$i18nGetPreferredPath('/loans/lend')">{{ $td('Lend', 'todo') }}</nuxt-link>
        </div>
    </div>
</template>

<style>
.loans__table-button { max-width: 150px; width: 100%;}
</style>
