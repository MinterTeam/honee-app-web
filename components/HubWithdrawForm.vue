<script>
import Big from '~/assets/big.js';
import {validationMixin} from 'vuelidate/src/index.js';
import required from 'vuelidate/src/validators/required.js';
import minValue from 'vuelidate/src/validators/minValue.js';
import maxValue from 'vuelidate/src/validators/maxValue.js';
import minLength from 'vuelidate/src/validators/minLength.js';
import {FEE_PRECISION_SETTING} from 'minter-js-sdk/src/api/estimate-tx-commission.js';
import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
import {convertToPip} from 'minterjs-util/src/converter.js';
import {postTx} from '~/api/gate.js';
import {getOracleFee} from '~/api/hub.js';
import {getExplorerTxUrl, pretty, prettyPrecise} from '~/assets/utils.js';
import {HUB_MINTER_MULTISIG_ADDRESS, HUB_CHAIN_ID, HUB_CHAIN_DATA} from '~/assets/variables.js';
import {getErrorText} from '~/assets/server-error.js';
import {getAvailableSelectedBalance} from '~/components/base/FieldCombinedBaseAmount.vue';
import useFee from '~/composables/use-fee.js';
import useHubDiscount from '~/composables/use-hub-discount.js';
import useHubToken from '~/composables/use-hub-token.js';
import Loader from '~/components/base/BaseLoader.vue';
import Modal from '~/components/base/Modal.vue';
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import FieldAddress from '~/components/base/FieldAddress.vue';
import FieldCombined from '~/components/base/FieldCombined.vue';
import FieldSelect from '~/components/base/FieldSelect.vue';
import HubFeeImpact from '~/components/HubFeeImpact.vue';


const SPEED_MIN = 'min';
const SPEED_FAST = 'fast';

let interval;

