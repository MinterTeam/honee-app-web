<script>
import Big from '~/assets/big.js';
import {validationMixin} from 'vuelidate/src/index.js';
import required from 'vuelidate/src/validators/required.js';
import minValue from 'vuelidate/src/validators/minValue.js';
import maxValue from 'vuelidate/src/validators/maxValue.js';
import minLength from 'vuelidate/src/validators/minLength.js';
import {FEE_PRECISION_SETTING} from 'minter-js-sdk/src/api/estimate-tx-commission.js';
import {postTx} from '~/api/gate.js';
import {getExplorerTxUrl, pretty, prettyPrecise, shortHashFilter, getEvmAddressUrl} from '~/assets/utils.js';
import {HUB_CHAIN_ID, HUB_NETWORK_SLUG, HUB_CHAIN_DATA, HUB_WITHDRAW_SPEED} from '~/assets/variables.js';
import {getErrorText} from '~/assets/server-error.js';
import {getAvailableSelectedBalance} from '~/components/base/FieldCombinedBaseAmount.vue';
import useFee from '~/composables/use-fee.js';
import useHubOracle from '~/composables/use-hub-oracle.js';
import useHubToken from '~/composables/use-hub-token.js';
import useWeb3Withdraw from '~/composables/use-web3-withdraw.js';
import Loader from '~/components/base/BaseLoader.vue';
import Modal from '~/components/base/Modal.vue';
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import FieldAddress from '~/components/base/FieldAddress.vue';
import FieldCombined from '~/components/base/FieldCombined.vue';
import FieldSelect from '~/components/base/FieldSelect.vue';
import HubFeeImpact from '~/components/HubFeeImpact.vue';


