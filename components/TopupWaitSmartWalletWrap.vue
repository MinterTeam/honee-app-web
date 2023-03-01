<script>
import {defineComponent} from 'vue';
import {validationMixin} from 'vuelidate/src/index.js';
import required from 'vuelidate/src/validators/required.js';
import {isValidAmount} from '~/assets/utils/validators.js';
import {HUB_BUY_STAGE as LOADING_STAGE, HUB_CHAIN_BY_ID, HUB_CHAIN_DATA, HUB_NETWORK_SLUG} from '~/assets/variables.js';
import {getErrorText} from '~/assets/server-error.js';
import {pretty} from '~/assets/utils.js';
import {findHubCoinItemByTokenAddress, findTokenInfo} from '~/api/hub.js';
import useHubOracle from '~/composables/use-hub-oracle.js';
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import FieldCombined from '~/components/base/FieldCombined.vue';
import Modal from '~/components/base/Modal.vue';
import HubFeeImpact from '~/components/HubFeeImpact.vue';
import TopupWaitSmartWallet from '~/components/TopupWaitSmartWallet.vue';


export default defineComponent({
    LOADING_STAGE,
    HUB_NETWORK_SLUG,
    components: {
        BaseAmountEstimation,
        FieldCombined,
        Modal,
        HubFeeImpact,
        TopupWaitSmartWallet,
    },
    mixins: [validationMixin],
    props: {
        showWaitIndicator: {
            type: Boolean,
            default: false,
        },
    },
    emits: [
        'update:processing',
        'topup',
        'is-show',
    ],
    setup() {
        const {
            initPromise: hubInfoInitPromise,
            // networkNativeCoin,
            hubTokenList,
            // setHubOracleProps,
        } = useHubOracle({
            subscribeTokenList: true,
            // subscribePriceList: true,
        });

        return {
            hubInfoInitPromise,
            // networkNativeCoin,
            hubTokenList,
            // setHubOracleProps,
        };
    },
    data() {
        return {
            processingId: '',
            form: {
                amount: '',
                value: '',
                /** @type {TokenBalanceItem} */
                tokenBalanceItem: undefined,
            },
            /** @type {Record<string, TopupWaitSmartWalletSharedData>}*/
            innerDataList: {},
            serverError: '',
            isConfirmModalVisible: false,
        };
    },
    validations() {
        return {
            form: {
                amount: {
                    required,
                    validAmount: isValidAmount,
                    // maxValue: maxValue(this.maxAmount || 0),
                    minValue: (value) => value > 0,
                    enoughToPayFee: (value) => value >= this.currentData?.smartWalletRelayReward || 0,
                },
            },
        };
    },
    computed: {
        /** @type {Array<TopupWaitComponentProps>} */
        componentPropsList() {
            return [
                getComponentPropsItem(HUB_NETWORK_SLUG.BSC, false),
                getComponentPropsItem(HUB_NETWORK_SLUG.ETHEREUM, false),
                getComponentPropsItem(HUB_NETWORK_SLUG.BSC, true),
                // legacy ethereum was not used
                // getComponentPropsItem(HUB_NETWORK_SLUG.ETHEREUM, true),
            ];
        },
        componentPropsListFinal() {
            if (this.currentComponentProps && this.processingId) {
                return [this.currentComponentProps];
            } else {
                return this.componentPropsList;
            }
        },
        combinedBalanceList() {
            return Object.entries(this.innerDataList)
                .reduce((accumulator, [componentId, { addressBalance }]) => {
                    addressBalance = addressBalance?.length > 0 ? addressBalance : [];
                    addressBalance = addressBalance.map((balanceItem) => {
                        return {
                            ...balanceItem,
                            componentId,
                        };
                    });
                    return accumulator.concat(addressBalance);
                }, []);
        },
        // 'selected' - mean selected by user
        selectedBalanceItem() {
            return this.form.tokenBalanceItem;
        },
        selectedHubChainData() {
            return HUB_CHAIN_DATA[this.selectedBalanceItem?.hubNetworkSlug];
        },
        /** @type {HubCoinItem|undefined} */
        selectedHubCoin() {
            return findHubCoinItemByTokenAddress(this.hubTokenList, this.selectedBalanceItem?.tokenContractAddress, this.selectedHubChainData?.chainId, true);
        },
        tokenSymbol() {
            return this.selectedHubCoin?.symbol || this.selectedBalanceItem?.tokenContractAddress;
        },
        // 'current' - mean chosen between 'selected' or processed by topup
        currentComponentId() {
            return this.processingId || this.selectedBalanceItem?.componentId;
        },
        currentComponentProps() {
            return this.componentPropsList.find((item) => item.id === this.currentComponentId);
        },
        currentData() {
            return this.innerDataList[this.currentComponentId];
        },
        showExistingBalance() {
            return this.combinedBalanceList.length > 0 && !this.processingId;
        },
        showSomething() {
            return this.showExistingBalance || this.processingId || this.currentData?.showSomething;
        },
    },
    watch: {
        showSomething: {
            handler() {
                this.$emit('is-show', this.showSomething);
            },
        },
    },
    methods: {
        pretty,
        handleProcessing(isProcessing, id) {
            if (isProcessing) {
                // cancel other waiters
                this.cancelWaiting();

                // ensure id not overwritten
                if (!this.processingId) {
                    this.processingId = id;
                }
            }

            this.$emit('update:processing', isProcessing);
        },
        handleInnerData(data, hubNetworkSlug, isLegacy) {
            this.$set(this.innerDataList, getId(hubNetworkSlug, isLegacy), data);
        },
        openDepositConfirmation() {
            if (this.$v.$invalid) {
                this.$v.$touch();
                return;
            }

            this.serverError = '';
            this.isConfirmModalVisible = true;
        },
        // cancel waiting and deposit existing balance
        deposit() {
            this.cancelWaiting();
            this.getRef(this.currentComponentProps?.refName)?.deposit?.();
            this.isConfirmModalVisible = false;
        },
        cancelWaiting() {
            this.componentPropsList.forEach((componentProps) => {
                this.getRef(componentProps.refName)?.evmWaitCanceler?.();
            });
        },
        getRef(refName) {
            return this.$refs[refName]?.[0];
        },
    },
});

