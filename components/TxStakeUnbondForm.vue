<script>
    import {validationMixin} from 'vuelidate';
    import required from 'vuelidate/lib/validators/required';
    import minLength from 'vuelidate/lib/validators/minLength';
    import maxLength from 'vuelidate/lib/validators/maxLength';
    import autosize from 'v-autosize';
    import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
    import {isValidPublic} from "minterjs-util/src/public";
    import checkEmpty from '~/assets/v-check-empty';
    import {pretty, prettyExact} from "~/assets/utils";
    import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
    import TxForm from '~/components/base/TxForm.vue';
    import TxFormBlocksToUpdateStake from '~/components/base/TxFormBlocksToUpdateStake.vue';
    import FieldCombined from '~/components/base/FieldCombined.vue';
    import FieldValidator from '~/components/base/FieldValidator.vue';

    export default {
        TX_TYPE,
        components: {
            BaseAmountEstimation,
            TxForm,
            TxFormBlocksToUpdateStake,
            FieldCombined,
            FieldValidator,
        },
        directives: {
            checkEmpty,
            autosize,
        },
        mixins: [validationMixin],
        fetch() {
            return this.$store.dispatch('FETCH_STAKE_LIST');
        },
        props: {
            action: {
                type: Object,
            },
            params: {
                type: Object,
                default: () => ({}),
            },
        },
        data() {
            return {
                form: {
                    publicKey: this.params.publicKey || '',
                    stake: this.params.stake || '',
                    coin: this.params.coin?.toUpperCase() || '',
                },
            };
        },
        validations() {
            const form = {
                publicKey: {
                    required,
                    validPublicKey: isValidPublic,
                },
                stake: {
                    required,
                },
                coin: {
                    required,
                    minLength: minLength(3),
                },
            };

            return {form};
        },
        computed: {
            maxAmount() {
                // no validator selected
                if (!this.stakeList?.length) {
                    return;
                }
                // no coin entered
                if (!this.form.coin) {
                    return;
                }
                const selectedCoin = this.stakeList.find((coin) => {
                    return coin.coin.symbol === this.form.coin;
                });
                // coin not selected
                if (!selectedCoin) {
                    return undefined;
                }
                return selectedCoin.value;
            },
            validatorData() {
                let validatorList = {};
                const stakeList = this.$store.state.stakeList;
                stakeList.forEach((item) => {
                    if (!validatorList[item.validator.publicKey]) {
                        validatorList[item.validator.publicKey] = {
                            ...item.validator,
                            stakeList: [],
                        };
                    }
                    validatorList[item.validator.publicKey].stakeList.push({
                        coin: item.coin,
                        value: item.value,
                    });
                });
                return validatorList;
            },
            /**
             * //@TODO filter basing on selected coin
             * @return {Array<SuggestionValidatorListItem>|undefined}
             */
            suggestionValidatorList() {
                return Object.values(this.validatorData).map((validatorItem) => {
                    const delegatedAmount = validatorItem.stakeList.reduce((accumulator, stakeItem) => {
                        const stakeItemValue = stakeItem.coin.symbol + '&nbsp;' + pretty(stakeItem.value);
                        if (!accumulator) {
                            return stakeItemValue;
                        } else {
                            return accumulator + ', ' + stakeItemValue;
                        }
                    }, '');
                    return {
                        name: validatorItem.name,
                        publicKey: validatorItem.publicKey,
                        value: validatorItem.publicKey,
                        iconUrl: validatorItem.iconUrl,
                        delegatedAmount,
                    };
                });
            },
            stakeList() {
                const selectedValidator = this.validatorData[this.form.publicKey];
                if (selectedValidator) {
                    return selectedValidator.stakeList;
                } else {
                    return undefined;
                }
            },
            selectedValidatorName() {
                if (this.$v.form.publicKey.$invalid) {
                    return null;
                }
                const validator = this.$store.state.validatorMetaList.find((item) => item.publicKey === this.form.publicKey);
                return validator?.name;
            },
            validatorFullName() {
                let result = '';
                if (this.selectedValidatorName) {
                    result += this.selectedValidatorName + '\n';
                }
                result += this.form.publicKey;

                return result;
            },
        },
        watch: {
            'form.publicKey': function(newVal) {
                if (this.stakeList?.length === 1) {
                    this.form.coin = this.stakeList[0].coin.symbol;
                }
            },
        },
        methods: {
            prettyExact,
            clearForm() {
                this.form.publicKey = '';
                this.form.stake = '';
                this.form.coin = '';
                this.$v.$reset();
            },
        },
    };
