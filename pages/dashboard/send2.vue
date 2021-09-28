<script>
    import axios from 'axios';
    import Big from 'big.js';
    import {IMaskDirective} from 'vue-imask';
    import {validationMixin} from 'vuelidate';
    import required from 'vuelidate/lib/validators/required';
    import maxValue from 'vuelidate/lib/validators/maxValue';
    import maxLength from 'vuelidate/lib/validators/maxLength';
    import withParams from 'vuelidate/lib/withParams';
    import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
    import {isCoinId} from 'minter-js-sdk/src/utils.js';
    import {postTx} from '~/api/gate.js';
    import FeeBus from '~/assets/fee.js';
    import {getServerValidator, getErrorText} from "~/assets/server-error.js";
    import {getAvatarUrl, pretty, prettyExact, getExplorerTxUrl} from '~/assets/utils.js';
    import {DASHBOARD_URL} from '~/assets/variables.js';
    import getTitle from '~/assets/get-title.js';
    import Modal from '~/components/base/Modal.vue';
    import TxFormBlocksToUpdateStake from '@/components/base/TxFormBlocksToUpdateStake.vue';

    let recipientCheckData = null; // storage with latest recipient data to check
    let recipientCheckCancel;
    let recipientError = {
        username: {},
        email: {},
    };

    let feeBus;

    export default {
        TX_TYPE,
        DASHBOARD_URL,
        PAGE_TITLE: 'Send coins',
        components: {
            Modal,
            TxFormBlocksToUpdateStake,
        },
        mixins: [validationMixin],
        directives: {
            imask: IMaskDirective,
        },
        filters: {
            pretty,
            prettyExact,
        },
        head() {
            return {
                title: getTitle(this.$options.PAGE_TITLE),
                meta: [
                    { hid: 'og-title', name: 'og:title', content: getTitle(this.$options.PAGE_TITLE) },
                ],
            };
        },
        data() {
            const coinList = this.$store.state.balance;
            return {
                isFormSending: false,
                successTx: null,
                serverError: '',
                form: {
                    coinSymbol: coinList && coinList.length ? coinList[0].coin.symbol : '',
                    // address or public key
                    address: '',
                    // amount or stake
                    amount: '',
                    message: '',
                },
                sve: {
                    address: {invalid: false, isActual: false, message: ''},
                },
                recipient: {
                    name: '',
                    address: '',
                    type: '',
                },
                // saved recipient entry for success modal
                lastRecipient: {
                    name: '',
                    address: '',
                    type: '',
                },
                // recipientCheckTimer: null,
                // recipientLoading: false, // latest recipient value sent to check and still loading
                amountImaskOptions: {
                    mask: Number,
                    scale: 18, // digits after point, 0 for integers
                    signed: true,  // disallow negative
                    thousandsSeparator: '',  // any single char
                    padFractionalZeros: false,  // if true, then pads zeros at end to the length of scale
                    normalizeZeros: false, // appends or removes zeros at ends
                    radix: '.',  // fractional delimiter
                    mapToRadix: [','],  // symbols to process as radix
                },
                // amountMasked: '',
                /** @type FeeData */
                fee: {},
                isUseMax: false,
                isModalOpen: false,
                isSuccessModalOpen: false,
            };
        },
        validations() {
            return {
                form: {
                    coinSymbol: {
                        required,
                    },
                    address: {
                        required,
                        server: getServerValidator('address'),
                    },
                    amount: {
                        required,
                        maxValue: maxValue(this.maxAmount || 0),
                    },
                    message: {
                        maxLength: maxLength(1024),
                    },
                },
            };
        },
        computed: {
            isRecipientCheckWait() {
                return false;
                // return this.recipientLoading || this.recipientCheckTimer;
            },
            maxAmount() {
                let selectedCoin;
                this.$store.state.balance.some((coin) => {
                    if (coin.coin.symbol === this.form.coinSymbol) {
                        selectedCoin = coin;
                        return true;
                    }
                });
                // coin not selected
                if (!selectedCoin) {
                    return '0';
                }
                // fee not in selected coins
                if (!isSelectedCoinSameAsFeeCoin(selectedCoin.coin, this.fee?.coin)) {
                    return selectedCoin.amount;
                }
                // fee in selected coin, subtract fee
                const amount = new Big(selectedCoin.amount || 0).minus(this.fee.value || 0).toFixed();
                return amount > 0 ? amount : '0';
            },
            feeBusParams() {
                return {
                    txParams: this.txParams,
                    baseCoinAmount: this.$store.getters.baseCoin && this.$store.getters.baseCoin.amount,
                    fallbackToCoinToSpend: true,
                };
            },
            txParams() {
                let type;
                let data;
                if (this.recipient.type === 'publicKey') {
                    const isUnbond = this.form.amount < 0;
                    type = isUnbond ? TX_TYPE.UNBOND : TX_TYPE.DELEGATE;
                    data = {
                        coin: this.form.coinSymbol,
                        stake: isUnbond ? new Big(this.form.amount).times(-1).toFixed() : this.form.amount,
                        publicKey: this.form.address,
                    };
                } else {
                    type = TX_TYPE.SEND;
                    data = {
                        coin: this.form.coinSymbol,
                        value: this.form.amount,
                        to: this.form.address,
                    };
                }

                return {
                    type,
                    data,
                    payload: this.form.message,
                };
            },
        },
        watch: {
            //@TODO loading indicator instead of error
            'recipient.name': {
                handler(newVal) {
                    this.form.address = '';
                    this.recipient.type = '';
                    // recipientCheckData = null;
                    // this.clearRecipientTimer();
                    if (!newVal) {
                        return;
                    }
                    if (newVal.substr(0, 2) === 'Mx') {
                        this.recipient.type = 'address';
                        // address
                        if (newVal.length !== 42) {
                            this.setAddressError('Wrong address length');
                            return;
                        }
                        if (!/^Mx[0-9abcdefABCDEF]*$/.test(newVal)) {
                            this.setAddressError('Wrong address');
                            return;
                        }
                        this.form.address = newVal;
                        this.recipient.address = newVal;
                    } else if (newVal.substr(0, 2) === 'Mp') {
                        this.recipient.type = 'publicKey';
                        // public key
                        if (newVal.length !== 66) {
                            this.setAddressError('Wrong public key length');
                            return;
                        }
                        if (!/^Mp[0-9abcdefABCDEF]*$/.test(newVal)) {
                            this.setAddressError('Wrong public key');
                            return;
                        }
                        this.form.address = newVal;
                        this.recipient.address = newVal;
/*
                    } else if (newVal.substr(0, 1) === '@') {
                        // username
                        if (!/^@\w*$/.test(newVal)) {
                            this.setAddressError('Wrong username');
                            return;
                        }
                        recipientCheckData = {username: newVal.substr(1)};
                        this.recipient.type = 'username';
                        this.recipientCheckTimer = setTimeout(this.checkRecipient, 1000);
                    } else if (newVal.indexOf('@') !== -1) {
                        // email
                        recipientCheckData = {email: newVal};
                        this.recipient.type = 'email';
                        this.recipientCheckTimer = setTimeout(this.checkRecipient, 1000);
*/
                    } else {
                        // wrong recipient
                        this.setAddressError('Wrong recipient');
                    }
                },
            },
            feeBusParams: {
                handler(newVal) {
                    if (feeBus && typeof feeBus.$emit === 'function') {
                        feeBus.$emit('update-params', newVal);
                    }
                },
                deep: true,
            },
        },
        created() {
            feeBus = new FeeBus(this.feeBusParams);
            this.fee = feeBus.fee;
            feeBus.$on('update-fee', (newVal) => {
                this.fee = newVal;
                if (this.isUseMax) {
                    // update form amount to consider updated feeValue
                    this.useMax();
                }
            });
        },
        methods: {
            // force check after blur if needed
            recipientBlur() {
                /*
                if (
                    this.recipientCheckTimer // check was postponed
                    ||
                    (this.recipientLoading && this.recipientLoading !== this.recipient.name) // checking in progress and recipient value changed from last check
                ) {
                    this.clearRecipientTimer();
                    this.checkRecipient();
                }
                */
            },
            /*
            clearRecipientTimer() {
                clearTimeout(this.recipientCheckTimer);
                this.recipientCheckTimer = null;
            },

            checkRecipient() {
                // cancel previous request
                this.clearRecipientTimer();
                if (this.recipientLoading && typeof recipientCheckCancel === 'function') {
                    recipientCheckCancel();
                }
                // check only username and email
                if (this.recipient.type !== 'username' && this.recipient.type !== 'email') {
                    return;
                }
                // new request
                this.recipientLoading = this.recipient.name;
                getAddressInfoByContact(recipientCheckData, new axios.CancelToken((cancelFn) => {
                    recipientCheckCancel = cancelFn;
                }))
                    .then((userInfo) => {
                        this.form.address = userInfo.address;
                        this.recipient.address = userInfo.address;
                        // @TODO user stored users
                        this.recipientLoading = false;
                    })
                    .catch((error) => {
                        recipientError = {
                            username: {},
                            email: {},
                        };
                        if (fillServerErrors(error, recipientError)) {
                            // validation error
                            Object.keys(recipientError).forEach((key) => {
                                if (recipientError[key].message) {
                                    this.setAddressError(recipientError[key].message);
                                }
                            });
                        } else if (error.response && error.response.status && error.response.status < 500) {
                            // server expected error
                            const errorCode = getErrorCode(error);
                            if (errorCode === 'not_found') {
                                if (this.recipient.type === 'username') {
                                    this.setAddressError(`Can't find address for username "${this.recipient.name}"`);
                                }
                                if (this.recipient.type === 'email') {
                                    this.setAddressError(`Can't find address for e-mail "${this.recipient.name}"`);
                                }
                            } else {
                                this.setAddressError(getErrorText(error, ''));
                            }
                        } else {
                            // unexpected error
                            this.setAddressError('Can\'t get address from server');
                        }
                        this.recipientLoading = false;
                    });
            },
            */
            setAddressError(message, code) {
                this.sve.address = {invalid: true, isActual: true, message, code};
            },
            onAcceptAmount(e) {
                // this.amountMasked = e.detail._value;
                this.form.amount = e.detail._unmaskedValue;
                this.isUseMax = false;
            },
            openTxModal() {
                if (this.isFormSending) {
                    return;
                }
                if (this.$v.$invalid) {
                    this.$v.$touch();
                    return;
                }

                this.isModalOpen = true;
            },
            sendTx() {
                if (this.isFormSending) {
                    return;
                }

                if (this.$v.$invalid) {
                    this.$v.$touch();
                    return;
                }

                this.lastRecipient = Object.assign({}, this.recipient);
                this.isFormSending = true;
                this.isModalOpen = false;
                this.serverError = '';
                this.successTx = null;
                const txParams = {
                    ...this.txParams,
                    gasCoin: this.fee.coin,
                };

                return postTx(txParams, {privateKey: this.$store.getters.privateKey})
                    .then((tx) => {
                        this.isFormSending = false;
                        this.isSuccessModalOpen = true;
                        this.successTx = tx;
                        this.clearForm();
                    })
                    .catch((error) => {
                        console.log(error);
                        this.isFormSending = false;
                        this.serverError = getErrorText(error);
                    });
            },
            useMax() {
                this.form.amount = this.maxAmount;
                // this.amountMasked = this.maxAmount;
                this.$refs.amountInput.maskRef.typedValue = this.maxAmount;
                const cursorPos = this.maxAmount.toString().length;
                this.$refs.amountInput.maskRef._selection = {start: cursorPos, end: cursorPos};
                this.isUseMax = true;
            },
            clearForm() {
                this.form.address = '';
                this.form.amount = '';
                this.form.coinSymbol = this.$store.state.balance && this.$store.state.balance.length ? this.$store.state.balance[0].coin.symbol : '';
                this.form.message = '';
                this.recipient.name = '';
                this.recipient.type = '';
                this.recipient.address = '';
                // this.amountMasked = '';
                this.$refs.amountInput.maskRef.typedValue = '';
                this.$v.$reset();
            },
            getAvatar(recipient) {
                if (recipient.type === 'publicKey') {
                    return '/img/icon-tx-delegate.svg';
                } else {
                    return getAvatarUrl(recipient.address);
                }
            },
            getExplorerTxUrl,
        },
    };

    /**
     *
     * @param {Coin} selectedCoinItem
     * @param {string|number} feeCoinIdOrSymbol
     * @return {boolean}
     */
    function isSelectedCoinSameAsFeeCoin(selectedCoinItem, feeCoinIdOrSymbol) {
        const isFeeId = isCoinId(feeCoinIdOrSymbol);
        const isFeeSymbol = !isFeeId;
        if (isFeeSymbol && selectedCoinItem.symbol === feeCoinIdOrSymbol) {
            return true;
        }
        if (isFeeId && selectedCoinItem.id === feeCoinIdOrSymbol) {
            return true;
        }
        return false;
    }
