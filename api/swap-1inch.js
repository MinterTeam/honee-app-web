import axios from 'axios';
import {Cache, cacheAdapterEnhancer} from 'axios-extensions';
import {ONE_INCH_API_URL, NETWORK, MAINNET} from "~/assets/variables.js";
import preventConcurrencyAdapter from '~/assets/axios-prevent-concurrency.js';
import {fromErcDecimals} from '~/api/web3.js';

const adapter = (($ = axios.defaults.adapter) => {
    $ = cacheAdapterEnhancer($, { enabledByDefault: false});
    $ = preventConcurrencyAdapter($);
    return $;
})();

const instance = axios.create({
    baseURL: ONE_INCH_API_URL,
    adapter,
});

const fastCache = new Cache({ttl: 2 * 1000, max: 100});

/**
 * @param {number|string} chainId
 * @param {OneInchExchangeControllerGetSwapParams} swapParams
 * @param {object} [axiosOptions]
 * @param {string} [axiosOptions.idPreventConcurrency]
 * @return {Promise<OneInchSwapResponseDto>}
 */
export async function buildTxForSwap(chainId, swapParams, {idPreventConcurrency} = {}) {
    const protocols = await prepareProtocolsCached(chainId);
    swapParams = {
        ...swapParams,
        protocols,
    };
    return instance.get(`${chainId}/swap`, {
        params: swapParams,
        cache: fastCache,
        idPreventConcurrency,
    })
        .then((response) => {
            return response.data;
        });
}

/**
 * @param {number|string} chainId
 * @param {OneInchExchangeControllerGetQuoteParams} swapParams
 * @param {object} [axiosOptions]
 * @param {string} [axiosOptions.idPreventConcurrency]
 * @return {Promise<{estimatedGas: number, estimatedAmount: string}>}
 */
export async function getQuoteForSwap(chainId, swapParams, {idPreventConcurrency} = {}) {
    const protocols = await prepareProtocolsCached(chainId);
    swapParams = {
        ...swapParams,
        protocols,
    };
    return instance.get(`${chainId}/quote`, {
            params: swapParams,
            cache: fastCache,
            idPreventConcurrency,
        })
        .then((response) => {
            /** @type {OneInchQuoteResponseDto} */
            const responseData = response.data;
            const estimatedAmount = fromErcDecimals(responseData.toTokenAmount, responseData.toToken.decimals);
            return {
                estimatedAmount,
                estimatedGas: responseData.estimatedGas,
            };
        });
}

const protocolsCache = new Cache({ttl: 60 * 60 * 1000, max: 100});

// excluded RFQ liquidity (it is considered not stable and can be expired during long smart-wallet withdrawals)
const DEFAULT_PROTOCOLS = {
    1: 'UNISWAP_V1,UNISWAP_V2,SUSHI,MOONISWAP,BALANCER,COMPOUND,CURVE,CURVE_V2_SPELL_2_ASSET,CURVE_V2_SGT_2_ASSET,CURVE_V2_THRESHOLDNETWORK_2_ASSET,CHAI,OASIS,KYBER,AAVE,IEARN,BANCOR,SWERVE,BLACKHOLESWAP,DODO,DODO_V2,VALUELIQUID,SHELL,DEFISWAP,SAKESWAP,LUASWAP,MINISWAP,MSTABLE,SYNTHETIX,AAVE_V2,ST_ETH,ONE_INCH_LP,ONE_INCH_LP_1_1,LINKSWAP,S_FINANCE,POWERINDEX,XSIGMA,SMOOTHY_FINANCE,SADDLE,KYBER_DMM,BALANCER_V2,UNISWAP_V3,SETH_WRAPPER,CURVE_V2,CURVE_V2_EURS_2_ASSET,CURVE_V2_ETH_CRV,CURVE_V2_ETH_CVX,CONVERGENCE_X,DFX_FINANCE,FIXED_FEE_SWAP,DXSWAP,SHIBASWAP,UNIFI,WSTETH,DEFI_PLAZA,FIXED_FEE_SWAP_V3,SYNTHETIX_WRAPPER,SYNAPSE,CURVE_V2_YFI_2_ASSET,CURVE_V2_ETH_PAL,POOLTOGETHER,ETH_BANCOR_V3,ELASTICSWAP,BALANCER_V2_WRAPPER,FRAXSWAP,RADIOSHACK,KYBERSWAP_ELASTIC,CURVE_V2_TWO_CRYPTO,STABLE_PLAZA,CURVE_3CRV,KYBER_DMM_STATIC,ANGLE,ROCKET_POOL,ETHEREUM_ELK,ETHEREUM_PANCAKESWAP_V2,SYNTHETIX_ATOMIC_SIP288,INTEGRAL,MAINNET_SOLIDLY,NOMISWAP_STABLE,CURVE_V2_TWOCRYPTO_MET',
    56: 'PANCAKESWAP,VENUS,JULSWAP,BAKERYSWAP,BSC_ONE_INCH_LP,ACRYPTOS,BSC_DODO,APESWAP,SPARTAN_V2,VSWAP,VPEGSWAP,HYPERSWAP,BSC_DODO_V2,SWAPSWIPE,ELLIPSIS_FINANCE,BSC_NERVE,BSC_SMOOTHY_FINANCE,CHEESESWAP,PANCAKESWAP_V2,MDEX,WARDEN,WAULTSWAP,ACSI_FINANCE,GAMBIT_FINANCE,JETSWAP,BSC_UNIFI,BSC_KYBER_DMM,BSC_BI_SWAP,BSC_DOPPLE,BABYSWAP,WOOFI,BSC_ELK,BSC_SYNAPSE,BSC_AUTOSHARK,BSC_CAFE_SWAP,PLANET_FINANCE,BSC_ANNEX_FINANCE,BSC_ANNEX_SWAP,BSC_RADIOSHACK,BSC_KYBERSWAP_ELASTIC,BSC_FSTSWAP,BSC_NOMISWAP,BSC_CONE,BSC_KYBER_DMM_STATIC,WOMBATSWAP,BSC_NOMISWAP_STABLE,BSC_PANCAKESWAP_STABLE,BSC_BABYDOGE,BSC_THENA,BSC_WOOFI_V2',
};
const fetchedProtocols = {};

/**
 * Prepare `protocols` query param value for `quote` and `swap` requests
 * @param {number|string} chainId
 * @returns {Promise<string>}
 */
export function prepareProtocols(chainId) {
    return instance.get(`${chainId}/liquidity-sources`, {
            cache: protocolsCache,
        })
        .then((response) => {
            const list = response.data.protocols;
            return list
                .map((item) => item.id)
                .filter((idString) => {
                    // Private MM RFQs
                    return !idString.includes('PMM')
                        // Peg Stability Module
                        && !idString.includes('PSM')
                        // orders
                        && !idString.includes('LIMIT_ORDER');
                })
                .join(',');
        });
}

/**
 * @param {number|string} chainId
 * @returns {Promise<string|undefined>}
 */
export function prepareProtocolsCached(chainId) {
    if (fetchedProtocols[chainId]) {
        return Promise.resolve(fetchedProtocols[chainId]);
    } else {
        return prepareProtocols(chainId)
            .then((protocols) => {
                fetchedProtocols[chainId] = protocols;
                return protocols;
            })
            .catch((error) => {
                console.error(error);
                return undefined;
            });
    }
}
