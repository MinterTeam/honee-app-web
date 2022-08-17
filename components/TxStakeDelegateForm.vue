<script>
import {validationMixin} from 'vuelidate/src/index.js';
import required from 'vuelidate/src/validators/required';
import minLength from 'vuelidate/src/validators/minLength';
import maxLength from 'vuelidate/src/validators/maxLength';
import autosize from 'v-autosize';
import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
import {isValidPublic} from "minterjs-util/src/public.js";
import checkEmpty from '~/assets/v-check-empty.js';
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
        this.$store.dispatch('FETCH_VALIDATOR_META_LIST');
    },
    emits: [
        'success',
        'success-modal-close',
    ],
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
        @success="$emit('success')"
        @success-modal-close="$emit('success-modal-close')"
    >
        <template v-slot:default="{fee}">
            <div class="form-row">
                <FieldCombined
                    :coin.sync="form.coin"
                    :$coin="$v.form.coin"
                    :coinList="$store.state.balance"
                    coin-type="coin"
                    :amount.sync="form.stake"
                    :$amount="$v.form.stake"
                    :useBalanceForMaxValue="true"
                    :fee="fee"
                    :label="$td('Stake', 'form.masternode-stake')"
                />
                <span class="form-field__error" v-if="$v.form.coin.$dirty && !$v.form.coin.required">{{ $td('Enter coin symbol', 'form.coin-error-required') }}</span>
                <span class="form-field__error" v-else-if="$v.form.coin.$dirty && !$v.form.coin.minLength">{{ $td('Min 3 letters', 'form.coin-error-min') }}</span>
                <span class="form-field__error" v-if="$v.form.stake.$dirty && !$v.form.stake.required">{{ $td('Enter stake', 'form.masternode-stake-error-required') }}</span>
            </div>

            <div class="form-row">
                <FieldValidator
                    v-model.trim="form.publicKey"
                    :$value="$v.form.publicKey"
                    :label="$td('To validator', 'form.masternode-public')"
                />
            </div>
        </template>

        <template v-slot:submit-title>
            {{ $td('Delegate', `form.delegation-delegate-button`) }}
        </template>

        <template v-slot:confirm-modal-header>
            <h2 class="u-h3 u-mb-10">
                <!-- <img class="panel__header-title-icon" :src="`${BASE_URL_PREFIX}/img/icon-delegate.svg`" alt="" role="presentation" width="40" height="40">-->
                {{ action.title }}
            </h2>
        </template>

        <template v-slot:confirm-modal-body>
            <div class="information form-row">
                <h3 class="information__title">{{ $td('You delegate', 'form.delegation-delegate-confirm-amount') }}</h3>
                <BaseAmountEstimation :coin="form.coin" :amount="form.stake" format="exact"/>

                <h3 class="information__title">{{ $td('To the masternode', 'form.delegation-delegate-confirm-address') }}</h3>
                <div class="information__item information__item--content u-text-wrap">
                    {{ validatorFullName }}
                </div>
            </div>
        </template>

        <template v-slot:confirm-modal-footer>
            <div class="form-row u-text-small u-text-muted u-text-center" v-html="$td('', 'form.delegation-delegate-confirm-note')"></div>
        </template>

        <template v-slot:success-modal-body-extra="{successTx}">
            <TxFormBlocksToUpdateStake :success-tx="successTx" v-if="successTx"/>
        </template>
    </TxForm>
</template>
