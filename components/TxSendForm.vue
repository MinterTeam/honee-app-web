<script>
import {validationMixin} from 'vuelidate';
import required from 'vuelidate/lib/validators/required.js';
import minLength from 'vuelidate/lib/validators/minLength.js';
import maxLength from 'vuelidate/lib/validators/maxLength.js';
import autosize from 'v-autosize';
import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
import {isValidAddress} from "minterjs-util/src/prefix.js";
import {prettyExact} from "~/assets/utils.js";
import BaseAmount from '~/components/base/BaseAmount.vue';
import TxForm from '~/components/base/TxForm.vue';
import FieldCombined from '~/components/base/FieldCombined.vue';
import FieldAddress from '~/components/base/FieldAddress.vue';

export default {
    TX_TYPE,
    components: {
        BaseAmount,
        TxForm,
        FieldCombined,
        FieldAddress,
    },
    directives: {
        autosize,
    },
    mixins: [validationMixin],
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
            <h1 class="panel__header-title">
                {{ $td('Send coins', 'wallet.send-title') }}
            </h1>
            <p class="panel__header-description">
                {{ $td('Transfer your coins to whomever you want—friends, family members, or business partners.', 'wallet.send-description') }}
            </p>
        </template>

        <template v-slot:default>
            <div class="u-cell">
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

            <div class="u-cell">
                <FieldAddress
                    v-model.trim="form.address"
                    :$value="$v.form.address"
                    valueType="address"
                    :label="$td('To the address', 'form.wallet-send-address')"
                />
            </div>
        </template>

        <template v-slot:confirm-modal-header>
            <h1 class="panel__header-title">
<!--                <img class="panel__header-title-icon" :src="`${BASE_URL_PREFIX}/img/icon-send.svg`" alt="" role="presentation" width="40" height="40">-->
                {{ $td('Send coins', 'wallet.send-title') }}
            </h1>
        </template>

        <template v-slot:confirm-modal-body>
            <div class="u-grid u-grid--small u-grid--vertical-margin u-text-left">
                <div class="u-cell">
                    <div class="form-field form-field--dashed">
                        <BaseAmount tag="div" class="form-field__input is-not-empty" :coin="form.coinSymbol" :amount="form.amount" :exact="true"/>
                        <div class="form-field__label">{{ $td('You send', 'form.wallet-send-confirm-amount') }}</div>
                    </div>
                </div>
                <div class="u-cell">
                    <label class="form-field form-field--dashed">
                        <textarea
                            class="form-field__input is-not-empty" autocapitalize="off" spellcheck="false" readonly tabindex="-1" rows="1"
                            v-autosize
                            :value="form.address"
                        ></textarea>
                        <span class="form-field__label">{{ $td('To the address', 'form.wallet-send-confirm-address') }}</span>
                    </label>
                </div>
            </div>
        </template>
    </TxForm>
</template>
