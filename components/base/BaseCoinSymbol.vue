<script>
import {defineComponent} from 'vue';
import customTokens from '~/data/tokens.js';

export default defineComponent({
    functional: true,
    /*
    customTokens,
    */
    props: {
        network: {
            type: String,
        },
    },
    render(createElement, context) {
        const coinSymbol = context.children?.[0].text?.trim();
        const customToken = customTokens[coinSymbol];
        const content = customToken?.name
            ? renderCoinWithNetwork(createElement, customToken.name, customToken.network)
            : context.props.network
                ? renderCoinWithNetwork(createElement, coinSymbol, context.props.network)
                : context.children;
        return createElement('span', context.data, content);
    },
});

/**
 *
 * @param {CreateElement} createElement
 * @param {string} coinSymbol
 * @param {string} network
 * @return {(string|*)[]}
 */
function renderCoinWithNetwork(createElement, coinSymbol, network) {
    return [coinSymbol + ' ', createElement('span', {class: 'u-text-muted'}, network)];
}
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
