<script>
import {validationMixin} from 'vuelidate/src/index.js';
import required from 'vuelidate/src/validators/required.js';
import minLength from 'vuelidate/src/validators/minLength.js';
import maxLength from 'vuelidate/src/validators/maxLength.js';
import maxValue from 'vuelidate/src/validators/maxValue.js';
import minValue from 'vuelidate/src/validators/minValue.js';
import autosize from 'v-autosize';
import {getOracleCoinList} from '~/api/hub.js';
import {createPortfolio, updatePortfolio} from '~/api/portfolio.js';
import {NETWORK, MAINNET} from '~/assets/variables.js';
import {getErrorText} from '~/assets/server-error.js';
import customTokenList from '~/data/tokens.js';
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import BaseLoader from '~/components/base/BaseLoader.vue';
import Modal from '~/components/base/Modal.vue';
import FieldCombined from '~/components/base/FieldCombined.vue';

const MIN_COUNT = 2;
const MAX_COUNT = 10;
const MIN_ALLOCATION = 5;

const disabledTokens = [
    'COFOUNDER',
    // 'BEE',
    'HUBABUBA',
    'SQD',
];
const customDisabledTokenEntries = Object.entries(customTokenList)
    .filter(([coinSymbol, tokenData]) => tokenData.hide)
    .map(([coinSymbol, tokenData]) => [coinSymbol, true]);
const disabledTokenMap = Object.fromEntries(customDisabledTokenEntries);

export default {
    MIN_COUNT,
    MAX_COUNT,
    MIN_ALLOCATION,
    components: {
        BaseAmountEstimation,
        BaseLoader,
        Modal,
        FieldCombined,

    },
    directives: {
        autosize,
    },
    mixins: [validationMixin],
    props: {
        portfolio: {
            type: Object,
            default: null,
        },
    },
    data() {
        const initialCoins = this.portfolio?.coins.map((item) => {
            return {
                //@TODO not loaded yet
                symbol: this.$store.state.explorer.coinMapId[item.id]?.symbol,
                allocation: item.allocation,
            };
        });

        return {
            isFormSending: false,
            serverError: '',
            serverSuccess: null,
            isConfirmModalVisible: false,
            isSuccessModalVisible: false,
            form: {
                title: this.portfolio?.title || '',
                description: this.portfolio?.description || '',
                coinList: initialCoins || [
                    getEmptyCoin(),
                    getEmptyCoin(),
                ],
            },
            // tokens available to use in portfolio
            tokenList: [],
        };
    },
    validations() {
        const form = {
            title: {
                required,
            },
            description: {
            },
            coinList: {
                required,
                minLength: minLength(MIN_COUNT),
                maxLength: maxLength(MAX_COUNT),
                $each: {
                    symbol: {
                        required,
                        minLength: minLength(3),
                    },
                    allocation: {
                        required,
                        minValue: minValue(MIN_ALLOCATION),
                        maxValue: maxValue(100),
                    },
                },
            },
        };

        return {
            form,
            allocationSum: {
                isValid: (value) => value === 100,
            },
        };
    },
    computed: {
        isNew() {
            return !this.portfolio;
        },
        allocationSum() {
            return this.form.coinList.reduce((accumulator, item) => accumulator + Number(item.allocation), 0);
        },
    },
    fetch() {
        const promiseList = [];
        if (this.isNew) {
            promiseList.push(this.$store.dispatch('telegram/fetchAuth'));
        }

        if (NETWORK === MAINNET) {
            const tokenListPromise = getOracleCoinList()
                .then((tokenList) => {
                    tokenList = tokenList
                        .map((item) => item.symbol)
                        .filter((coinSymbol) => !disabledTokenMap[coinSymbol]);
                    this.tokenList = Object.freeze(tokenList);
                });
            promiseList.push(tokenListPromise);
        }
        return Promise.all(promiseList);
    },
    methods: {
        /**
         * @param {UpdatePortfolio} portfolio
         */
        managePortfolio(portfolio) {
            if (this.isNew) {
                return createPortfolio(portfolio, this.$store.getters.privateKey, this.$store.getters['telegram/authString']);
            } else {
                return updatePortfolio(this.portfolio.id, portfolio, this.$store.getters.privateKey);
            }
        },
        openConfirmation() {
            if (this.isFormSending) {
                return;
            }
            if (this.$v.$invalid) {
                this.$v.$touch();
                return;
            }

            this.isConfirmModalVisible = true;
            this.serverError = '';
        },
        submit() {
            if (this.isFormSending) {
                return;
            }

            if (this.$v.$invalid) {
                this.$v.$touch();
                return;
            }

            this.isConfirmModalVisible = false;
            this.isFormSending = true;
            this.serverError = '';

            const coinList = this.form.coinList.map((coin) => {
                return {
                    id: this.$store.state.explorer.coinMap[coin.symbol].id,
                    allocation: Number(coin.allocation),
                };
            });

            this.managePortfolio({
                title: this.form.title,
                description: this.form.description || undefined,
                coins: coinList,
            })
                .then((portfolio) => {
                    this.serverSuccess = portfolio;
                    this.isSuccessModalVisible = true;
                    this.isFormSending = false;
                    this.clearForm();
                })
                .catch((error) => {
                    console.log(error);
                    this.isFormSending = false;
                    this.serverError = getErrorText(error);
                });
        },
        addToken() {
            this.form.coinList.push(getEmptyCoin());
        },
        removeToken(index) {
            this.form.coinList.splice(index, 1);
        },
        clearForm() {
            this.$v.$reset();
            this.$set(this, 'form', {
                title: '',
                description: '',
                coinList: [
                    getEmptyCoin(),
                    getEmptyCoin(),
                ],
            });
        },
    },
};

