<script>
import customTokens from '~/data/tokens.js';

export default {
    functional: true,
    /*
    customTokens,
    props: {
        coin: {
            type: String,
        },
    },
    */
    render(createElement, context) {
        const coinSymbol = context.children?.[0].text?.trim();
        const customToken = customTokens[coinSymbol];
        const content = customToken?.name
            ? [customToken.name + ' ', createElement('span', {class: 'u-text-muted'}, customToken.network)]
            : context.children;
        return createElement('span', context.data, content);
    },
};
</script>

<dummy-template functional>
    <span>
        <template v-if="$options.customTokens[props.coin]">
            {{ $options.customTokens[props.coin].name }} {{ $options.customTokens[props.coin].network }}
        </template>
        <template v-else>
            {{ props.coin }}
        </template>
    </span>
</dummy-template>
