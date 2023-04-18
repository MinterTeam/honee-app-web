<script>
import {getProviderByChain, fromErcDecimals} from 'minter-js-web3-sdk/src/web3.js';
import {getLoan, getLend, LEND_COIN, COLLATERAL_COIN, LOANS_CONTRACT_ADDRESS} from '~/api/web3-loans.js';
import loansABI from '~/assets/abi/loans.json';
import {pretty} from '~/assets/utils.js';



const web3Eth = getProviderByChain(56);
const contract = new web3Eth.Contract(loansABI, LOANS_CONTRACT_ADDRESS);

export default {
    LEND_COIN,
    COLLATERAL_COIN,
    fetch() {
        return this.fetchLends();
    },
    data() {
        return {
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

                this.loanList = loans.reverse();
                this.borrowList = borrowers.reverse();
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
                        // console.log('lend', lend);
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

                this.lendList = list.reverse();
            }
        },
    },
};
</script>

<template>
    <div>
        <!-- my lends -->
        <div class="box" v-if="lendList.length > 0">
            <h4 class="title is-4">{{ $t('lend.lends_table.title') }}</h4>
            <div class="table-container">
                <table class="table is-fullwidth is-narrow">
                    <tr>
                        <th>ID</th>
                        <th>{{ $t('lend.lends_table.amount') }}</th>
                        <th>{{ $t('lend.lends_table.left') }}</th>
                        <th></th>
                    </tr>
                    <tr :key="lend.id" v-for="lend in lendList">
                        <td>{{ lend.id }}</td>
                        <td>{{ pretty(lend.initialAmount) }} {{ $options.LEND_COIN }}</td>
                        <td>{{ pretty(lend.leftAmount) }} {{ $options.LEND_COIN }} </td>
                        <td>
                            <nuxt-link class="button is-primary is-small" :to="$i18nGetPreferredPath(`/loans/withdraw/${lend.id}`)" :disabled="lend.leftAmount === 0">
                                {{ $t('lend.lends_table.withdraw') }}
                            </nuxt-link>
                        </td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- my lends used -->
        <div class="box" v-if="borrowList.length > 0">
            <h4 class="title is-4">{{ $t('lend.borrows_table.title') }}</h4>
            <div class="table-container">
                <table class="table is-fullwidth is-narrow">
                    <tr>
                        <th style="width:30px;">ID</th>
                        <th style="width:200px;">{{ $t('lend.borrows_table.date') }}</th>
                        <th style="width:120px;">{{ $t('lend.borrows_table.borrowed') }}</th>
                        <th style="width:120px;">{{ $t('lend.borrows_table.pledged') }}</th>
                        <th style="width:120px;">{{ $t('lend.borrows_table.to_repay') }}</th>
                        <th></th>
                    </tr>
                    <tr :key="loan.id" v-for="loan in borrowList">
                        <td>{{ loan.id }}</td>
                        <td>{{ (new Date(loan.borrowingTime)).toLocaleString() }}</td>
                        <td>{{ pretty(loan.borrowedAmount) }} {{ $options.LEND_COIN }}</td>
                        <td>{{ pretty(loan.collateralAmount) }} {{ $options.COLLATERAL_COIN }}</td>
                        <td>
                            <div v-if="loan.closed">{{ $t('lend.borrows_table.closed') }}</div>
                            <div v-else>{{ pretty(loan.amountToRepay) }} {{ $options.LEND_COIN }}</div>
                        </td>
                        <th>
                            <div v-if="!loan.closed && loan.mayBeLiquidated">
                                <nuxt-link class="button is-primary is-small" :to="$i18nGetPreferredPath(`/loans/liquidate/${loan.id}`)">
                                    {{ $t('lend.lends_table.liquidate') }}
                                </nuxt-link>
                            </div>
                        </th>
                    </tr>
                </table>
            </div>
        </div>

        <!-- my loans-->
        <div class="box" v-if="loanList.length > 0">
            <h4 class="title is-4">{{ $t('borrow.loans_form.title') }}</h4>
            <div class="table-container">
                <table class="table is-fullwidth" style="table-layout: fixed;">
                    <thead>
                    <tr>
                        <th style="width:30px;">ID</th>
                        <th style="width:200px;">{{ $t('borrow.loans_form.date') }}</th>
                        <th style="width:120px;">{{ $t('borrow.loans_form.borrowed') }}</th>
                        <th style="width:120px;">{{ $t('borrow.loans_form.pledged') }}</th>
                        <th style="width:120px;">{{ $t('borrow.loans_form.to_repay') }}</th>
                        <th style="width:160px;"></th>
                    </tr>
                    </thead>
                    <tr :key="loan.id" v-for="loan in loanList">
                        <td>{{ loan.id }}</td>
                        <td>{{ (new Date(loan.borrowingTime)).toLocaleString() }}</td>
                        <td>{{ pretty(loan.borrowedAmount) }} {{ $options.LEND_COIN }}</td>
                        <td>{{ pretty(loan.collateralAmount) }} {{ $options.COLLATERAL_COIN }}</td>
                        <td>
                            <div v-if="loan.closed">{{ $t('borrow.loans_form.closed') }}</div>
                            <div v-else>{{ pretty(loan.amountToRepay) }} {{ $options.LEND_COIN }}</div>
                        </td>
                        <th>
                            <div v-if="!loan.closed">
                                <nuxt-link class="button is-primary is-small" :to="$i18nGetPreferredPath(`/loans/repay/${loan.id}`)">
                                    {{ $t('lend.loans_form.repay') }}
                                </nuxt-link>
                            </div>
                        </th>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</template>
