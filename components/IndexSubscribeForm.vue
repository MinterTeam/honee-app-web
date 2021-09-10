<script>
import {validationMixin} from 'vuelidate';
import required from 'vuelidate/lib/validators/required.js';
import email from 'vuelidate/lib/validators/email.js';
import {subscribe} from "~/api/honee.js";
import {getServerValidator, fillServerErrors, getErrorText} from "~/assets/server-error.js";
import checkEmpty from '~/assets/v-check-empty.js';

export default {
    components: {
    },
    directives: {
        checkEmpty,
    },
    mixins: [validationMixin],
    data() {
        return {
            isFormSending: false,
            serverError: '',
            serverSuccess: false,
            form: {
                email: '',
            },
            sve: {
                email: {invalid: false, isActual: false, message: ''},
            },
        };
    },
    validations: {
        form: {
            email: {
                required,
                email,
                server: getServerValidator('email'),
            },
        },
    },
    methods: {
        submitForm() {
            if (this.isFormSending) {
                return;
            }
            if (this.$v.$invalid) {
                this.$v.$touch();
                return;
            }
            this.isFormSending = true;
            this.serverError = '';
            this.serverSuccess = false;
            subscribe(this.form.email)
                .then((response) => {
                    this.isFormSending = false;
                    this.serverSuccess = true;
                })
                .catch((error) => {
                    let hasValidationErrors = fillServerErrors(error, this.sve);
                    if (!hasValidationErrors) {
                        this.serverError = getErrorText(error);
                    }
                    this.isFormSending = false;
                });
        },
    },
};
</script>

<template>
    <form class="" novalidate @submit.prevent="submitForm">
        <div class="hello__form" v-if="!serverSuccess">
            <div class="hello__form-field">
                <label class="form-field" :class="{'is-error': $v.form.email.$error}">
                    <input class="form-field__input" type="text" v-check-empty
                           v-model.trim="form.email"
                           @blur="$v.form.email.$touch()"
                           @input="sve.email.isActual = false"
                    >
                    <span class="form-field__label">{{ $td('E-mail', 'index.input-email') }}</span>
                </label>
                <span class="form-field__error" v-if="$v.form.email.$dirty && !$v.form.email.required">{{ $td('Enter your e-mail', 'index.input-email-error-required') }}</span>
                <span class="form-field__error" v-else-if="$v.form.email.$dirty && !$v.form.email.email">{{ $td('Invalid e-mail', 'index.input-email-error-invalid') }}</span>
                <span class="form-field__error" v-else-if="$v.form.email.$dirty && !$v.form.email.server">{{ sve.email.message }}</span>
            </div>

            <button class="hello__form-button button button--main" :class="{'is-loading': isFormSending}">
                <span class="button__content">{{ $td('Send', 'index.subscribe-button') }}</span>
                <svg class="loader loader--button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
                    <circle class="loader__path" cx="20" cy="20" r="11"></circle>
                </svg>
            </button>

        </div>
        <div class="form-field__error" v-if="serverError">{{ serverError }}</div>
        <div class="hello__form-success" v-if="serverSuccess">
            {{ $td('Perfect, we’ll notify you!', 'index.subscribe-success') }}
        </div>
    </form>
</template>