/**
 * @param {HUB_NETWORK_SLUG} networkSlug
 * @param {boolean} isLegacy
 * @return {string}
 */
function getId(networkSlug, isLegacy) {
    return `${networkSlug}${isLegacy ? '-legacy' : ''}`;
}
function getRefName(id) {
    return `topup-wait-${id}`;
}

/**
 * @typedef {object} TopupWaitComponentProps
 * @property {HUB_NETWORK_SLUG} networkSlug
 * @property {boolean} isLegacy
 * @property {string} id
 * @property {string} refName
 */
/**
 * @param {HUB_NETWORK_SLUG} networkSlug
 * @param {boolean} isLegacy
 * @return {TopupWaitComponentProps}
 */
function getComponentPropsItem(networkSlug, isLegacy) {
    return {
        networkSlug,
        isLegacy,
        id: getId(networkSlug, isLegacy),
        refName: getRefName(getId(networkSlug, isLegacy)),
    };
}
</script>

<template>
    <div v-show="showSomething">
        <div class="form-row" v-if="showExistingBalance">
            <p>{{ $td(`You have available funds on you smart-wallet address. Do you want to deposit it?`, 'topup.deposit-sw-balance-description') }}</p>

            <div class="u-mt-10">
                <FieldCombined
                    class="h-field--is-readonly"
                    :coin.sync="form.value"
                    :coin-list="combinedBalanceList"
                    :fallback-to-full-list="false"
                    :amount.sync="form.amount"
                    :$amount="$v.form.amount"
                    :label="$td('Choose amount', 'form.amount')"
                    :max-value="form.tokenBalanceItem?.amount"
                    :use-balance-for-max-value="false"
                    @select-suggestion="form.tokenBalanceItem = $event"
                    @blur="/*handleInputBlur(); */$v.form.amount.$touch()"
                />
                <span class="form-field__error" v-if="$v.form.amount.$dirty && !$v.form.amount.required">{{ $td('Enter amount', 'form.enter-amount') }}</span>
                <span class="form-field__error" v-else-if="$v.form.amount.$dirty && (!$v.form.amount.validAmount || !$v.form.amount.minValue)">{{ $td('Invalid amount', 'form.invalid-amount') }}</span>
                <span class="form-field__error" v-else-if="$v.form.amount.$dirty && !$v.form.amount.enoughToPayFee">{{ $td('Not enough to pay fee', 'form.not-enough-to-pay-fee') }}</span>
                <!--                        <span class="form-field__error" v-else-if="$v.form.amount.$dirty && !$v.form.amount.maxValue">{{ $td('Not enough', 'form.not-enough') }} {{ form.coinToGet }} ({{ $td('max.', 'form.max') }} {{ pretty(maxAmount) }})</span>-->
            </div>

            <button type="button" class="button button--main button--full u-mt-10" :class="{'is-disabled': $v.$invalid}" @click="openDepositConfirmation()">
                {{ $td('Deposit', 'topup.deposit-evm-balance-button') }}
            </button>
        </div>

        <TopupWaitSmartWallet
            class="u-text-center u-text-medium"
            v-for="componentProps in componentPropsListFinal"
            :key="componentProps.id"
            :ref="componentProps.refName"
            :showWaitIndicator="false"
            :networkSlug="componentProps.networkSlug"
            :is-legacy="componentProps.isLegacy"
            :form="form"
            @update:processing="handleProcessing($event, componentProps.id)"
            @topup="$emit('topup', $event);"
            @update:data="handleInnerData($event, componentProps.networkSlug, componentProps.isLegacy, )"
        />

        <!-- Confirm modal -->
        <Modal class="u-text-left" :isOpen.sync="isConfirmModalVisible">
            <h2 class="u-h3 form-row">
                {{ $td('Deposit', 'topup.confirm-deposit-title') }}
            </h2>

            <div class="information form-row">
                <h3 class="information__title">{{ $td('You will spend', 'form.you-will-spend') }}</h3>
                <BaseAmountEstimation :coin="tokenSymbol" :amount="form.amount" format="exact"/>

                <h3 class="information__title">{{ $td('You will get approximately', 'form.swap-confirm-receive-estimation') }}</h3>
                <BaseAmountEstimation :coin="tokenSymbol" :amount="currentData?.amountAfterDeposit" format="approx"/>
            </div>

            <HubFeeImpact class="form-row" :coin="tokenSymbol" :fee-impact="currentData?.totalFeeImpact" :network="selectedHubChainData?.shortName"/>

            <div class="form-row">
                <button
                    class="button button--main button--full" type="button" data-focus-on-open
                    @click="deposit()"
                >
                    {{ $td('Confirm', 'form.submit-confirm-button') }}
                </button>
                <button class="button button--ghost-main button--full u-mt-05" type="button" @click="isConfirmModalVisible = false">
                    {{ $td('Cancel', 'form.submit-cancel-button') }}
                </button>
            </div>
        </Modal>
    </div>
</template>