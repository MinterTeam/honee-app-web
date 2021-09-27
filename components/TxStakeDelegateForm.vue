<script>
import {validationMixin} from 'vuelidate';
import required from 'vuelidate/lib/validators/required';
import minLength from 'vuelidate/lib/validators/minLength';
import maxLength from 'vuelidate/lib/validators/maxLength';
import autosize from 'v-autosize';
import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
import {isValidPublic} from "minterjs-util/src/public.js";
import eventBus from '~/assets/event-bus.js';
import focusElement from '~/assets/focus-element.js';
import checkEmpty from '~/assets/v-check-empty.js';
import BaseAmount from '~/components/base/BaseAmount.vue';
import TxForm from '~/components/base/TxForm.vue';
import TxFormBlocksToUpdateStake from '~/components/base/TxFormBlocksToUpdateStake.vue';
import FieldCoin from '~/components/base/FieldCoin.vue';
import FieldRecipient from '@/components/base/FieldRecipient.vue';
import FieldUseMax from '~/components/base/FieldUseMax.vue';

export default {
    TX_TYPE,
    components: {
        BaseAmount,
        TxForm,
        TxFormBlocksToUpdateStake,
        FieldCoin,
        FieldRecipient,
        FieldUseMax,
    },
    directives: {
        checkEmpty,
        autosize,
    },
    mixins: [validationMixin],
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
    mounted() {
        eventBus.on('activate-delegate', ({hash}) => {
            this.form.publicKey = hash;

            const inputEl = this.$refs.fieldCoin.$el.querySelector('select, input');
            focusElement(inputEl);
        });
    },
    destroyed() {
        eventBus.off('activate-delegate');
    },
    methods: {
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
    <TxForm
        :txData="form"
        :$txData="$v.form"
        :txType="$options.TX_TYPE.DELEGATE"
        @clear-form="clearForm()"
    >
        <template v-slot:panel-header>
            <h1 class="panel__header-title">
                {{ $td('Delegate', 'delegation.delegate-title') }}
            </h1>
            <p class="panel__header-description">
                {{ $td('You can delegate your tokens to validators and receive related payments in accordance with the terms of participation.', 'delegation.delegate-description') }}
            </p>
        </template>

        <template v-slot:default="{fee, addressBalance}">
            <div class="u-cell u-cell--xlarge--1-2">
                <FieldRecipient
                    v-model.trim="form.publicKey"
                    :$value="$v.form.publicKey"
                    valueType="publicKey"
                    :label="$td('Public key', 'form.masternode-public')"
                />
            </div>
            <div class="u-cell u-cell--small--1-2 u-cell--xlarge--1-4">
                <FieldCoin
                    ref="fieldCoin"
                    v-model="form.coin"
                    :$value="$v.form.coin"
                    :label="$td('Coin', 'form.coin')"
                    :coin-list="addressBalance"
                    :select-mode="true"
                    coin-type="coin"
                />
                <span class="form-field__error" v-if="$v.form.coin.$dirty && !$v.form.coin.required">{{ $td('Enter coin symbol', 'form.coin-error-required') }}</span>
                <span class="form-field__error" v-else-if="$v.form.coin.$dirty && !$v.form.coin.minLength">{{ $td('Min 3 letters', 'form.coin-error-min') }}</span>
                <!--<span class="form-field__error" v-else-if="$v.form.coin.$dirty && !$v.form.coin.maxLength">{{ $td('Max 10 letters', 'form.coin-error-max') }}</span>-->
            </div>
            <div class="u-cell u-cell--small--1-2 u-cell--xlarge--1-4">
                <FieldUseMax
                    v-model="form.stake"
                    :$value="$v.form.stake"
                    :label="$td('Stake', 'form.masternode-stake')"
                    :selected-coin-symbol="form.coin"
                    :fee="fee"
                    :address-balance="addressBalance"
                />
                <span class="form-field__error" v-if="$v.form.stake.$dirty && !$v.form.stake.required">{{ $td('Enter stake', 'form.masternode-stake-error-required') }}</span>
            </div>
        </template>

        <template v-slot:submit-title>
            {{ $td('Delegate', `form.delegation-delegate-button`) }}
        </template>

        <template v-slot:confirm-modal-header>
            <h1 class="panel__header-title">
                <img class="panel__header-title-icon" :src="`${BASE_URL_PREFIX}/img/icon-delegate.svg`" alt="" role="presentation" width="40" height="40">
                {{ $td('Delegate', 'delegation.delegate-title') }}
            </h1>
        </template>

        <template v-slot:confirm-modal-body>
            <div class="u-grid u-grid--small u-grid--vertical-margin u-text-left">
                <div class="u-cell">
                    <div class="form-field form-field--dashed">
                        <BaseAmount tag="div" class="form-field__input is-not-empty" :coin="form.coin" :amount="form.stake" :exact="true"/>
                        <div class="form-field__label">{{ $td('You delegate', 'form.delegation-delegate-confirm-amount') }}</div>
                    </div>
                </div>
                <div class="u-cell">
                    <label class="form-field form-field--dashed">
                        <textarea
                            class="form-field__input is-not-empty" autocapitalize="off" spellcheck="false" readonly tabindex="-1" rows="1"
                            v-autosize
                            :value="validatorFullName"
                        ></textarea>
                        <span class="form-field__label">{{ $td('To the masternode', 'form.delegation-delegate-confirm-address') }}</span>
                    </label>
                </div>
            </div>
        </template>

        <template v-slot:confirm-modal-footer>
            <div class="u-text-left" v-html="$td('', 'form.delegation-delegate-confirm-note')"></div>
        </template>

        <template v-slot:success-modal-body-extra="{successTx}">
            <TxFormBlocksToUpdateStake :success-tx="successTx" v-if="successTx"/>
        </template>
    </TxForm>
</template>