export default {
    SPEED_MIN,
    SPEED_FAST,
    HUB_CHAIN_ID,
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
    setup() {
        const {fee, setFeeProps} = useFee();
        const { discount, discountUpsidePercent, setDiscountProps } = useHubDiscount();
        const {hubCoin: coinItem, tokenPrice: coinPrice, tokenData: externalToken, networkHubCoinList, setHubTokenProps} = useHubToken();

        return {
            fee,
            setFeeProps,

            discount,
            discountUpsidePercent,
            setDiscountProps,

            coinItem,
            coinPrice,
            externalToken,
            networkHubCoinList,
            setHubTokenProps,
        };
    },
    fetch() {
        return this.getDestinationFee();
    },
    data() {
        return {
            // fee for destination network calculated in dollars
            destinationFee: {
                min: 0,
                fast: 0,
            },
            form: {
                coin: '',
                amount: "",
                // @TODO use eth address from deposit form
                address: this.$store.getters.address.replace('Mx', '0x'),
                speed: SPEED_FAST,
                networkTo: HUB_CHAIN_ID.ETHEREUM,
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
        coinId() {
            return this.coinItem?.minterId;
        },
        hubFeeRate() {
            const discountModifier = 1 - this.discount;
            // commission to withdraw is taken from origin token data (e.g. chainId: 'minter' for withdraw)
            return new Big(this.coinItem?.commission || 0.01).times(discountModifier).toString();
        },
        hubFeeRatePercent() {
            return new Big(this.hubFeeRate).times(100).toString();
        },
        // fee for destination network calculated in COIN
        coinFee() {
            if (this.coinPrice === '0') {
                return 0;
            }
            const destinationFee = this.form.speed === SPEED_MIN ? this.destinationFee.min : this.destinationFee.fast;

            return new Big(destinationFee).div(this.coinPrice).toString();
        },
        // fee to Hub bridge calculated in COIN
        hubFee() {
            const amount = new Big(this.coinFee).plus(this.form.amount || 0);
            // x / (1 - x)
            const inverseRate = new Big(this.hubFeeRate).div(new Big(1).minus(this.hubFeeRate));
            return amount.times(inverseRate).toString();
        },
        /*
        totalFee() {
            return new Big(this.coinFee).plus(this.hubFee).toString();
        },
        */
        amountToSend() {
            return new Big(this.form.amount || 0).plus(this.coinFee).plus(this.hubFee).toString();
        },
        amountToSpend() {
            if (this.form.coin === this.fee.coinSymbol) {
                return new Big(this.amountToSend).plus(this.fee.value).toString();
            } else {
                return this.amountToSend;
            }
        },
        // positive price impact means lose of value
        totalFeeImpact() {
            const totalSpend = this.amountToSpend;
            const totalResult = this.form.amount;
            if (!totalSpend || !totalResult) {
                return 0;
            }
            return Math.min((totalSpend - totalResult) / totalSpend * 100, 100);
        },
        maxAmount() {
            const selectedCoin = this.$store.state.balance.find((coin) => {
                return coin.coin.symbol === this.form.coin;
            });
            // coin not selected
            if (!selectedCoin) {
                return 0;
            }
            const availableAmount = getAvailableSelectedBalance(selectedCoin, this.fee);

            const maxHubFee = new Big(availableAmount).times(this.hubFeeRate);
            const maxAmount = new Big(availableAmount).minus(maxHubFee).minus(this.coinFee);
            if (maxAmount.lt(0)) {
                return 0;
            } else {
                return maxAmount.toString();
            }
        },
        minAmount() {
            return getHubMinAmount(this.coinFee, this.hubFeeRate);
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
        'form.networkTo': {
            handler() {
                // fetch fee for updated network
                this.destinationFee = {min: 0, fast: 0};
                this.getDestinationFee();
            },
        },
    },
    created() {
        // hubTokenProps
        this.$watch(
            () => ({
                chainId: HUB_CHAIN_DATA[this.form.networkTo].chainId,
                tokenSymbol: this.form.coin,
            }),
            (newVal) => this.setHubTokenProps(newVal),
            {deep: true, immediate: true},
        );

        // discountProps
        this.$watch(
            () => ({
                minterAddress: this.$store.getters.address,
                ethAddress: this.form.address,
            }),
            (newVal) => this.setDiscountProps(newVal),
            {deep: true, immediate: true},
        );

        // feeBusParams
        this.$watch(
            () => ({
                txParams: {
                    // gasCoin: this.form.gasCoin,
                    type: TX_TYPE.SEND,
                    data: {
                        to: HUB_MINTER_MULTISIG_ADDRESS,
                        // value: this.amountToSend,
                        value: 0,
                        coin: this.coinId,
                    },
                    payload: JSON.stringify({
                        recipient: this.form.address,
                        type: 'send_to_' + this.form.networkTo,
                        // fee for destination network
                        fee: convertToPip(this.coinFee),
                    }),
                },
                baseCoinAmount: this.$store.getters.baseCoinAmount,
                fallbackToCoinToSpend: true,
                isOffline: !this.$store.state.onLine,
                precision: FEE_PRECISION_SETTING.PRECISE,
            }),
            (newVal) => this.setFeeProps(newVal),
            {deep: true, immediate: true},
        );
    },
    mounted() {
        interval = setInterval(() => {
            this.getDestinationFee();
        }, 30 * 1000);
    },
    destroyed() {
        clearInterval(interval);
    },
    methods: {
        pretty,
        prettyPrecise,
        getExplorerTxUrl,
        getDestinationFee({checkWarning} = {}) {
            if (!this.form.networkTo) {
                return 0;
            }
            return getOracleFee(this.form.networkTo)
                .then((fee) => {
                    if (checkWarning && new Big(fee.fast).gt(this.destinationFee.fast)) {
                        // don't send form, show warning to user, so he has to press Submit again
                        this.serverWarning = true;
                    }
                    this.destinationFee = fee;
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
                type: TX_TYPE.SEND,
                data: {
                    to: HUB_MINTER_MULTISIG_ADDRESS,
                    value: this.amountToSend,
                    coin: this.coinId,
                },
                payload: JSON.stringify({
                    recipient: this.form.address,
                    type: 'send_to_' + this.form.networkTo,
                    // fee for destination network
                    fee: convertToPip(this.coinFee),
                }),
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
            this.form.address = '';
            this.form.amount = '';
            this.form.coin = '';
            // this.form.speed = SPEED_MIN;
        },
    },
};

/**
 * // Minter Hub not consider discount in amount validation, so we need compensate amount for discount difference
 * @param {number|string} destinationNetworkFee
 * @param {number|string} hubFeeRate
 * @param {number|string} hubFeeBaseRate - hub fee rate without discount (0.01)
 * @return {number|string}
 */
function getHubMinAmount(destinationNetworkFee, hubFeeRate, hubFeeBaseRate = 0.01) {
    // minAmount = hubFeeBase - hubFee
    // But while form.amount increase hubFee increase too, so we need to find such formAmount which will be equal minAmount, it will be maximum minAmount

    // Some 7 grade math below
    // hubFeeBase = (destinationNetworkFee + formAmount) * (0.01 / (1 - 0.01));
    // hubFee = (destinationNetworkFee + formAmount) * (hubFeeRate / (1 - hubFeeRate))
    // define (a = hubFeeBaseRate; b = hubFeeRate)
    // minAmount = (destinationNetworkFee + formAmount) * (a / (1 - a)) - (destinationNetworkFee + formAmount) * (b / (1 - b))
    // minAmount = (destinationNetworkFee + formAmount) * ((a / (1 - a) - (b / (1 - b));
    // minAmount = (destinationNetworkFee + formAmount) * x;

    // Let's calculate factor x
    // x = a / (1 - a) - b / (1 - b)
    // x = a * (1-b) / ((1-a)*(1-b)) - b * (1-a) / ((1-a)*(1-b))
    // x = (a * (1-b) - b * (1-a)) / ((1-a)*(1-b))
    // x = (a - ab - b + ab) / ((1-a)*(1-b))
    // x = (a - b) / ((1-a)*(1-b))
    // const factor = (hubFeeBaseRate - hubFeeRate) / ((1 - hubFeeBaseRate) * (1 - hubFeeRate));
    const factor = new Big(hubFeeBaseRate).minus(hubFeeRate).div(new Big(1).minus(hubFeeBaseRate).times(new Big(1).minus(hubFeeRate))).toString();

    // We are finding formAmount equal to minAmount (fa = formAmount, dnf = destinationNetworkFee)
    // fa = minAmount
    // fa = (fa + dnf) * x
    // fa = fa * x + dnf * x
    // fa - fa * x = dnf * x
    // fa * 1 - fa * x = dnf * x
    // fa * (1 -x) = dnf * x
    // fa = dnf * x / (1 - x)
    // const minAmount = destinationNetworkFee * factor / (1 - factor);
    const minAmount = new Big(destinationNetworkFee).times(factor).div(new Big(1).minus(factor)).toString();
    // add 1 pip because 0 will not pass validation too
    return new Big(minAmount).plus(1e-18).toString();
}
</script>

<template>
    <div class="">
        <!-- Form -->
        <form class="panel__section" @submit.prevent="submitConfirm()">
            <div class="form-row">
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
                    :max-value="maxAmount"
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
            <div class="form-row">
                <FieldAddress
                    v-model.trim="form.address"
                    :$value="$v.form.address"
                    :label="$td('Withdraw to address', 'hub.withdraw-address')"
                    placeholder="0x…"
                />
                <span class="form-field__error" v-if="$v.form.address.$dirty && !$v.form.address.required">{{ $td('Enter', 'hub.withdraw-address-required') }} {{ $options.HUB_CHAIN_DATA[form.networkTo].shortName }} {{ $td('address', 'hub.withdraw-address-title') }}</span>
                <span class="form-field__error" v-else-if="$v.form.address.$dirty && !$v.form.address.validAddress">{{ $td('Invalid', 'hub.withdraw-address-invalid') }} {{ $options.HUB_CHAIN_DATA[form.networkTo].shortName }} {{ $td('address', 'hub.withdraw-address-title') }}</span>
            </div>
            <div class="information form-row" v-if="form.coin">
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

                <h3 class="information__title">{{ $td('Total spend', 'hub.withdraw-estimate') }}</h3>
                <BaseAmountEstimation :coin="form.coin" :amount="amountToSpend" format="exact"/>
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
                    <ul class="list-simple list-simple--small">
                        <li>Withdraw to the wallet you own first (the one you have a seed phrase to);</li>
                        <li>Do not withdraw to an exchange because many do not accept deposits from smart contracts and your tokens will be lost;</li>
                        <li>Pay attention to {{ $options.HUB_CHAIN_DATA[form.networkTo].shortName }} and Minter Hub fees;</li>
                        <li>
                            {{ $td('Minter Hub is', 'hub.warning-description-2') }}
                            <a class="link--default" href="https://github.com/MinterTeam/mhub2" target="_blank">{{ $td('open-source', 'hub.warning-description-3') }}</a>.
                            {{ $td('If needed, you may investigate its code before making use of the features offered on this page.', 'hub.warning-description-4') }}
                        </li>
                    </ul>
                </template>
                <template v-if="$i18n.locale === 'ru'">
                    <p class="u-mb-05"><span class="u-emoji">⚠️</span> <strong class="u-fw-600">Внимание</strong></p>
                    <ul class="list-simple list-simple--small">
                        <li>Вывод средств возможен только на ваш персональный адрес;</li>
                        <li>Не допускается вывод средств на смарт-контракты, адреса бирж или адреса, к которым у вас нет прямого доступа;</li>
                        <li>Всегда обращайте внимание на комиссии в {{ $options.HUB_CHAIN_DATA[form.networkTo].shortName }} и Minter Hub;</li>
                        <li>Minter Hub имеет открытый <a class="link--default" href="https://github.com/MinterTeam/mhub2" target="_blank">исходный код</a>, изучите его при необходимости.</li>
                    </ul>
                </template>
            </div>
        </form>

        <!-- Confirm Modal -->
        <Modal :isOpen.sync="isConfirmModalVisible">
            <h2 class="u-h3 u-mb-10">{{ $td('Withdraw', 'hub.withdraw-title') }}</h2>

            <div class="information form-row">
                <h3 class="information__title">{{ $td('You will spend', 'form.you-will-spend') }}</h3>
                <BaseAmountEstimation :coin="form.coin" :amount="amountToSpend" format="exact"/>

                <h3 class="information__title">{{ $td('You receive', 'form.you-will-get') }}</h3>
                <BaseAmountEstimation :coin="form.coin" :amount="form.amount" format="exact"/>

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
        <Modal :isOpen.sync="isSuccessModalVisible">
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
