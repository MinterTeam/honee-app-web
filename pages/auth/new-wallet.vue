<script>
import {validationMixin} from 'vuelidate';
import withParams from 'vuelidate/lib/withParams';
import {req} from 'vuelidate/lib/validators/common';
import {generateMnemonic} from 'minterjs-wallet';
import getTitle from '~/assets/get-title.js';
import {DASHBOARD_URL} from '~/assets/variables.js';
import BaseButtonCopy from '~/components/base/BaseButtonCopy.vue';

// checkbox validator
const checked = withParams({ type: 'checked' }, (value) => {
    return !req(value) || value === true;
});

export default {
    PAGE_TITLE: this.$td('Sign up', 'index.sign-up'),
    layout: 'splash',
    components: {
        BaseButtonCopy,
    },
    mixins: [validationMixin],
    head() {
        return {
            title: getTitle(this.$options.PAGE_TITLE),
            meta: [
                { hid: 'og-title', name: 'og:title', content: getTitle(this.$options.PAGE_TITLE) },
            ],
        };
    },
    data() {
        return {
            mnemonic: '',
            isMnemonicSaved: false,
            isToastVisible: false,
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
            const authRedirectPath = this.$store.state.authRedirectPath || DASHBOARD_URL;
            this.$store.commit('SET_AUTH_REDIRECT_PATH', '');
            this.$router.push(this.$i18nGetPreferredPath({path: authRedirectPath}));
        },
    },
};
</script>

<template>
    <div class="u-section">

        <div class="form-row u-text-center">
            <h1 class="u-h3 u-mb-05">{{ $td('Sign up', 'index.sign-up-2') }}</h1>
            <p>{{ $td('Save this seed phrase to access your funds in the future.', 'index.save-phrase-warning') }}</p>
        </div>
        <div class="form-field form-field--with-icon form-field--without-label form-row">
            <div class="form-field__input is-not-empty">{{ mnemonic }}</div>
            <BaseButtonCopy class="form-field__icon form-field__icon--copy u-semantic-button link--opacity" :copy-text="mnemonic">
                <img src="/img/icon-copy.svg" alt="Copy">
            </BaseButtonCopy>
        </div>
        <div class="form-row">
            <label class="form-check">
                <input class="form-check__input" type="checkbox" v-model="isMnemonicSaved">
                <span class="form-check__label form-check__label--checkbox">{{ $td('I've saved the phrase!', 'index.save-phrase-checkbox') }}</span>
            </label>
        </div>
        <div class="form-row">
            <button class="button button--main button--full" :class="{'is-disabled': !isMnemonicSaved}" @click="authorize">{{ $td('Launch Honee', 'index.launch-honee') }}</button>
            <div class="form__error u-mt-05 u-text-center" v-if="$v.isMnemonicSaved.$error">{{ $td('You must save the phrase', 'index.save-phrase-error') }}</div>

            <nuxt-link class="button button--ghost button--full u-mt-05" :to="$i18nGetPreferredPath('/auth')">{{ $td('Back', 'index.back') }}</nuxt-link>
        </div>




        <p class="u-mt-20">{{ $td('We do not provide custody services for any virtual assets. It is your sole responsibility to store your seed phrase in a safe location. You should backup your seed phrase immediately upon its generation. If you lose your seed phrase, you will not be able to restore it and will lose all of your funds stored in the respective wallet.', 'index.create-wallet-disclaimer') }}</p>
    </div>
</template>