export default {
    HUB_CHAIN_ID,
    HUB_NETWORK_SLUG,
    HUB_CHAIN_DATA,
    components: {
        Loader,
        Modal,
        BaseAmountEstimation,
        FieldAddress,
        FieldCombined,
        FieldSelect,
        HubFeeImpact,
    },
    directives: {
    },
    mixins: [validationMixin],
    emits: [
        'success-modal-close',
    ],
    setup() {
        const {fee, setFeeProps} = useFee();
        const {
            networkHubCoinList,
            setHubOracleProps,
            fetchHubDestinationFee,
        } = useHubOracle({
            // no need to subscribe here, because already subscribed in useHubToken and useWeb3Withdraw
        });
        const {hubCoin: coinItem, tokenPrice: coinPrice, tokenData: externalToken, setHubTokenProps} = useHubToken();
        const {discountUpsidePercent, destinationFeeInCoin: coinFee, hubFeeRate, hubFeeRatePercent, hubFee, amountToReceive, minAmountToSend: minAmount, txParams, feeTxParams, setWithdrawProps} = useWeb3Withdraw();

        return {
            fee,
            setFeeProps,

            networkHubCoinList,
            setHubOracleProps,
            fetchHubDestinationFee,

            coinItem,
            coinPrice,
            externalToken,
            setHubTokenProps,

            discountUpsidePercent,
            coinFee,
            hubFeeRate,
            hubFeeRatePercent,
            hubFee,
            amountToReceive,
            minAmount,
            txParams,
            feeTxParams,
            setWithdrawProps,
        };
    },
    data() {
        return {
            form: {
                coin: this.$route.query.coin || '',
                amount: this.$route.query.amount || '',
                address: this.$route.query.address || this.$store.getters.evmAddress,
                speed: HUB_WITHDRAW_SPEED.FAST,
                networkTo: this.$route.query.network || HUB_NETWORK_SLUG.BSC,
            },
            isFormSending: false,
            serverSuccess: null,
            serverError: '',
            serverWarning: '',
            isConfirmModalVisible: false,
            isSuccessModalVisible: false,
        };
    },
    computed: {
        /*
        totalFee() {
            return new Big(this.coinFee).plus(this.hubFee).toString();
        },
        amountToSpend() {
            if (this.form.coin === this.fee.coinSymbol) {
                return new Big(this.form.amount).plus(this.fee.value).toString();
            } else {
                return this.form.amount;
            }
        },
         */
        // positive price impact means lose of value
        totalFeeImpact() {
            const totalSpend = this.form.amount;
            const totalResult = this.amountToReceive;
            if (!totalSpend || !totalResult) {
                return 0;
            }
            return Math.min((totalSpend - totalResult) / totalSpend * 100, 100);
        },
        maxAmount() {
            return this.maxAmountToSend;
        },
        maxAmountToSend() {
            const selectedCoin = this.$store.state.balance.find((coin) => {
                return coin.coin.symbol === this.form.coin;
            });
            // coin not selected
            if (!selectedCoin) {
                return 0;
            }
            return getAvailableSelectedBalance(selectedCoin, this.fee);
        },
        maxAmountToReceive() {
            const availableAmount = this.maxAmountToSend;

            const maxHubFee = new Big(availableAmount).times(this.hubFeeRate);
            const maxAmount = new Big(availableAmount).minus(maxHubFee).minus(this.coinFee);
            if (maxAmount.lt(0)) {
                return 0;
            } else {
                return maxAmount.toString();
            }
        },
        suggestionList() {
            return this.networkHubCoinList
                // show only available coins for selected network
                .map((item) => item.symbol);
            // intersection of address balance and hub supported coins
            /*
            return this.$store.state.balance.filter((balanceItem) => {
                return this.networkHubCoinList.some((item) => Number(item.minterId) === balanceItem.coin.id);
            });
            */
        },
    },
    validations() {
        return {
            form: {
                address: {
                    required,
                    validAddress(address) {
                        return /^0x[0-9a-fA-F]{40}$/.test(address);
                    },
                },
                coin: {
                    required,
                    minLength: minLength(3),
                    supported: () => !!this.externalToken,
                },
                amount: {
                    required,
                    // validAmount: isValidAmount,
                    minValue: minValue(this.minAmount),
                    maxValue: maxValue(this.maxAmount || 0),
                },
            },
        };
    },
    watch: {
    },
    created() {
        // withdrawProps
        this.$watch(
            () => ({
                hubNetworkSlug: this.form.networkTo,
                amountToSend: this.form.amount,
                tokenSymbol: this.form.coin,
                accountAddress: this.$store.getters.address,
                destinationAddress: this.form.address,
                speed: this.form.speed,
            }),
            (newVal) => this.setWithdrawProps(newVal),
            {deep: true, immediate: true},
        );

        // hubOracleProps
        this.$watch(
            () => ({
                hubNetworkSlug: this.form.networkTo,
            }),
            (newVal) => this.setHubOracleProps(newVal),
            {deep: true, immediate: true},
        );

        // hubTokenProps
        this.$watch(
            () => ({
                chainId: HUB_CHAIN_DATA[this.form.networkTo].chainId,
                tokenSymbol: this.form.coin,
            }),
            (newVal) => this.setHubTokenProps(newVal),
            {deep: true, immediate: true},
        );

        // feeBusParams
        this.$watch(
            () => ({
                txParams: this.feeTxParams,
                baseCoinAmount: this.$store.getters.baseCoinAmount,
                fallbackToCoinToSpend: true,
                isOffline: !this.$store.state.onLine,
                precision: FEE_PRECISION_SETTING.PRECISE,
            }),
            (newVal) => this.setFeeProps(newVal),
            {deep: true, immediate: true},
        );
    },
    methods: {
        pretty,
        prettyPrecise,
        getExplorerTxUrl,
        shortHashFilter: (value) => shortHashFilter(value, 6),
        getEvmAddressUrl,
        getDestinationFee({checkWarning} = {}) {
            return this.fetchHubDestinationFee()
                .then((fee) => {
                    if (checkWarning && fee.isIncreased) {
                        // don't send form, show warning to user, so he has to press Submit again
                        this.serverWarning = true;
                    }
                });
        },
        submitConfirm() {
            if (this.isFormSending) {
                return;
            }
            if (this.$v.$invalid) {
                this.$v.$touch();
                return;
            }

            this.serverError = '';
            this.serverWarning = '';
            this.serverSuccess = null;
            this.isFormSending = true;

            return this.getDestinationFee({checkWarning: true})
                .then(() => {
                    this.isFormSending = false;
                    if (!this.serverWarning) {
                        this.isConfirmModalVisible = true;
                    } else {
                        // don't send form, show warning to user, so he has to press Submit again
                    }
                })
                .catch((error) => {
                    console.log(error);
                    this.isFormSending = false;
                    this.serverError = getErrorText(error);
                });
        },
        async submit() {
            this.isConfirmModalVisible = false;

            if (this.$v.$invalid) {
                this.$v.$touch();
                return;
            }

            this.serverError = '';
            this.serverWarning = '';
            this.serverSuccess = null;
            this.isFormSending = true;

            await this.getDestinationFee({checkWarning: true});

            if (this.serverWarning) {
                this.isFormSending = false;
                return;
            }

            let txParams = {
                ...this.txParams,
                gasCoin: this.fee.coin,
            };

            return postTx(txParams, {privateKey: this.$store.getters.privateKey})
                .then((tx) => {
                    this.$store.commit('hub/saveWithdrawFromGate', {
                        ...tx,
                        bridgeFee: this.hubFee,
                    });
                    this.isFormSending = false;
                    this.serverSuccess = tx;
                    this.isSuccessModalVisible = true;
                    this.clearForm();
                })
                .catch((error) => {
                    console.log(error);
                    this.isFormSending = false;
                    this.serverError = getErrorText(error);
                });
        },
        clearForm() {
            this.$v.$reset();
            // this.form.address = this.$route.query.address || '';
            this.form.amount = '';
            this.form.coin = this.$route.query.coin || '';
            // this.form.speed = SPEED_MIN;
        },
    },
};
</script>

