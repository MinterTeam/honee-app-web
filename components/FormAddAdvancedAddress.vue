<script>
    import {validationMixin} from 'vuelidate';
    import required from 'vuelidate/lib/validators/required';
    import withParams from 'vuelidate/lib/withParams';
    import autosize from 'v-autosize';
    import {isValidMnemonic, walletFromMnemonic} from 'minterjs-wallet';
    import checkEmpty from '~/assets/v-check-empty.js';
    import {} from '~/assets/variables.js';

    const mnemonicValidator = withParams({type: 'mnemonic'}, isValidMnemonic);

    export default {
        mixins: [validationMixin],
        directives: {
            autosize,
            checkEmpty,
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
                const authRedirectPath = this.$store.state.authRedirectPath || '/';
                this.$store.commit('SET_AUTH_REDIRECT_PATH', '');
                this.$router.push(this.$i18nGetPreferredPath({path: authRedirectPath}));
            },
        },
    };
</script>

<template>
    <form class="" @submit.prevent="addAddress">
        <label class="form-field form-row" :class="{'is-error': $v.mnemonic.$error}">
            <textarea class="form-field__input" rows="3" autocapitalize="off" v-check-empty v-autosize
                      v-model.trim="mnemonic"
                      @blur="$v.mnemonic.$touch()"
            ></textarea>
            <span class="form-field__label">Enter your seed phrase</span>
            <span class="form-field__error" v-if="$v.mnemonic.$dirty && !$v.mnemonic.required">Enter phrase</span>
            <span class="form-field__error" v-if="$v.mnemonic.$dirty && $v.mnemonic.required && !$v.mnemonic.validMnemonic">Invalid phrase</span>
        </label>
        <div class="form-row">
            <button class="button button--main button--full" :class="{'is-disabled': $v.$invalid}">Sign in</button>
        </div>
    </form>
</template>