</script>

<template>
    <Modal
        :isOpen="true"
        :hideCloseButton="false"
        :disableOutsideClick="true"
        @modal-close="$router.push($i18nGetPreferredPath({path: $options.DASHBOARD_URL}))"
    >

        <form novalidate @submit.prevent="openTxModal" v-if="$store.state.balance && $store.state.balance.length">
            <div class="u-section u-container u-text-left">
                <label class="bip-field bip-field--row bip-field--select" :class="{'is-error': $v.form.coinSymbol.$error}">
                    <span class="bip-field__label">Coin</span>
                    <select class="bip-field__input"
                            v-model="form.coinSymbol"
                            @blur="$v.form.coinSymbol.$touch()"
                    >
                        <option v-for="coin in $store.state.balance" :key="coin.coin.id" :value="coin.coin.symbol">{{ coin.coin.symbol }} ({{ coin.amount | pretty }})</option>
                    </select>
                    <span class="bip-field__error" v-if="$v.form.coinSymbol.$dirty && !$v.form.coinSymbol.required">Enter coin</span>
                </label>
                <label class="bip-field bip-field--row" :class="{'is-error': $v.form.address.$error}">
                    <span class="bip-field__label">To (<!--@username, email, -->Address or public key)</span>
                    <input class="bip-field__input " type="text"
                           v-model.trim="recipient.name"
                           @blur="$v.form.address.$touch(); recipientBlur()"
                           @input="sve.address.isActual = false"
                    >
                    <span class="bip-field__error" v-if="$v.form.address.$dirty && !$v.form.address.server">{{ sve.address.message }}</span>
                    <span class="bip-field__error" v-else-if="!isRecipientCheckWait && $v.form.address.$dirty && !$v.form.address.required">Enter recipient</span>
                </label>
                <label class="bip-field bip-field--row bip-field--with-max" :class="{'is-error': $v.form.amount.$error}">
                    <span class="bip-field__label">Amount</span>
                    <input class="bip-field__input" type="text" inputmode="decimal" ref="amountInput"

                           v-imask="amountImaskOptions"
                           @accept="onAcceptAmount"
                           @blur="$v.form.amount.$touch()"
                    >
                    <button class="bip-field__button bip-link u-semantic-button" type="button" @click="useMax">Use max</button>
                    <span class="bip-field__error" v-if="$v.form.amount.$dirty && !$v.form.amount.required">Enter amount</span>
                    <span class="bip-field__error" v-else-if="$v.form.amount.$dirty && !$v.form.amount.maxAmount">Not enough coins</span>
                </label>
                <label class="bip-field bip-field--row" :class="{'is-error': $v.form.message.$error}">
                    <span class="bip-field__label">Message</span>
                    <input class="bip-field__input " type="text"
                           v-model.trim="form.message"
                           @blur="$v.form.message.$touch()"
                    >
                    <span class="form-field__error" v-if="$v.form.message.$dirty && !$v.form.message.maxLength">Max 1024 symbols</span>
                </label>
            </div>

            <div class="u-section u-container">
                <button class="bip-button bip-button--main" :class="{'is-loading': isFormSending, 'is-disabled': $v.$invalid}">
                    <span class="bip-button__content" v-if="txParams.type === $options.TX_TYPE.SEND">Send</span>
                    <span class="bip-button__content" v-if="txParams.type === $options.TX_TYPE.DELEGATE">Delegate</span>
                    <span class="bip-button__content" v-if="txParams.type === $options.TX_TYPE.UNBOND">Unbond</span>
                    <svg class="loader loader--button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
                        <circle class="loader__path" cx="25" cy="25" r="16"></circle>
                    </svg>
                </button>
                <span class="bip-form__error" v-if="serverError">{{ serverError }}</span>
            </div>
        </form>

        <div class="u-section u-container" v-else>
            No coins to send
            <!--<span v-if="isBalanceLoading">Loading…</span>
            <span v-else>No coins to send</span>-->
        </div>

        <!-- confirm send modal -->
        <Modal :isOpen.sync="isModalOpen" :hideCloseButton="true">
            <div class="modal__panel">
                <h3 class="modal__title u-h2">
                    You're
                    <template v-if="txParams.type === $options.TX_TYPE.SEND">sending</template>
                    <template v-if="txParams.type === $options.TX_TYPE.DELEGATE">delegating</template>
                    <template v-if="txParams.type === $options.TX_TYPE.UNBOND">unbonding</template>
                </h3>
                <div class="modal__content">
                    <p class="send__modal-value">
                        <span class="send__modal-amount">{{ form.amount | prettyExact }}</span>
                        {{ form.coinSymbol }}
                    </p>
                    <p v-if="txParams.type === $options.TX_TYPE.UNBOND">from</p>
                    <p v-else>to</p>
                    <p>
                        <img class="send__modal-image avatar avatar--large" :src="getAvatar(recipient)" alt="" role="presentation">
                    </p>
                    <p class="u-text-wrap"><strong>{{ recipient.name }}</strong></p>
                </div>
                <div class="modal__footer">
                    <button class="bip-button bip-button--main" @click="sendTx">Send</button>
                    <button class="bip-button bip-button--ghost-main" @click="isModalOpen = false">Cancel</button>
                </div>
            </div>
        </Modal>

        <!-- wait modal -->
        <Modal :isOpen.sync="isFormSending" :hideCloseButton="true">
            <div class="modal__panel">
                <h3 class="modal__title u-h2">Please wait</h3>
                <div class="modal__content">
                    <svg class="loader loader--inline" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
                        <circle class="loader__path" cx="25" cy="25" r="16"></circle>
                    </svg>
                    <span class="u-text-middle">Sending transaction...</span>
                </div>
            </div>
        </Modal>

        <!-- success modal -->
        <Modal :isOpen.sync="isSuccessModalOpen" :hideCloseButton="true">
            <div class="modal__panel">
                <h3 class="modal__title u-h2">Success</h3>
                <div class="modal__content">
                    <p>Transaction is received by</p>
                    <p>
                        <img class="send__modal-image avatar avatar--large" :src="getAvatar(lastRecipient)" alt="" role="presentation">
                    </p>
                    <p class="u-text-wrap"><strong>{{ lastRecipient.name }}</strong></p>
                    <TxFormBlocksToUpdateStake :success-tx="successTx" v-if="lastRecipient.type === 'publicKey'"/>
                </div>
                <div class="modal__footer">
                    <a class="bip-button bip-button--ghost-main" :href="getExplorerTxUrl(successTx.hash)" target="_blank" v-if="successTx">View transaction</a>
                    <button class="bip-button bip-button--ghost-main" @click="isSuccessModalOpen = false">Close</button>
                </div>
            </div>
        </Modal>
    </Modal>
</template>