<template>
    <div class="">
        <!-- Form -->
        <form class="panel__section" @submit.prevent="submitConfirm()">
            <div class="form-row" v-if="!$route.query.network">
                <FieldSelect
                    v-model="form.networkTo"
                    :label="$td('Select network', 'form.select-network')"
                    :suggestion-list="[
                        {
                            value: $options.HUB_CHAIN_ID.ETHEREUM,
                            name: $options.HUB_CHAIN_DATA[$options.HUB_CHAIN_ID.ETHEREUM].name,
                            shortName: $options.HUB_CHAIN_DATA[$options.HUB_CHAIN_ID.ETHEREUM].shortName,
                            icon: `/img/icon-network-${$options.HUB_CHAIN_ID.ETHEREUM}.svg`,
                        },
                        {
                            value: $options.HUB_CHAIN_ID.BSC,
                            name: $options.HUB_CHAIN_DATA[$options.HUB_CHAIN_ID.BSC].name,
                            shortName: $options.HUB_CHAIN_DATA[$options.HUB_CHAIN_ID.BSC].shortName,
                            icon: `/img/icon-network-${$options.HUB_CHAIN_ID.BSC}.svg`,
                        },
                    ]"
                />
            </div>
            <div class="form-row">
                <FieldCombined
                    :coin.sync="form.coin"
                    :$coin="$v.form.coin"
                    :coin-list="suggestionList"
                    :amount.sync="form.amount"
                    :$amount="$v.form.amount"
                    :use-balance-for-max-value="true"
                    :fee="fee"
                    :label="$td('Amount', 'form.wallet-send-amount')"
                />
                <span class="form-field__error" v-if="$v.form.coin.$dirty && !$v.form.coin.required">{{ $td('Enter coin symbol', 'form.coin-error-required') }}</span>
                <span class="form-field__error" v-else-if="$v.form.coin.$dirty && !$v.form.coin.minLength">{{ $td('Min 3 letters', 'form.coin-error-min') }}</span>
                <span class="form-field__error" v-else-if="$v.form.coin.$dirty && !$v.form.coin.supported">
                    {{ $td('Can\'t be transferred to', 'hub.coin-error-supported') }}
                    {{ $options.HUB_CHAIN_DATA[form.networkTo].shortName }}
                </span>
                <span class="form-field__error" v-if="$v.form.amount.$dirty && !$v.form.amount.required">{{ $td('Enter amount', 'form.amount-error-required') }}</span>
                <span class="form-field__error" v-else-if="$v.form.amount.$dirty && (!$v.form.amount.minValue)">{{ $td(`Minimum ${minAmount}`, 'form.amount-error-min', {min: minAmount}) }}</span>
                <span class="form-field__error" v-else-if="$v.form.amount.$dirty && !$v.form.amount.maxValue">{{ $td('Not enough', 'form.amount-error-not-enough') }} {{ form.coin }} ({{ $td('max.', 'hub.max') }} {{ pretty(maxAmount) }})</span>
            </div>
            <div class="form-row" v-if="!$route.query.address">
                <FieldAddress
                    v-model.trim="form.address"
                    :$value="$v.form.address"
                    :label="$td('Withdraw to address', 'hub.withdraw-address')"
                    placeholder="0x…"
                />
                <span class="form-field__error" v-if="$v.form.address.$dirty && !$v.form.address.required">{{ $td('Enter', 'hub.withdraw-address-required') }} {{ $options.HUB_CHAIN_DATA[form.networkTo].shortName }} {{ $td('address', 'hub.withdraw-address-title') }}</span>
                <span class="form-field__error" v-else-if="$v.form.address.$dirty && !$v.form.address.validAddress">{{ $td('Invalid', 'hub.withdraw-address-invalid') }} {{ $options.HUB_CHAIN_DATA[form.networkTo].shortName }} {{ $td('address', 'hub.withdraw-address-title') }}</span>
            </div>
            <div class="information form-row" v-if="form.coin || $route.query.address">
                <template v-if="$route.query.address">
                    <h3 class="information__title">{{ $td('To the address', 'form.wallet-send-confirm-address') }}</h3>
                    <div class="information__item information__item--content u-text-wrap">
                        {{ form.address }}
                        <!--
                        <a class="link&#45;&#45;default" :href="getEvmAddressUrl($options.HUB_CHAIN_DATA[form.networkTo]?.chainId, $route.query.address)" target="_blank">
                            {{ shortHashFilter($route.query.address) }}
                        </a>
                        -->
                    </div>
                </template>
                <template v-if="form.coin">
                    <h3 class="information__title">{{ $options.HUB_CHAIN_DATA[form.networkTo].shortName }} {{ $td('fee', 'hub.withdraw-eth-fee') }}</h3>
                    <BaseAmountEstimation :coin="form.coin" :amount="coinFee" format="pretty"/>

                    <h3 class="information__title">{{ $td('Bridge fee', 'hub.withdraw-hub-fee') }} ({{ hubFeeRatePercent }}%)</h3>
                    <BaseAmountEstimation :coin="form.coin" :amount="hubFee" format="pretty"/>
                    <div class="information__item information__item--content u-text-medium" v-if="discountUpsidePercent">
                        <a :href="$td('https://www.minter.network/howto/cross-chain-discounts', 'form.hub-reduce-fee-url')" class="link--hover link--main" target="_blank">
                            {{ $td('How to reduce fee up to', 'form.hub-reduce-fee') }}
                            {{ discountUpsidePercent }}%
                        </a>
                    </div>

                    <h3 class="information__title">{{ $td('You will receive', 'hub.withdraw-estimate') }}</h3>
                    <BaseAmountEstimation :coin="form.coin" :amount="amountToReceive" format="exact"/>
                </template>
            </div>
            <HubFeeImpact class="form-row" :coin="form.coin" :fee-impact="totalFeeImpact" :network="$options.HUB_CHAIN_DATA[form.networkTo].shortName"/>
            <!--
            <div class="form-row">
                <div class="form-check-label">Tx speed</div>
                <label class="form-check">
                    <input type="radio" class="form-check__input" name="speed" :value="$options.SPEED_MIN" v-model="form.speed">
                    <span class="form-check__label form-check__label&#45;&#45;radio">{{ $td('Normal', 'form.hub-withdraw-speed-normal') }}</span>
                </label>
                <label class="form-check">
                    <input type="radio" class="form-check__input" name="speed" :value="$options.SPEED_FAST" v-model="form.speed">
                    <span class="form-check__label form-check__label&#45;&#45;radio">{{ $td('Fast', 'form.hub-withdraw-speed-fast') }}</span>
                </label>
            </div>
            -->
            <div class="form-row">
                <button
                    class="button button--main button--full"
                    :class="{'is-disabled': $v.$invalid, 'is-loading': isFormSending}"
                    type="submit"
                >
                    <span class="button__content">{{ $td('Withdraw', 'hub.withdraw-button-title') }}</span>
                    <Loader class="button__loader" :isLoading="true"/>
                </button>
                <div class="form-field__error" v-if="serverError">{{ serverError }}</div>
                <div class="form-field__help" v-if="serverWarning"><span class="u-emoji">⚠️</span> {{ $options.HUB_CHAIN_DATA[form.networkTo].shortName }} {{ $td('fee has updated', 'hub.fee-updated') }}</div>
            </div>

            <div class="form-row u-text-muted u-text-small">
                <template v-if="$i18n.locale === 'en'">
                    <p class="u-mb-05"><span class="u-emoji">⚠️</span> <strong class="u-fw-600">Withdrawal notice</strong></p>
                    <p>Do not withdraw to an exchange because many do not accept deposits from smart contracts and your tokens will be lost. Withdraw only to the wallet you have a seed phrase to.</p>
                    <!--<ul class="list-simple">
                        <li>Withdraw to the wallet you own first (the one you have a seed phrase to);</li>
                        <li>Do not withdraw to an exchange because many do not accept deposits from smart contracts and your tokens will be lost;</li>
                        <li>Pay attention to {{ $options.HUB_CHAIN_DATA[form.networkTo].shortName }} and Minter Hub fees;</li>
                        <li>
                            {{ $td('Minter Hub is', 'hub.warning-description-2') }}
                            <a class="link--default" href="https://github.com/MinterTeam/mhub2" target="_blank">{{ $td('open-source', 'hub.warning-description-3') }}</a>.
                            {{ $td('If needed, you may investigate its code before making use of the features offered on this page.', 'hub.warning-description-4') }}
                        </li>
                    </ul>-->
                </template>
                <template v-if="$i18n.locale === 'ru'">
                    <p class="u-mb-05"><span class="u-emoji">⚠️</span> <strong class="u-fw-600">Внимание!</strong></p>
                    <p>Вывод средств возможен только на ваш персональный адрес. Не допускается вывод средств на смарт-контракты, адреса бирж или адреса, к которым у вас нет доступа по seed-фразе.</p>
                    <!--<ul class="list-simple">
                        <li>Вывод средств возможен только на ваш персональный адрес;</li>
                        <li>Не допускается вывод средств на смарт-контракты, адреса бирж или адреса, к которым у вас нет прямого доступа;</li>
                        <li>Всегда обращайте внимание на комиссии в {{ $options.HUB_CHAIN_DATA[form.networkTo].shortName }} и Minter Hub;</li>
                        <li>Minter Hub имеет открытый <a class="link--default" href="https://github.com/MinterTeam/mhub2" target="_blank">исходный код</a>, изучите его при необходимости.</li>
                    </ul>-->
                </template>
            </div>
        </form>

        <!-- Confirm Modal -->
        <Modal :isOpen.sync="isConfirmModalVisible">
            <h2 class="u-h3 u-mb-10">{{ $td('Withdraw', 'hub.withdraw-title') }}</h2>

            <div class="information form-row">
                <h3 class="information__title">{{ $td('You will spend', 'form.you-will-spend') }}</h3>
                <BaseAmountEstimation :coin="form.coin" :amount="form.amount" format="exact"/>

                <h3 class="information__title">{{ $td('You receive', 'form.you-will-get') }}</h3>
                <BaseAmountEstimation :coin="form.coin" :amount="amountToReceive" format="exact"/>

                <h3 class="information__title">{{ $td('To the address', 'form.wallet-send-confirm-address') }}</h3>
                <div class="information__item information__item--content u-text-wrap">
                    {{ form.address }}
                </div>
            </div>

            <HubFeeImpact class="form-row" :coin="form.coin" :fee-impact="totalFeeImpact" :network="$options.HUB_CHAIN_DATA[form.networkTo].shortName"/>

            <div class="form-row">
                <button
                    class="button button--main button--full" type="button" data-focus-on-open
                    :class="{'is-loading': isFormSending}"
                    @click="submit()"
                >
                    <span class="button__content">{{ $td('Confirm', 'form.submit-confirm-button') }}</span>
                    <Loader class="button__loader" :isLoading="true"/>
                </button>
                <button class="button button--ghost-main button--full" type="button" v-if="!isFormSending" @click="isConfirmModalVisible = false">
                    {{ $td('Cancel', 'form.submit-cancel-button') }}
                </button>
            </div>

            <div class="form-row u-text-muted u-text-small">
                <template v-if="$i18n.locale === 'en'">
                    <span class="u-emoji">⚠️</span> <strong>DO NOT</strong> withdraw to an exchange because many do not accept deposits from smart contracts and your tokens will be lost.
                    Withdraw to the wallet you own first (the one you <strong>have a seed phrase</strong> to).
                </template>
                <template v-if="$i18n.locale === 'ru'">
                    <span class="u-emoji">⚠️</span> <strong>НЕ</strong> делайте вывод на биржи, так как многие не зачисляют средства из смарт-контрактов. Вы потеряете свои токены.
                    Выводите на кошелек, которым владеете (от которого у вас <strong>есть сид-фраза</strong>).
                </template>
            </div>
        </Modal>

        <!-- Success Modal -->
        <Modal :isOpen.sync="isSuccessModalVisible" @modal-close="$emit('success-modal-close')">
            <h2 class="u-h3 u-mb-10">{{ $td('Success!', 'form.success-title') }}</h2>

            <div class="u-mb-10">
                <strong>{{ $td('Tx sent:', 'form.tx-sent') }}</strong>
                <a class="link--default u-text-break" :href="getExplorerTxUrl(serverSuccess.hash)" target="_blank" v-if="serverSuccess">{{ serverSuccess.hash }}</a>
            </div>

            <a class="button button--main button--full" :href="getExplorerTxUrl(serverSuccess.hash)" target="_blank" v-if="serverSuccess">
                {{ $td('View transaction', 'form.success-view-button') }}
            </a>
            <button class="button button--ghost-main button--full" type="button" @click="isSuccessModalVisible = false">
                {{ $td('Close', 'form.success-close-button') }}
            </button>
        </Modal>
    </div>
</template>
