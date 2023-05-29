<script>
import {validationMixin} from 'vuelidate/src/index.js';
import required from 'vuelidate/src/validators/required';
import withParams from 'vuelidate/src/withParams';
import autosize from 'v-autosize';
import {isValidMnemonic} from 'minterjs-wallet';
import checkEmpty from '~/assets/v-check-empty.js';
import {IS_ONBOARDING_DISABLED} from '~/assets/variables.js';

const mnemonicValidator = withParams({type: 'mnemonic'}, isValidMnemonic);

export default {
    directives: {
        autosize,
        checkEmpty,
    },
    mixins: [validationMixin],
    props: {
        onboardingUrl: {
            type: String,
        },
        fieldClass: {
            type: String,
        },
    },
    data() {
        return {
            mnemonic: '',
        };
    },
    validations: {
        mnemonic: {
            required,
            validMnemonic: mnemonicValidator,
        },
    },
    methods: {
        addAddress() {
            if (this.$v.$invalid) {
                this.$v.$touch();
                return;
            }
            // clear old format stored data
            this.$store.commit('LOGOUT');
            this.$store.commit('ADD_AUTH_ADVANCED', this.mnemonic);
            this.authorize();
        },
        authorize() {
            // redirect
            let authRedirectPath;
            if (this.onboardingUrl && !IS_ONBOARDING_DISABLED) {
                authRedirectPath = this.onboardingUrl;
            } else {
                authRedirectPath = this.$store.state.authRedirectPath || this.DASHBOARD_URL;
                this.$store.commit('SET_AUTH_REDIRECT_PATH', '');
            }
            this.$router.push(this.$i18nGetPreferredPath({path: authRedirectPath}));
        },
    },
};
</script>

<template>
    <form class="" @submit.prevent="addAddress()">
        <div class="form-row">
            <div class="h-field" :class="[{'is-error': $v.mnemonic.$error}, fieldClass]">
                <textarea
                    class="h-field__input h-field__input--medium" rows="2" autocapitalize="off"
                    :placeholder="$td('Enter your seed phrase', 'index.enter-seed')"
                    v-autosize
                    v-model.trim="mnemonic"
                    @blur="$v.mnemonic.$touch()"
                ></textarea>
            </div>
            <div class="form-field__error u-text-center" v-if="$v.mnemonic.$dirty && !$v.mnemonic.required">{{ $td('Enter phrase', 'index.seed-not-entered') }}</div>
            <div class="form-field__error u-text-center" v-if="$v.mnemonic.$dirty && $v.mnemonic.required && !$v.mnemonic.validMnemonic">{{ $td('Invalid phrase', 'index.invalid-seed') }}</div>
        </div>

        <div class="form-row">
            <button type="submit" class="button button--main button--full" :class="{'is-disabled': $v.$invalid}">{{ $td('Sign in', 'index.sign-in') }}</button>
        </div>
    </form>
</template>
