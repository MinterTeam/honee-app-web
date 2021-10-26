<script>
import {validationMixin} from 'vuelidate';
import required from 'vuelidate/lib/validators/required.js';
import minLength from 'vuelidate/lib/validators/minLength.js';
import maxLength from 'vuelidate/lib/validators/maxLength.js';
import autosize from 'v-autosize';
import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
import {isValidAddress} from "minterjs-util/src/prefix.js";
import {prettyExact} from "~/assets/utils.js";
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import TxForm from '~/components/base/TxForm.vue';
import FieldCombined from '~/components/base/FieldCombined.vue';
import FieldAddress from '~/components/base/FieldAddress.vue';

export default {
    TX_TYPE,
    components: {
        BaseAmountEstimation,
        TxForm,
        FieldCombined,
        FieldAddress,
    },
    directives: {
        autosize,
    },
    mixins: [validationMixin],
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
                address: '',
                amount: '',
                coinSymbol: '',
            },
        };
    },
    validations() {
        const form = {
            address: {
                required,
                validAddress: isValidAddress,
            },
            amount: {
                required,
            },
            coinSymbol: {
                required,
                minLength: minLength(3),
            },
        };

        return {form};
    },
    computed: {
    },
    methods: {
        prettyExact,
        clearForm() {
            this.form.address = '';
            this.form.amount = '';
            this.form.coinSymbol = '';
            this.$v.$reset();
        },
    },
};
</script>

<template>
    <TxForm
        :txData="{to: form.address, value: form.amount, coin: form.coinSymbol}"
        :$txData="$v.form"
        :txType="$options.TX_TYPE.SEND"
        @clear-form="clearForm()"
    >
        <template v-slot:panel-header>
            <h1 class="u-h3 u-mb-10">
                {{ action ? $td(action.title, action.langKey) : $td('Send coins', 'form.wallet-send-title') }}
            </h1>
            <!--
            <p class="panel__header-description">
                {{ $td('Transfer your coins to whomever you want—friends, family members, or business partners.', 'form.wallet-send-description') }}
            </p>
            -->
        </template>

        <template v-slot:default>
            <div class="form-row">
                <FieldCombined
                    :coin.sync="form.coinSymbol"
                    :$coin="$v.form.coinSymbol"
                    :coinList="$store.state.balance"
                    :amount.sync="form.amount"
                    :$amount="$v.form.amount"
                    :useBalanceForMaxValue="true"
                    :label="$td('Amount', 'form.wallet-send-amount')"
                />
                <span class="form-field__error" v-if="$v.form.coinSymbol.$dirty && !$v.form.coinSymbol.required">{{ $td('Enter coin symbol', 'form.coin-error-required') }}</span>
                <span class="form-field__error" v-else-if="$v.form.coinSymbol.$dirty && !$v.form.coinSymbol.minLength">{{ $td('Min 3 letters', 'form.coin-error-min') }}</span>
                <span class="form-field__error" v-if="$v.form.amount.$dirty && !$v.form.amount.required">{{ $td('Enter amount', 'form.amount-error-required') }}</span>
            </div>

            <div class="form-row">
                <FieldAddress
                    v-model.trim="form.address"
                    :$value="$v.form.address"
                    valueType="address"
                    :label="$td('To the address', 'form.wallet-send-address')"
                />
            </div>
        </template>

        <template v-slot:confirm-modal-header>
            <h2 class="u-h3 u-mb-10">
<!--                <img class="panel__header-title-icon" :src="`${BASE_URL_PREFIX}/img/icon-send.svg`" alt="" role="presentation" width="40" height="40">-->
                {{ $td('Send coins', 'form.wallet-send-title') }}
            </h2>
        </template>

        <template v-slot:confirm-modal-body>
            <div class="estimation form-row">
                <h3 class="estimation__title">{{ $td('You send', 'form.wallet-send-confirm-amount') }}</h3>
                <BaseAmountEstimation :coin="form.coinSymbol" :amount="form.amount" format="exact"/>

                <h3 class="estimation__title">{{ $td('To the address', 'form.wallet-send-confirm-address') }}</h3>
                <div class="estimation__item estimation__item--content u-text-wrap">
                    {{ form.address }}
                </div>
            </div>
        </template>
    </TxForm>
</template>