function getEmptyCoin() {
    return {
        symbol: '',
        allocation: '',
    };
}
</script>

<template>
    <div class="card card--pop card--light-grey">
        <form class="card__content card__content--medium" novalidate @submit.prevent="openConfirmation()">
            <div class="form-row" v-for="(v$coin, index) in $v.form.coinList.$each.$iter" :key="index">
                <FieldCombined
                    placeholder="0%"
                    is-percent
                    scale="2"
                    :coin.sync="v$coin.symbol.$model"
                    :$coin="v$coin.symbol"
                    :coin-list="tokenList"
                    :amount.sync="v$coin.allocation.$model"
                    :$amount="v$coin.allocation"
                    :label="$td(`Token #${Number(index) + 1}`, 'portfolio.manage-coin-label', {index: Number(index) + 1})"
                >
                    <template v-slot:aside-caption v-if="form.coinList.length > $options.MIN_COUNT">
                        <button type="button" class="u-semantic-button u-text-red link--opacity" @click="removeToken(index)">{{ $td('Remove', 'portfolio.manage-coin-remove') }}</button>
                    </template>
                </FieldCombined>
                <span class="form-field__error" v-if="v$coin.symbol.$dirty && !v$coin.symbol.required">{{ $td('Enter coin', 'form.coin-error-required') }}</span>
                <span class="form-field__error" v-else-if="v$coin.symbol.$dirty && !v$coin.symbol.minLength">{{ $td('Min 3 letters', 'form.coin-error-min') }}</span>
                <span class="form-field__error" v-else-if="v$coin.allocation.$dirty && !v$coin.allocation.required">{{ $td('Enter amount', 'form.amount-error-required') }}</span>
                <span class="form-field__error" v-else-if="v$coin.allocation.$dirty && !v$coin.allocation.minValue">{{ $td('Minimum', 'form.range-error-min') }} {{ $options.MIN_ALLOCATION }}%</span>
                <span class="form-field__error" v-else-if="v$coin.allocation.$error">{{ $td('Wrong amount', 'form.number-invalid') }}</span>
            </div>
            <div class="form-row form-field__error u-text-center" v-if="$v.form.coinList.$dirty && !$v.form.coinList.minLength">
                {{ $td(`Minimum ${$options.MIN_COUNT} tokens`, 'portfolio.manage-tokens-error-min', {count: $options.MIN_COUNT}) }}
            </div>
            <div class="form-row form-field__error u-text-center" v-if="$v.form.coinList.$dirty && !$v.form.coinList.maxLength">
                {{ $td(`Maximum ${$options.MAX_COUNT} tokens`, 'portfolio.manage-tokens-error-max', {count: $options.MAX_COUNT}) }}
            </div>
            <div class="form-row" v-if="form.coinList.length < $options.MAX_COUNT">
                <button type="button" class="button button--ghost-main button--full" @click="addToken()">
                    + {{ $td('Add another token', 'portfolio.manage-coin-add') }}
                </button>
            </div>
            <div class="form-row">
                <div class="information information--warning">
                    <div class="information__item">
                        {{ $td('Current allocation sum', 'portfolio.allocation-sum') }}
                        <div class="information__value">{{ allocationSum }}%</div>
                    </div>
                    <div class="information__item information__item--content information__muted u-text-medium" v-if="$v.allocationSum.$invalid">{{ $td('Asset allocation sum must be 100%, please add more tokens or adjust percentage.', 'portfolio.allocation-sum-error') }}</div>
                </div>
            </div>

            <hr class="card__fake-divider">

            <div class="form-row">
                <div class="h-field" :class="{'is-error': $v.form.title.$error}">
                    <div class="h-field__content">
                        <div class="h-field__title">{{ $td('Title', 'portfolio.manage-title-label') }}</div>
                        <textarea
                            class="h-field__input h-field__input--medium" rows="1"
                            v-autosize
                            v-model.trim="form.title"
                            @blur="$v.form.title.$touch()"
                        ></textarea>
                    </div>
                </div>
                <div class="form-field__error" v-if="$v.form.title.$dirty && !$v.form.title.required">{{ $td('Enter title', 'portfolio.manage-title-error-required') }}</div>
            </div>
            <div class="form-row">
                <div class="h-field" :class="{'is-error': $v.form.description.$error}">
                    <div class="h-field__content">
                        <div class="h-field__title">{{ $td('Short description (optional)', 'portfolio.manage-description-label') }}</div>
                        <textarea
                            class="h-field__input h-field__input--medium" rows="1"
                            v-autosize
                            v-model.trim="form.description"
                            @blur="$v.form.description.$touch()"
                        ></textarea>
                    </div>
                </div>
            </div>

            <hr class="card__fake-divider">

            <div class="form-row">
                <button
                    class="button button--main button--full" type="submit"
                    :class="{'is-loading': isFormSending, 'is-disabled': $v.$invalid}"
                >
                    <span v-if="isNew" class="button__content">{{ $td('Create', 'portfolio.manage-create-button') }}</span>
                    <span v-else class="button__content">{{ $td('Save', 'portfolio.manage-save-button') }}</span>
                    <BaseLoader class="button__loader" :isLoading="true"/>
                </button>
            </div>
            <div class="form-row form-field__error u-text-center" v-if="$v.allocationSum.$error">
                {{ $td('Allocation sum must be 100%', 'portfolio.allocation-sum-error') }}
            </div>
            <div class="form-row form-field__error u-text-center" v-else-if="serverError">
                {{ serverError }}
            </div>
            <p class="form-row u-text-center u-text-muted u-text-small">{{ $td('By clicking this button, you confirm that you’ve read and understood the disclaimer in the footer.', 'form.read-understood') }}</p>
        </form>
        <div class="card__content card__content--medium u-text-medium">
            <h3 class="u-h5 u-mb-05">{{ $td('Terms', 'common.terms') }}</h3>
            <ul v-if="$i18n.locale === 'en'" class="list-simple list-simple--small">
                <li>You can create only 1 portfolio</li>
                <li>You can edit portfolio once a day</li>
                <li>You will accrue success fee from users exiting your portfolio with profit (only for portfolio managers with Premium accounts)</li>
            </ul>
            <ul v-if="$i18n.locale === 'ru'" class="list-simple list-simple--small">
                <li>Вы можете создать только 1 портфель</li>
                <li>Вы можете редактировать портфель раз в сутки</li>
                <li>Вы будете получать награду от прибыли пользователей, выходящих из вашего портфеля (только для управляющих с Premium-аккаунтами)</li>
            </ul>
        </div>


        <!-- Confirm Modal -->
        <Modal :isOpen.sync="isConfirmModalVisible">
            <h2 class="u-h3 u-mb-10">
                <template v-if="isNew">
                    {{ $td('Confirm portfolio create', 'portfolio.manage-confirm-create-title') }}
                </template>
                <template v-else>
                    {{ $td('Confirm portfolio edit', 'portfolio.manage-confirm-edit-title') }}
                </template>
            </h2>
            <div class="information form-row">
                <h3 class="information__title">{{ $td('Title', 'portfolio.manage-title-label') }}</h3>
                <div class="information__item information__item--content">{{ form.title }}</div>

                <template v-if="form.description">
                    <h3 class="information__title">{{ $td('Short description', 'portfolio.manage-confirm-description') }}</h3>
                    <div class="information__item information__item--content u-text-medium u-text-break">{{ form.description }}</div>
                </template>

                <h3 class="information__title">{{ $td('Tokens', 'portfolio.manage-token-list-title') }}</h3>
                <BaseAmountEstimation
                    v-for="coin in form.coinList"
                    :key="coin.symbol"
                    :coin="coin.symbol"
                    :amount="coin.allocation"
                    unit="%"
                    format="exact"
                />
            </div>

            <button
                class="button button--main button--full form-row" type="button" data-focus-on-open
                :class="{'is-loading': isFormSending}"
                @click="submit()"
            >
                <span class="button__content">{{ $td('Confirm', 'form.submit-confirm-button') }}</span>
                <BaseLoader class="button__loader" :isLoading="true"/>
            </button>
            <button class="button button--ghost-main button--full form-row" type="button" @click="isConfirmModalVisible = false">
                {{ $td('Cancel', 'form.submit-cancel-button') }}
            </button>
        </Modal>

        <!-- success modal -->
        <Modal
            :isOpen.sync="isSuccessModalVisible"
            @modal-close="$router.push(getDashboardUrl())"
        >
            <h2 class="u-h3 u-mb-10">{{ $td('Success', 'form.success-title') }}</h2>
            <p class="u-mb-10">
                <template v-if="isNew">
                    {{ $td('Portfolio successfully created!', 'portfolio.manage-success-created') }}
                </template>
                <template v-else>
                    {{ $td('Portfolio successfully edited!', 'portfolio.manage-success-edited') }}
                </template>
            </p>

            <nuxt-link class="button button--main button--full" :to="$i18nGetPreferredPath(`/portfolio/${serverSuccess.id}`)" v-if="serverSuccess">
                {{ $td('View portfolio', 'portfolio.manage-success-view') }}
            </nuxt-link>
            <button class="button button--ghost-main button--full" type="button" @click="isSuccessModalVisible = false">
                {{ $td('Close', 'form.success-close-button') }}
            </button>
        </Modal>
    </div>
</template>
