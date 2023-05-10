<script>
import { createReusableTemplate } from '@vueuse/core';
import {getProviderByChain, fromErcDecimals} from 'minter-js-web3-sdk/src/web3.js';
import {getLoanList, getLendList, LEND_COIN, getCollateralPrice} from '~/api/web3-loans.js';
import loansABI from '~/assets/abi/loans.json';
import {pretty, getDate, getTime} from '~/assets/utils.js';


const [DefineTemplate, ReuseTemplate] = createReusableTemplate();

// baseCollateralRate / rateDenom
// 200 / 100
const BASE_COLLATERAL_RATE = 2;

export default {
    LEND_COIN,
    components: {
        DefineTemplate, ReuseTemplate,
    },
    fetch() {
        this.fetchPrice();
        return Promise.all([
            this.fetchLoans(),
            this.fetchLends(),
        ]);
    },
    data() {
        return {
            collateralPrice: {
                METAGARDEN: 0,
                BEE: 0,
            },
            lendListMetagarden: [],
            lendListBee: [],
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
        /**
         * Cost of lendCoin to repay in collateralCoin
         * @param {MinterLoansLoan} loan
         * @return {number}
         */
        getRepaymentCost(loan) {
            const collateralPrice = this.collateralPrice[loan.collateralCoin];
            if (!(collateralPrice > 0)) {
                return 0;
            }
            return loan.amountToRepay / collateralPrice;
        },
        /**
         * @param {MinterLoansLoan} loan
         * @return {number}
         */
        getHealth(loan) {
            // loan value
            const repaymentCostInCollateral = this.getRepaymentCost(loan);
            const ltv = repaymentCostInCollateral / loan.collateralAmount * 100;
            return Math.max(Math.floor(100 - ltv), 0);
        },
        fetchPrice() {
            return Promise.all([
                getCollateralPrice('METAGARDEN'),
                getCollateralPrice('BEE'),
            ])
                .then(([mgPrice, beePrice]) => {
                    this.collateralPrice.METAGARDEN = mgPrice;
                    this.collateralPrice.BEE = beePrice;
                });
        },
        async fetchLoans() {
            const address = this.smartWalletAddress.toLowerCase();

            const mgList = await getLoanList('METAGARDEN');
            const beeList = await getLoanList('BEE');
            /** @type {Array<MinterLoansLoan>}*/
            const loans = [].concat(mgList, beeList).sort((a, b) => {
                return b.borrowingTime - a.borrowingTime;
            });

            this.loanList = Object.freeze(loans.filter((item) => item.borrower === address));
            this.borrowList = Object.freeze(loans.filter((item) => item.lender === address));
        },
        async fetchLends() {
            const address = this.smartWalletAddress.toLowerCase();

            const mgList = await getLendList('METAGARDEN');
            const beeList = await getLendList('BEE');
            /** @type {Array<MinterLoansLend>}*/
            // let list = [].concat(mgList, beeList);

            this.lendListMetagarden = Object.freeze(mgList.filter((lend) => lend.lender === address && !lend.dropped));
            this.lendListBee = Object.freeze(beeList.filter((lend) => lend.lender === address && !lend.dropped));
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
                            {{ pretty(loan.collateralAmount) }} {{ loan.collateralCoin }} <br>
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
                            <nuxt-link v-if="!loan.closed" class="button button--ghost-main loans__table-button" :to="$i18nGetPreferredPath(`/loans/${loan.collateralCoin}/repay/${loan.id}`)">
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

            <div class="u-mt-15">
                <div class="button-group">
                    <nuxt-link class="button button--main button--full-mobile" :to="$i18nGetPreferredPath(`/loans/METAGARDEN/borrow`)">
                        {{ $td('Borrow with', 'todo') }} METAGARDEN
                    </nuxt-link>
                    <nuxt-link class="button button--main button--full-mobile" :to="$i18nGetPreferredPath(`/loans/BEE/borrow`)">
                        {{ $td('Borrow with', 'todo') }} BEE
                    </nuxt-link>
                </div>
            </div>
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
                                {{ pretty(loan.collateralAmount) }} {{ loan.collateralCoin }} <br>
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
                                    {{ pretty(loan.collateralAmount) }} {{ loan.collateralCoin }}
                                </div>
                            </td>
                            <td class="u-text-right">
                                <nuxt-link v-if="!loan.closed && loan.mayBeLiquidated" class="button button--ghost-main loans__table-button" :to="$i18nGetPreferredPath(`/loans/${loan.collateralCoin}/liquidate/${loan.id}`)">
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
        <DefineTemplate v-slot="{lendList, collateralCoin}">
            <div>
                <h2 class="u-h1 u-mb-15 u-mt-25">
                    {{ $td('Lends for', 'loans.manage-lends-title') }}
                    {{ collateralCoin }}
                </h2>
                <div class="card card__content">
                    <div v-if="lendList?.length > 0" class="table-wrap">
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
                                    <nuxt-link class="button button--ghost-main loans__table-button" :to="$i18nGetPreferredPath(`/loans/${collateralCoin}/withdraw/${lend.id}`)" :disabled="lend.leftAmount === 0">
                                        {{ $t('lend.lends_table.withdraw') }}
                                    </nuxt-link>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-else-if="$fetchState.pending">Loading…</div>
                    <div v-else>You have no active lends</div>

                    <nuxt-link class="button button--main u-mt-15 button--full-mobile" :to="$i18nGetPreferredPath(`/loans/${collateralCoin}/lend`)">
                        {{ $td('Lend for', 'todo') }} {{ collateralCoin }}
                    </nuxt-link>
                </div>
            </div>
        </DefineTemplate>

        <!-- prop names not normalized here, so camelCase is required -->
        <ReuseTemplate :lendList="lendListMetagarden" collateralCoin="METAGARDEN"/>

        <ReuseTemplate :lendList="lendListBee" collateralCoin="BEE"/>
    </div>
</template>

<style>
.loans__table-button { max-width: 150px; width: 100%;}
</style>
