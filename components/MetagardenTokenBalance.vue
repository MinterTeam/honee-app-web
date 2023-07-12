<script>
import {getCurrentInstance} from 'vue';
import metagardenGames from '~/data/metagarden-games.js';
import {ETHEREUM_CHAIN_ID, BSC_CHAIN_ID, HUB_CHAIN_DATA} from '~/assets/variables.js';
import {findHubCoinItemByTokenAddress} from '~/api/hub.js';
import {getSmartWalletAddress} from 'minter-js-web3-sdk/src/composables/use-web3-smartwallet.js';
import useWeb3AddressBalance from '~/composables/use-web3-address-balance.js';
import useHubOracle from '~/composables/use-hub-oracle.js';
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';


export default {
    components: {
        BaseAmountEstimation,
    },
    setup() {
        const vm = getCurrentInstance()?.proxy;
        const smartWalletAddress = getSmartWalletAddress(vm.$store.getters.evmAddress);

        const {
            initPromise: hubInfoInitPromise,
            // networkNativeCoin,
            hubTokenList,
            // setHubOracleProps,
        } = useHubOracle({
            subscribeTokenList: true,
            // subscribePriceList: true,
        });

        const {
            balanceList: web3EthereumBalance,
            setWeb3EthereumBalanceProps,
        } = useWeb3AddressBalance({
            chainId: ETHEREUM_CHAIN_ID,
            accountAddress: smartWalletAddress,
        });

        const {
            balanceList: web3BscBalance,
            setWeb3BscBalanceProps,
        } = useWeb3AddressBalance({
            chainId: BSC_CHAIN_ID,
            accountAddress: smartWalletAddress,
        });

        return {
            hubInfoInitPromise,
            // networkNativeCoin,
            hubTokenList,
            // setHubOracleProps,

            web3EthereumBalance,
            web3BscBalance,
        };
    },
    fetch() {

    },
    data() {
        return {
        };
    },
    computed: {
        /** @type {Array<string>} */
        coinList() {
            return metagardenGames.map((game) => game.coin);
        },
        minterBalance() {
            return this.$store.state.balance.filter((item) => this.coinList.includes(item.coin.symbol));
        },
        /** @type {Array<TokenBalanceItem & Coin>} */
        web3BalanceList() {
            return [].concat(this.web3EthereumBalance, this.web3BscBalance)
                .map((balanceItem) => {
                    const chainId = HUB_CHAIN_DATA[balanceItem.hubNetworkSlug].chainId;
                    const hubCoin = findHubCoinItemByTokenAddress(this.hubTokenList, balanceItem.tokenContractAddress, chainId, true);
                    return {
                        ...balanceItem,
                        ...(hubCoin && {
                            coin: {
                                symbol: hubCoin.symbol,
                                id: hubCoin.minterId,
                            },
                        }),
                    };
                })
                .filter((balanceItem) => this.coinList.includes(balanceItem.coin?.symbol));
        },
    },
    methods: {
    },
};
</script>

<template>
    <div class="card card__content">
        <div class="u-flex u-flex--align-center u-mb-10">
            <img class="u-image u-image--round u-mr-05" alt="" src="/img/icon-gaming.svg" width="24" height="24">
            <div class="u-h--uppercase-solid">
                {{ $td('Gaming toknes', 'meganet.gaming-tokens-title') }}
            </div>
        </div>

        <div class="u-fw-600">
            <BaseAmountEstimation :coin="item.coin.symbol" :amount="item.amount" format="approx" v-for="item in minterBalance" :key="item.coin.symbol"/>
            <BaseAmountEstimation
                :coin="item.coin.symbol"
                :amount="item.amount"
                :network="item.hubNetworkSlug"
                format="approx"
                v-for="item in web3BalanceList"
                :key="item.id"
            />
        </div>
        <!--
        <div class="u-flex u-flex&#45;&#45;justify-between u-flex&#45;&#45;align-center u-mb-10" v-for="coin in coinList" :key="coin">
            <div class="u-flex u-flex&#45;&#45;align-center u-mr-10">
                <img class="u-image u-image&#45;&#45;round u-mr-05" alt="" :src="$store.getters['explorer/getCoinIcon'](coin)" width="24" height="24">
                <div class="u-h&#45;&#45;uppercase-solid">
                    {{ coin }}
                </div>
            </div>

            <div class="u-h u-h4">
                {{ 0 }}
            </div>
        </div>
        -->
    </div>

</template>

