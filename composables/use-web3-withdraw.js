import {ref, reactive, computed, watch} from 'vue';
import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
import {convertToPip} from 'minterjs-util/src/converter.js';
import Big, {BIG_ROUND_UP} from '~/assets/big.js';
import {HUB_CHAIN_DATA, HUB_MINTER_MULTISIG_ADDRESS, HUB_WITHDRAW_SPEED} from '~/assets/variables.js';
import useHubDiscount from '~/composables/use-hub-discount.js';
import useHubOracle from '~/composables/use-hub-oracle.js';
import useHubToken from '~/composables/use-hub-token.js';


export default function useWeb3Withdraw(destinationAddress) {
    const { discount, discountUpsidePercent, setDiscountProps } = useHubDiscount();
    const { hubDestinationFee, setHubOracleProps } = useHubOracle({subscribeDestinationFee: true});
    const { hubCoin, tokenPrice, tokenDecimals, setHubTokenProps } = useHubToken();

    const props = reactive({
        /** @type {HUB_NETWORK|''} */
        hubNetworkSlug: '',
        amountToSend: 0,
        // amountToReceive: 0,
        tokenSymbol: '',
        accountAddress: '',
        destinationAddress: destinationAddress || '',
        speed: HUB_WITHDRAW_SPEED.FAST,
        // hash of some data of smart wallet tx (hashed by relay service)
        smartWalletTx: '',
    });

    /**
     * @param {Partial<props>} newProps
     */
    function setProps(newProps) {
        Object.assign(props, newProps);
        setHubTokenProps({
            tokenSymbol: newProps.tokenSymbol,
            chainId: HUB_CHAIN_DATA[newProps.hubNetworkSlug]?.chainId,
        });
        setHubOracleProps({
            hubNetworkSlug: newProps.hubNetworkSlug,
        });
        setDiscountProps({
            minterAddress: props.accountAddress,
            ethAddress: props.destinationAddress,
        });
    }

    // fee for destination network calculated in COIN to withdraw
    const destinationFeeInCoin = computed(() => {
        if (tokenPrice.value === '0') {
            return 0;
        }
        const selectedDestinationFee = hubDestinationFee.value[props.speed] || 0;

        return new Big(selectedDestinationFee).div(tokenPrice.value).toString(tokenDecimals.value, BIG_ROUND_UP);
    });
    // base hub rate without discount
    const hubFeeBaseRate = computed(() => {
        return hubCoin.value?.commission || 0.01;
    });
    // e.g 0.01 without discount, or 0.004 for 60% discount
    const hubFeeRate = computed(() => {
        const discountModifier = 1 - discount.value;
        // commission to withdraw is taken from origin token data (e.g. chainId: 'minter' for withdraw)
        return new Big(hubFeeBaseRate.value).times(discountModifier).toString();
    });
    const hubFeeRatePercent = computed(() => {
        return new Big(hubFeeRate.value).times(100).toString();
    });
    // fee to Hub bridge calculated in COIN to withdraw
    const hubFee = computed(() => {
        return getHubFeeFromSendAmount(hubFeeRate.value, props.amountToSend, tokenDecimals.value);
        // return getHubFeeFromReceiveAmount(hubFeeRate.value, props.amountToReceive, destinationFeeInCoin.value, tokenDecimals.value);
    });
    // (destinationNetworkFee + amountToReceive) * (hubFeeRate / (1 - hubFeeRate))
    function getHubFeeFromReceiveAmount(hubFeeRate, amountToReceive, destinationFeeInCoin, decimals) {
        const amount = new Big(destinationFeeInCoin).plus(amountToReceive || 0);
        // x / (1 - x)
        const inverseRate = new Big(hubFeeRate).div(new Big(1).minus(hubFeeRate));
        return amount.times(inverseRate).toString(decimals, BIG_ROUND_UP);
    }
    function getHubFeeFromSendAmount(hubFeeRate, amountToSend, decimals) {
        return new Big(amountToSend || 0).times(hubFeeRate).toString(decimals, BIG_ROUND_UP);
    }
    // amount to receive from Hub bridge
    const amountToReceive = computed(() => calculateAmountToReceive(props.amountToSend));
    /**
     * @param {string|number} amountToSend
     * @param {boolean} [recalculateFee]
     * @returns {string|number}
     */
    function calculateAmountToReceive(amountToSend, recalculateFee) {
        const hubFeeValue = recalculateFee
            ? getHubFeeFromSendAmount(hubFeeRate.value, amountToSend, tokenDecimals.value)
            : hubFee.value;
        const amount = new Big(amountToSend || 0).minus(destinationFeeInCoin.value).minus(hubFeeValue).toString();
        if (amount < 0) {
            return 0;
        }
        return amount;
    }
    /**
     * @param {string|number} amountToSend
     * @returns {string|number}
     */
    function recalculateAmountToReceive(amountToSend) {
        return calculateAmountToReceive(amountToSend, true);
    }
    // amount to send to Hub bridge
    /*
    const amountToSend = computed(() => {
        return new Big(props.amountToReceive || 0).plus(destinationFeeInCoin.value).plus(hubFee.value).toString();
    });
    */
    // Minter Hub not consider discount in amount validation, so we need compensate amount for discount difference
    const minAmountToSend = computed(() => {
        // Minter Hub not consider discount in amount validation, so use hubFeeBaseRate without discount
        const minTotalFee = new Big(destinationFeeInCoin.value).times(new Big(1).plus(hubFeeBaseRate.value)).toString();
        // add 1 pip because 0 will not pass validation too
        const onePip = 10 ** (-1 * (tokenDecimals.value || 18));
        return new Big(minTotalFee).plus(onePip).toString(tokenDecimals.value, BIG_ROUND_UP);
    });
    // min amount user can specify to receive (if works in mode, where user selects, what he want to receive)
    const minAmountToReceive = computed(() => {
        return getHubMinAmountToReceive(destinationFeeInCoin.value, hubFeeRate.value, hubFeeBaseRate.value, tokenDecimals.value);
    });

    /**
     * // Minter Hub not consider discount in amount validation, so we need compensate amount for discount difference
     * @param {number|string} destinationNetworkFee
     * @param {number|string} hubFeeRate
     * @param {number|string} hubFeeBaseRate - hub fee rate without discount (0.01)
     * @param {number} decimals
     * @return {number|string}
     */
    function getHubMinAmountToReceive(destinationNetworkFee, hubFeeRate, hubFeeBaseRate = 0.01, decimals= 18) {
        // minAmount = hubFeeBase - hubFee
        // But while amountToReceive increase hubFee increase too, so we need to find such amountToReceive which will be equal minAmount, it will be maximum minAmount

        // Some 7 grade math below
        // hubFeeBase = (destinationNetworkFee + amountToReceive) * (0.01 / (1 - 0.01));
        // hubFee = (destinationNetworkFee + amountToReceive) * (hubFeeRate / (1 - hubFeeRate))
        // define (a = hubFeeBaseRate; b = hubFeeRate)
        // minAmount = (destinationNetworkFee + amountToReceive) * (a / (1 - a)) - (destinationNetworkFee + amountToReceive) * (b / (1 - b))
        // minAmount = (destinationNetworkFee + amountToReceive) * ((a / (1 - a) - (b / (1 - b));
        // minAmount = (destinationNetworkFee + amountToReceive) * x;

        // Let's calculate factor x
        // x = a / (1 - a) - b / (1 - b)
        // x = a * (1-b) / ((1-a)*(1-b)) - b * (1-a) / ((1-a)*(1-b))
        // x = (a * (1-b) - b * (1-a)) / ((1-a)*(1-b))
        // x = (a - ab - b + ab) / ((1-a)*(1-b))
        // x = (a - b) / ((1-a)*(1-b))
        // const factor = (hubFeeBaseRate - hubFeeRate) / ((1 - hubFeeBaseRate) * (1 - hubFeeRate));
        const factor = new Big(hubFeeBaseRate).minus(hubFeeRate).div(new Big(1).minus(hubFeeBaseRate).times(new Big(1).minus(hubFeeRate))).toString();

        // We are finding amountToReceive equal to minAmount (ar = amountToReceive, dnf = destinationNetworkFee)
        // ar = minAmount
        // ar = (ar + dnf) * x
        // ar = ar * x + dnf * x
        // ar - ar * x = dnf * x
        // ar * 1 - ar * x = dnf * x
        // ar * (1 -x) = dnf * x
        // ar = dnf * x / (1 - x)
        // const minAmount = destinationNetworkFee * factor / (1 - factor);
        const minAmount = new Big(destinationNetworkFee).times(factor).div(new Big(1).minus(factor)).toString();
        // add 1 pip because 0 will not pass validation too
        const onePip = 10 ** (-1 * decimals);
        return new Big(minAmount).plus(onePip).toString(decimals, BIG_ROUND_UP);
    }

    const txParams = computed(() => {
        return {
            type: TX_TYPE.SEND,
            data: {
                to: HUB_MINTER_MULTISIG_ADDRESS,
                value: props.amountToSend,
                coin: hubCoin.value?.minterId,
            },
            payload: JSON.stringify({
                recipient: props.destinationAddress,
                type: 'send_to_' + props.hubNetworkSlug,
                // fee for destination network
                fee: convertToPip(destinationFeeInCoin.value),
                ...(props.smartWalletTx ? {smartWalletTx: props.smartWalletTx} : {}),
            }),
        };
    });
    const feeTxParams = computed(() => {
        const txParamsClone = JSON.parse(JSON.stringify(txParams.value));
        txParamsClone.data.value = 0;
        return txParamsClone;
    });

    return {
        // reexport
        discountUpsidePercent,
        // computed
        destinationFeeInCoin,
        hubFeeRate,
        hubFeeRatePercent,
        hubFee,
        amountToReceive,
        minAmountToSend,
        // minAmountToReceive,
        txParams,
        feeTxParams,
        // methods
        setWithdrawProps: setProps,
        recalculateAmountToReceive,
    };
}
