<script>
    import {validationMixin} from 'vuelidate';
    import required from 'vuelidate/lib/validators/required';
    import minLength from 'vuelidate/lib/validators/minLength';
    import maxLength from 'vuelidate/lib/validators/maxLength';
    import autosize from 'v-autosize';
    import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
    import {isValidPublic} from "minterjs-util/src/public";
    import eventBus from '~/assets/event-bus';
    import focusElement from '~/assets/focus-element';
    import checkEmpty from '~/assets/v-check-empty';
    import {pretty, prettyExact} from "~/assets/utils";
    import BaseAmount from '~/components/base/BaseAmount.vue';
    import TxForm from '~/components/base/TxForm.vue';
    import TxFormBlocksToUpdateStake from '~/components/base/TxFormBlocksToUpdateStake.vue';
    import FieldCombined from '~/components/base/FieldCombined.vue';
    import FieldValidator from '~/components/base/FieldValidator.vue';

    export default {
        TX_TYPE,
        components: {
            BaseAmount,
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
                <h1 class="panel__header-title">
                    {{ $td('Unbond', 'delegation.unbond-title') }}
                </h1>
                <p class="panel__header-description">
                    {{ $td('In case you don’t want the validator to handle your holdings anymore, all you need to do is submit the request for unbonding. The process will be finalized within 30 days after the request has been sent.', 'delegation.unbond-description') }}
                </p>
            </template>

            <template v-slot:default>
                <div class="u-cell">
                    <FieldValidator
                        v-model.trim="form.publicKey"
                        :$value="$v.form.publicKey"
                        :suggestionList="suggestionValidatorList"
                        :label="$td('From validator', 'form.masternode-public')"
                    />
                </div>
                <div class="u-cell">
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
                {{ $td('Unbond', `form.delegation-unbond-button`) }}
            </template>

            <template v-slot:confirm-modal-header>
                <h1 class="panel__header-title">
                    <!--                <img class="panel__header-title-icon" :src="`${BASE_URL_PREFIX}/img/icon-unbond.svg`" alt="" role="presentation" width="40" height="40">-->
                    {{ $td('Unbond', 'delegation.unbond-title') }}
                </h1>
            </template>

            <template v-slot:confirm-modal-body>
                <div class="u-grid u-grid--small u-grid--vertical-margin u-text-left">
                    <div class="u-cell u-text-left" v-html="$td('', 'form.delegation-unbond-confirm-description')"></div>
                    <div class="u-cell">
                        <div class="form-field form-field--dashed">
                            <BaseAmount tag="div" class="form-field__input is-not-empty" :coin="form.coin" :amount="form.stake" :exact="true"/>
                            <div class="form-field__label">{{ $td('You unbond', 'form.delegation-unbond-confirm-amount') }}</div>
                        </div>
                    </div>
                    <div class="u-cell">
                        <label class="form-field form-field--dashed">
                        <textarea
                            class="form-field__input is-not-empty" autocapitalize="off" spellcheck="false" readonly tabindex="-1" rows="1"
                            v-autosize
                            :value="form.publicKey"
                        ></textarea>
                            <span class="form-field__label">{{ $td('From the masternode', 'form.delegation-unbond-confirm-address') }}</span>
                        </label>
                    </div>
                </div>
            </template>

            <template v-slot:success-modal-body-extra="{successTx}">
                <div v-if="successTx">
                    <TxFormBlocksToUpdateStake :success-tx="successTx"/>

                    Coins will return to your address in 518&#x202F;400 blocks (~30 days).
                </div>
            </template>
        </TxForm>
        <div v-else-if="$fetchState.pending">Loading…</div>
        <div v-else>Nothing to unbond</div>
    </div>
</template>