</script>

<template>
    <div>
        <TxForm
            v-if="$store.state.stakeList.length"
            :txData="form"
            :$txData="$v.form"
            :txType="$options.TX_TYPE.UNBOND"
            @clear-form="clearForm()"
        >
            <template v-slot:panel-header>
                <h1 class="u-h3 u-mb-10">
                    {{ action ? $td(action.title, action.langKey) : $td('Unbond', 'action.title-unbond') }}
                </h1>
                <!--
                <p class="panel__header-description">
                    {{ $td('In case you don’t want the validator to handle your holdings anymore, all you need to do is submit the request for unbonding. The process will be finalized in 30 days since the request has been sent.', 'form.unbond-description') }}
                </p>
                -->
            </template>

            <template v-slot:default>
                <div class="form-row">
                    <FieldValidator
                        v-model.trim="form.publicKey"
                        :$value="$v.form.publicKey"
                        :suggestionList="suggestionValidatorList"
                        :label="$td('From validator', 'form.masternode-public')"
                    />
                </div>
                <div class="form-row">
                    <FieldCombined
                        :coin.sync="form.coin"
                        :$coin="$v.form.coin"
                        :coinList="stakeList"
                        coin-type="coin"
                        :amount.sync="form.stake"
                        :$amount="$v.form.stake"
                        :max-value="maxAmount"
                        :label="$td('Stake', 'form.masternode-stake')"
                    />
                    <span class="form-field__error" v-if="$v.form.coin.$dirty && !$v.form.coin.required">{{ $td('Enter coin', 'form.coin-error-required') }}</span>
                    <span class="form-field__error" v-if="$v.form.coin.$dirty && !$v.form.coin.minLength">{{ $td('Min 3 letters', 'form.coin-error-min') }}</span>
                    <span class="form-field__error" v-if="$v.form.stake.$dirty && !$v.form.stake.required">{{ $td('Enter stake', 'form.masternode-stake-error-required') }}</span>
                </div>
            </template>

            <template v-slot:submit-title>
                {{ $td('Unbond', 'form.delegation-unbond-button') }}
            </template>

            <template v-slot:confirm-modal-header>
                <h2 class="u-h3 u-mb-10">
                    <!--                <img class="panel__header-title-icon" :src="`${BASE_URL_PREFIX}/img/icon-unbond.svg`" alt="" role="presentation" width="40" height="40">-->
                    {{ $td('Unbond', 'action.title-unbond') }}
                </h2>
            </template>

            <template v-slot:confirm-modal-body>
                <div class="estimation form-row">
                    <h3 class="estimation__title">{{ $td('You unbond', 'form.delegation-unbond-confirm-amount') }}</h3>
                    <BaseAmountEstimation :coin="form.coin" :amount="form.stake" format="exact"/>

                    <h3 class="estimation__title">{{ $td('From the masternode', 'form.delegation-unbond-confirm-address') }}</h3>
                    <div class="estimation__item estimation__item--content u-text-wrap">
                        {{ validatorFullName }}
                    </div>
                </div>

                <div class="form-row u-text-muted u-text-small u-text-center" v-html="$td('', 'form.delegation-unbond-confirm-description')"></div>
            </template>

            <template v-slot:success-modal-body-extra="{successTx}">
                <div v-if="successTx">
                    <TxFormBlocksToUpdateStake :success-tx="successTx"/>

                    {{ $td('Coins will return to your address in 518,400 blocks (~30 days).', 'form.coins-will-return') }}
                </div>
            </template>
        </TxForm>
        <div v-else-if="$fetchState.pending">{{ $td('Loading…', 'index.loading') }}</div>
        <div v-else>{{ $td('Nothing to unbond.', 'form.nothing-to-unbond') }}</div>
    </div>
</template>
