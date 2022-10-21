<script>
import {validationMixin} from 'vuelidate/src/index.js';
import withParams from 'vuelidate/src/withParams';
import {req} from 'vuelidate/src/validators/common';
import {generateMnemonic} from 'minterjs-wallet';
import getTitle from '~/assets/get-title.js';
import {DASHBOARD_URL} from '~/assets/variables.js';
import BaseButtonCopyIcon from '~/components/base/BaseButtonCopyIcon.vue';

// checkbox validator
const checked = withParams({ type: 'checked' }, (value) => {
    return !req(value) || value === true;
});

export default {
    components: {
        BaseButtonCopyIcon,
    },
    mixins: [validationMixin],
    props: {
        finishUrl: {
            type: String,
            // default: DASHBOARD_URL,
            default: '/onboarding/topup',
        },
    },
    data() {
        return {
            mnemonic: '',
            isMnemonicSaved: false,
        };
    },
    validations: {
        isMnemonicSaved: {
            checked,
        },
    },
    mounted() {
        this.mnemonic = generateMnemonic();
    },
    methods: {
        authorize() {
            if (this.$v.$invalid) {
                this.$v.$touch();
                return;
            }
            // clear old format stored data
            this.$store.commit('LOGOUT');
            this.$store.commit('ADD_AUTH_ADVANCED', this.mnemonic);
            // redirect
            const authRedirectPath = this.$store.state.authRedirectPath || this.finishUrl;
            this.$store.commit('SET_AUTH_REDIRECT_PATH', '');
            this.$router.push(this.$i18nGetPreferredPath({path: authRedirectPath}));
        },
    },
};
</script>

<template>
    <form class="card card__content" @submit.prevent="authorize()">
        <div class="form-row u-text-center">
            <h1 class="u-h3 u-mb-05">{{ $td('Sign up', 'index.sign-up-2') }}</h1>
            <p class="u-text-medium">{{ $td('Save this seed phrase to access your funds in&nbsp;the&nbsp;future.', 'index.save-phrase-warning') }}</p>
        </div>
        <div class="h-field h-field--is-readonly form-row">
            <div class="h-field__content">
                <div class="h-field__input h-field__input--medium">{{ mnemonic }}</div>
            </div>
            <div class="h-field__aside h-field__aside--with-icon">
                <BaseButtonCopyIcon class="" :copy-text="mnemonic"/>
            </div>
        </div>
        <div class="form-row">
            <label class="form-check">
                <input class="form-check__input" type="checkbox" v-model="isMnemonicSaved">
                <span class="form-check__label form-check__label--checkbox">{{ $td('I\'ve saved the phrase!', 'index.save-phrase-checkbox') }}</span>
            </label>
        </div>
        <div class="form-row">
            <button type="submit" class="button button--main button--full" :class="{'is-disabled': !isMnemonicSaved}">{{ $td('Launch Honee', 'index.launch-honee') }}</button>
            <div class="form__error u-mt-05 u-text-center" v-if="$v.isMnemonicSaved.$error">{{ $td('You must save the phrase', 'index.save-phrase-error') }}</div>

            <!--<nuxt-link class="button button&#45;&#45;ghost button&#45;&#45;full u-mt-05" :to="$i18nGetPreferredPath('/auth')">{{ $td('Back', 'index.back') }}</nuxt-link>-->
        </div>

        <p class="u-mt-20 u-text-medium">
            {{ $td('We do not provide custody services for any virtual assets. It is your sole responsibility to store your seed phrase in a safe location. You should backup your seed phrase immediately upon its generation. If you lose your seed phrase, you will not be able to restore it and will lose all of your funds stored in the respective wallet.', 'index.create-wallet-disclaimer') }}
        </p>
    </form>
</template>

