<script>
    import VueSimpleSuggest from 'vue-simple-suggest/lib/vue-simple-suggest';
    import InputUppercase from '~/components/InputUppercase';

    const MAX_ITEM_COUNT = 5;

    export default {
        inheritAttrs: false,
        MAX_ITEM_COUNT,
        components: {
            VueSimpleSuggest,
            InputUppercase,
        },
        props: {
            value: {
                type: String,
                default: '',
            },
            $value: {
                type: Object,
                required: true,
            },
            // label: {
            //     type: String,
            //     required: true,
            // },
            /** @type Array */
            coinList: {
                type: Array,
                default: () => [],
            },
        },
        data() {
            return {
                /** @type Array<string> */
                coinListAll: [],
            };
        },
        computed: {
            // all parent listeners except `input`
            listeners() {
                const { input, ...listeners } = this.$listeners;
                return listeners;
            },
            currentCoinList() {
                return this.coinList && this.coinList.length ? this.coinList : this.coinListAll;
            },
        },
        mounted() {
            this.$store.dispatch('FETCH_COIN_LIST')
                .then((coinListAll) => {
                    this.coinListAll = Object.freeze(coinListAll.map((item) => item.symbol));
                })
                .catch((e) => {
                    console.log(e);
                });
        },
        methods: {
            filter(item, query) {
                if (!query) {
                    return true;
                }
                // keep only values started with query (e.g. remove "WALLET" for "LET" search)
                return item.indexOf(query) === 0;
            },
            handleSuggestionClick(item, e) {
                // prevent reopen suggestion list by parent label click
                e.preventDefault();
            },
        },
    };


</script>

<template>
    <label class="bip-field bip-field--row" :class="{'is-error': $value.$error}">
        <span class="bip-field__label">Coin you want</span>
        <VueSimpleSuggest
                :value="value"
                :list="currentCoinList"
                :max-suggestions="$options.MAX_ITEM_COUNT"
                :min-length="0"
                :filter-by-query="true"
                :filter="filter"
                :destyled="true"
                :controls="{showList: [38, 40]}"
                @input="$emit('input', $event)"
                @blur="$value.$touch(); $emit('blur')"
                @suggestion-click="handleSuggestionClick"
                ref="suggest"
        >
            <InputUppercase
                    class="bip-field__input" type="text"
                    v-bind="$attrs"
                    :value="value"
            />
        </VueSimpleSuggest>
        <span class="bip-field__error" v-if="$value.$dirty && !$value.required">Enter coin</span>
        <span class="bip-field__error" v-if="$value.$dirty && !$value.minLength">Min 3 letters</span>
        <!--<span class="bip-field__error" v-if="$value.$dirty && !$value.maxLength">Max 10 letters</span>-->
    </label>
</template>
