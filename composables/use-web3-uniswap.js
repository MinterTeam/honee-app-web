import { ChainId, Token, WETH as WETH_TOKEN_DATA, Fetcher, Route, Trade, TokenAmount, TradeType } from '@uniswap/sdk';
import IUniswapV2Router from '@uniswap/v2-periphery/build/IUniswapV2Router02.json';
import {CloudflareProvider, JsonRpcProvider} from '@ethersproject/providers';
import Big from 'minterjs-util/src/big.js';
import {ETHEREUM_API_URL, ETHEREUM_CHAIN_ID, MAINNET, NETWORK} from '~/assets/variables.js';
import {toErcDecimals} from 'minter-js-web3-sdk/src/web3-abi.js';
import {web3Abi} from 'minter-js-web3-sdk/src/web3.js';

const wethToken = WETH_TOKEN_DATA[ETHEREUM_CHAIN_ID];
const uniswapV2Abi = IUniswapV2Router.abi;


//@TODO rework to composable
export default {
    fetch() {
        this.fetchUniswapPair();
    },
    data() {
        return {
            uniswapPair: null,
        };
    },
    computed: {
        ethToSwap() {
            let amount = new Big(this.form.amountEth || 0).minus(this.ethTotalFee);
            amount = amount.gt(0) ? amount.toString() : 0;
            return amount;
        },
        uniswapEstimation() {
            const pair = this.uniswapPair;
            const decimals = this.coinDecimals;
            const amountEth = toErcDecimals(this.ethToSwap, 18);
            if (!pair || !(amountEth > 0)) {
                return {
                    price: 0,
                    output: 0,
                };
            }
            try {
                const route = new Route([pair], wethToken);
                const trade = new Trade(route, new TokenAmount(wethToken, amountEth), TradeType.EXACT_INPUT);
                return {
                    price: trade.executionPrice.toFixed(decimals),
                    output: trade.outputAmount.toFixed(decimals),
                };
            } catch (error) {
                console.log(error);
                return {
                    price: 0,
                    output: 0,
                };
            }
        },
        // fee to HUB bridge calculated in COIN
        hubFee() {
            const input = this.uniswapEstimation?.output;
            return new Big(input || 0).times(this.hubFeeRate).toString();
        },
        coinAmountAfterBridge() {
            const input = this.uniswapEstimation?.output;
            return new Big(input || 0).minus(this.hubFee).toString();
        },
        isCoinApproved() {
            const selectedUnlocked = new Big(this.coinToDepositUnlocked);
            // compare with large number instead of uniswapEstimation to eliminate circular dependency (uniswapEstimation > isCoinApproved > ethTotalFee > ethToSwap > uniswapEstimation)
            // eslint-disable-next-line no-unreachable
            return selectedUnlocked.gt(1e15);
            // сравниваем эстимейт с запасом
            // return selectedUnlocked.gt(0) && selectedUnlocked.gt(this.uniswapEstimation?.output * 2);
        },
    },
    mounted() {
        setInterval(() => {
            this.fetchUniswapPair();
        }, 60 * 1000);
    },
    methods: {
        fetchUniswapPair() {
            if (!this.coinContractAddress || ! this.coinDecimals) {
                return;
            }
            return _fetchUniswapPair(this.coinContractAddress, this.coinDecimals)
                .then((pair) => {
                    this.uniswapPair = pair;
                });
        },
        sendUniswapTx({nonce, gasPrice} = {}) {
            const routerAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
            const poolAddress = this.uniswapPair.liquidityToken.address;
            const poolContract = new web3.eth.Contract(uniswapV2Abi, poolAddress);
            const amountOutMin = toErcDecimals(new Big(this.uniswapEstimation.output).times(0.97).toString(), this.coinDecimals);
            // console.log('amountOutMin', new Big(this.uniswapEstimation.output).times(0.97).toString(), amountOutMin)
            const deadline = Math.floor(Date.now() / 1000) + 60 * 30; // 30min
            const data = poolContract.methods.swapExactETHForTokens(amountOutMin, [wethToken.address, this.coinContractAddress], this.ethAddress, deadline).encodeABI();

            return this.sendEthTx({to: routerAddress, data, value: this.ethToSwap, nonce, gasPrice, gasLimit: GAS_LIMIT_SWAP}, LOADING_STAGE.SWAP_ETH);
        },
    },
};

function _fetchUniswapPair(coinContractAddress, coinDecimals) {
    // const token = new Token(ETHEREUM_CHAIN_ID, '0xdbc941fec34e8965ebc4a25452ae7519d6bdfc4e', 6)
    const token = new Token(ETHEREUM_CHAIN_ID, coinContractAddress, coinDecimals);
    const provider = NETWORK === MAINNET ? new CloudflareProvider('homestead') : new JsonRpcProvider(ETHEREUM_API_URL, 'ropsten');

    return Fetcher.fetchPairData(token, wethToken, provider)
        .then((pair) => {
            return Object.freeze(pair);
        });
}

function getSwapOutput(receipt) {
    const logIndex = 5 - 1;
    const dataIndex = 3 - 1;
    const amount0StartIndex = 2 + 64 * dataIndex;
    const amount1StartIndex = 2 + 64 * (dataIndex + 1);
    // @TODO logs pruned from tx for now to save storage space
    const amount0OutHex = receipt.logs[logIndex].data.slice(amount0StartIndex, amount0StartIndex + 64);
    const amount1OutHex = receipt.logs[logIndex].data.slice(amount1StartIndex, amount1StartIndex + 64);
    const amount0Out = web3Abi.decodeParameter('uint256', '0x' + amount0OutHex);
    const amount1Out = web3Abi.decodeParameter('uint256', '0x' + amount1OutHex);

    // received coin maybe 0 or 1, depending on position in uniswap pair
    return Math.max(amount0Out, amount1Out);
}
