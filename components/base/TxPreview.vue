<script>
import Big from '~/assets/big.js';
import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
import {pretty, txTypeFilter} from '~/assets/utils.js';
import PoolLink from '~/components/base/PoolLink.vue';

export default {
    components: {
        PoolLink,
    },
    props: {
        /** @type {TxParams} */
        tx: {
            type: Object,
            required: true,
        },
    },
    computed: {
    },
    methods: {
        pretty,
        formatTxType: (value) => txTypeFilter(value).replace(/ coin$/, ''),
        getAmount(tx) {
            return tx.data.value
                || this.getConvertValue(tx)
                || tx.data.stake
                || tx.data.initialAmount
                || tx.data.check?.value
                || this.getMultisendValue(tx);
        },
        hasAmount(tx) {
            return typeof this.getAmount(tx) !== 'undefined';
        },
        getAmountWithCoin(tx) {
            if (this.isMultisend(tx) && this.isMultisendMultipleCoin(tx)) {
                return 'Multiple coins';
            } else {
                return pretty(this.getAmount(tx) || 0) + ' ' + (getCoinSymbol(tx.data.coin) || tx.data.symbol || this.getConvertCoinSymbol(tx) /* || getCoinSymbol(tx.data.check?.coin) */ || this.getMultisendCoin(tx));
            }
        },
        isEditPool(tx) {
            return this.isTxType(tx, TX_TYPE.CREATE_SWAP_POOL) || this.isTxType(tx, TX_TYPE.ADD_LIQUIDITY) || this.isTxType(tx, TX_TYPE.REMOVE_LIQUIDITY);
        },
        getConvertCoinSymbol(tx) {
            if (this.isSell(tx)) {
                return getCoinSymbol(tx.data.coinToSell);
            }
            if (this.isBuy(tx)) {
                return getCoinSymbol(tx.data.coinToBuy);
            }
            if (this.isSellPool(tx)) {
                return getCoinSymbol(tx.data.coins[0]);
            }
            if (this.isBuyPool(tx)) {
                return getCoinSymbol(tx.data.coins[tx.data.coins.length - 1]);
            }
        },
        getSwapOppositeCoinSymbol(tx) {
            if (this.isSell(tx)) {
                return getCoinSymbol(tx.data.coinToBuy);
            }
            if (this.isBuy(tx)) {
                return getCoinSymbol(tx.data.coinToSell);
            }
            if (this.isSellPool(tx)) {
                return getCoinSymbol(tx.data.coins[tx.data.coins.length - 1]);
            }
            if (this.isBuyPool(tx)) {
                return getCoinSymbol(tx.data.coins[0]);
            }
        },
        getConvertValue(tx) {
            if (this.isSell(tx) || this.isSellPool(tx)) {
                return tx.data.valueToSell;
            }
            if (this.isBuy(tx) || this.isBuyPool(tx)) {
                return tx.data.valueToBuy;
            }
        },
        isSell(tx) {
            return this.isTxType(tx, TX_TYPE.SELL) || this.isTxType(tx, TX_TYPE.SELL_ALL);
        },
        isSellPool(tx) {
            return this.isTxType(tx, TX_TYPE.SELL_SWAP_POOL) || this.isTxType(tx, TX_TYPE.SELL_ALL_SWAP_POOL);
        },
        isBuy(tx) {
            return this.isTxType(tx, TX_TYPE.BUY);
        },
        isBuyPool(tx) {
            return this.isTxType(tx, TX_TYPE.BUY_SWAP_POOL);
        },
        isAddOrder(tx) {
            return this.isTxType(tx, TX_TYPE.ADD_LIMIT_ORDER);
        },
        isMultisend(tx) {
            return this.isTxType(tx, TX_TYPE.MULTISEND);
        },
        isTxType(tx, txType) {
            return Number(tx.type) === Number(txType);
        },
        getMultisendDeliveryList(tx) {
            return tx.data.list || [];
        },
        isMultisendMultipleCoin(tx) {
            if (!this.isMultisend(tx)) {
                return;
            }
            const currentUserDeliveryList = this.getMultisendDeliveryList(tx);
            return currentUserDeliveryList.some((delivery) => {
                return getCoinId(delivery.coin) !== getCoinId(currentUserDeliveryList[0].coin);
            });
        },
        getMultisendCoin(tx) {
            if (!this.isMultisend(tx)) {
                return;
            }
            if (!this.isMultisendMultipleCoin(tx)) {
                return getCoinSymbol(this.getMultisendDeliveryList(tx)[0].coin);
            }
        },
        getMultisendValue(tx) {
            if (!this.isMultisend(tx)) {
                return;
            }
            const currentUserDeliveryList = this.getMultisendDeliveryList(tx);
            if (this.isMultisendMultipleCoin(tx)) {
                return '...';
            } else {
                return currentUserDeliveryList.reduce((accumulator, delivery) => accumulator.plus(new Big(delivery.value)), new Big(0)).toString();
            }
        },
    },
};

/**
 * Accept coin object from explorer or coin string from txParams
 * @param {Coin|string} coin
 * @return {string}
 */
function getCoinSymbol(coin) {
    return coin?.symbol || coin;
}
/**
 * Accept coin object from explorer or coin string from txParams
 * @param {Coin|number|string} coin
 * @return {number|string}
 */
function getCoinId(coin) {
    return coin?.id || coin;
}
</script>

<template>
    <div>
        {{ formatTxType(tx.type) }}
        <template v-if="hasAmount(tx)">
            {{ getAmountWithCoin(tx) }}
        </template>
        <template v-if="getSwapOppositeCoinSymbol(tx)">
            {{ $td('for', 'form.stage-for') }} {{ getSwapOppositeCoinSymbol(tx) }}
        </template>
        <PoolLink class="u-fw-400" v-else-if="isEditPool(tx)" :pool="tx.data"/>
        <PoolLink class="u-fw-400" v-else-if="isAddOrder(tx)" :pool="{coin0: tx.data.coinToSell, coin1: tx.data.coinToBuy}"/>
    </div>
</template>
