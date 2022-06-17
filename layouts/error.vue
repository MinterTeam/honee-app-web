<script>
import {getErrorText} from '~/assets/server-error.js';

export default {
    layout({store}) {
        return store.getters.isAuthorized ? 'default' : 'splash';
    },
    props: {
        error: {
            type: Object,
            required: true,
        },
    },
    computed: {
        statusCode() {
            // error's statusCode 500 is invalid, because it shows on network errors
            if (this.error.statusCode === 500) {
                return '';
            }
            // axios status
            return this.error.response?.status || this.error.request?.status
            // custom status
            || this.error.status
            || this.error.statusCode;
        },
        message() {
            let errorText = getErrorText(this.error, '');
            //@TODO workaround for https://github.com/axios/axios/issues/2103
            if (errorText === 'timeout of 0ms exceeded') {
                errorText = 'Network error: request timed out';
            }
            return errorText;
        },
    },
};
</script>

<template>
    <div class="error__container u-container u-container--small">
        <div class="error__section u-section">
            <h1 class="error__title">{{ $td('Error', 'error.title-error') }} {{ statusCode }}</h1>
            <p class="error__description" v-if="statusCode === 404 && !error.useMessage">{{ $td('Page not found', 'error.message-404') }}</p>
            <p class="error__description" v-else-if="statusCode === 504 && !error.useMessage" v-html="$td('Request failed with status code 504. <br> Gateway time-out.', 'error.message-504')"></p>
            <p class="error__description" v-else-if="statusCode === 503 && !error.useMessage" v-html="$td('The webpage is currently unavailable. <br> It may be overloaded or down for maintenance.', 'error.message-503')"></p>
            <p class="error__description" v-else-if="message === 'Network Error'">{{ $td('Network Error', 'error.message-network') }}</p>
            <p class="error__description" v-else>{{ message }}</p>
            <p>
                <span class="button-group">
                    <a class="button button--ghost" href="" v-if="statusCode !== 404">{{ $td('Refresh page', 'error.refresh-link') }}</a>
                    <a class="button button--ghost" href="/" v-if="$route.path !== '/'">{{ $td('Return to main page', 'error.return-link') }}</a>
                </span>
            </p>
        </div>
    </div>
</template>
