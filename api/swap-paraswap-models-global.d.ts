/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

enum ParaSwapSwapSide {
  SELL = "SELL",
  BUY = "BUY",
}

/**
 * Supported DEXs. The list may change
 * @example "SushiSwap"
 */
enum ParaSwapDEXs {
  Uniswap = "Uniswap",
  Kyber = "Kyber",
  Bancor = "Bancor",
  Oasis = "Oasis",
  Compound = "Compound",
  Fulcrum = "Fulcrum",
  Value0X = "0x",
  MakerDAO = "MakerDAO",
  Chai = "Chai",
  ParaSwapPool = "ParaSwapPool",
  Aave = "Aave",
  Aave2 = "Aave2",
  MultiPath = "MultiPath",
  MegaPath = "MegaPath",
  Curve = "Curve",
  Curve3 = "Curve3",
  Saddle = "Saddle",
  IronV2 = "IronV2",
  BDai = "BDai",
  Idle = "idle",
  Weth = "Weth",
  Beth = "Beth",
  UniswapV2 = "UniswapV2",
  Balancer = "Balancer",
  Value0XRFQt = "0xRFQt",
  ParaSwapPool2 = "ParaSwapPool2",
  ParaSwapPool3 = "ParaSwapPool3",
  ParaSwapPool4 = "ParaSwapPool4",
  ParaSwapPool5 = "ParaSwapPool5",
  ParaSwapPool6 = "ParaSwapPool6",
  SushiSwap = "SushiSwap",
  LINKSWAP = "LINKSWAP",
  Synthetix = "Synthetix",
  DefiSwap = "DefiSwap",
  Swerve = "Swerve",
  CoFiX = "CoFiX",
  Shell = "Shell",
  DODOV1 = "DODOV1",
  DODOV2 = "DODOV2",
  OnChainPricing = "OnChainPricing",
  PancakeSwap = "PancakeSwap",
  PancakeSwapV2 = "PancakeSwapV2",
  ApeSwap = "ApeSwap",
  Wbnb = "Wbnb",
  Acryptos = "acryptos",
  Streetswap = "streetswap",
  Bakeryswap = "bakeryswap",
  Julswap = "julswap",
  Vswap = "vswap",
  Vpegswap = "vpegswap",
  Beltfi = "beltfi",
  Ellipsis = "ellipsis",
  QuickSwap = "QuickSwap",
  COMETH = "COMETH",
  Wmatic = "Wmatic",
  Nerve = "Nerve",
  Dfyn = "Dfyn",
  UniswapV3 = "UniswapV3",
  Smoothy = "Smoothy",
  PantherSwap = "PantherSwap",
  OMM1 = "OMM1",
  OneInchLP = "OneInchLP",
  CurveV2 = "CurveV2",
  MStable = "mStable",
  WaultFinance = "WaultFinance",
  MDEX = "MDEX",
  ShibaSwap = "ShibaSwap",
  CoinSwap = "CoinSwap",
  SakeSwap = "SakeSwap",
  JetSwap = "JetSwap",
  Biswap = "Biswap",
  BProtocol = "BProtocol",
}

enum ParaSwapContractMethod {
  SwapOnUniswap = "swapOnUniswap",
  BuyOnUniswap = "buyOnUniswap",
  SwapOnUniswapFork = "swapOnUniswapFork",
  BuyOnUniswapFork = "buyOnUniswapFork",
  SwapOnUniswapV2Fork = "swapOnUniswapV2Fork",
  BuyOnUniswapV2Fork = "buyOnUniswapV2Fork",
  SimpleBuy = "simpleBuy",
  SimpleSwap = "simpleSwap",
  MultiSwap = "multiSwap",
  MegaSwap = "megaSwap",
  ProtectedMultiSwap = "protectedMultiSwap",
  ProtectedMegaSwap = "protectedMegaSwap",
  ProtectedSimpleSwap = "protectedSimpleSwap",
  ProtectedSimpleBuy = "protectedSimpleBuy",
  SwapOnZeroXv2 = "swapOnZeroXv2",
  SwapOnZeroXv4 = "swapOnZeroXv4",
  Buy = "buy",
}

enum ParaSwapNetwork {
  Value1 = 1,
  Value3 = 3,
  Value56 = 56,
  Value137 = 137,
}

interface ParaSwapToken {
  symbol: string;
  address: string;
  name?: string;
  decimals: ParaSwapTokenDecimals;
  img: string;
  network: ParaSwapNetwork;
  /** @default false */
  newToken: boolean;
  connectors: string[];
  tokenType: "ETH" | "ERC20" | "SYNTH" | "cToken" | "iToken" | "aToken" | "aToken2" | "idleToken" | "Chai" | "bDAI";
}

/** @min 0 */
type ParaSwapTokenDecimals = number;

interface ParaSwapTokensList {
  tokens?: ParaSwapToken[];
}

/** Response Body returned from `/prices` endpoint. */
interface ParaSwapPriceRoute {
  /**
   * @min 0
   * @example 13015909
   */
  blockNumber: number;
  network: ParaSwapNetwork;
  /**
   * Source Token Address
   * @example "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
   */
  srcToken: string;
  srcDecimals: ParaSwapTokenDecimals;
  /** @example "1000000000000000000" */
  srcAmount: string;
  /**
   * Destination Token Address
   * @example "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
   */
  destToken: string;
  destDecimals: ParaSwapTokenDecimals;
  /** @example "1000000000000000000" */
  destAmount: string;
  bestRoute: ParaSwapOptimalRoute;
  /** Available if `/prices` endpoint was called with `otherExchangePrices=true` in query */
  others?: ParaSwapOptionalRate;
  /** @example "11.947163" */
  gasCostUSD: string;
  /** @example "111435" */
  gasCost: string;
  side: ParaSwapSwapSide;
  /** @example "0x3e7d31751347BAacf35945074a4a4A41581B2271" */
  tokenTransferProxy: string;
  /** @example "0x485D2446711E141D2C8a94bC24BeaA5d5A110D74" */
  contractAddress: string;
  /** @example "swapOnUniswap" */
  contractMethod: string;
  /** @example "3230.3000000000" */
  srcUSD: string;
  /** @example "3218.9300566052" */
  destUSD: string;
  /** @example "paraswap.io" */
  partner: string;
  /**
   * @min 0
   * @example 0
   */
  partnerFee: number;
  /** @example false */
  maxImpactReached: boolean;
  /** @example "319c5cf83098a07aeebb11bed6310db51311201f" */
  hmac: string;
}

enum ParaSwapPriceErrorMessage {
  InvalidTokens = "Invalid tokens",
  InvalidRouteFromTokenShouldBeTheFirstTokenOfTheRoute = "Invalid route, from token should be the first token of the route",
  InvalidRouteToTokenShouldBeTheLastTokenOfTheRoute = "Invalid route, to token should be the last token of the route",
  TokenNotFound = "Token not found",
  PriceTimeout = "Price Timeout",
  ComputePriceError = "computePrice Error",
  BadUSDPrice = "Bad USD price",
  ERROR_GETTING_PRICES = "ERROR_GETTING_PRICES",
  AnErrorHasOccurredPleaseTryAgainLaterOrContactOurSupport = "An error has occurred, please try again later or contact our support",
}

/** @example {"error":"computePrice Error"} */
interface ParaSwapPriceError {
  error: ParaSwapPriceErrorMessage;
}

interface ParaSwapPriceRouteWithError {
  error: "ESTIMATED_LOSS_GREATER_THAN_MAX_IMPACT";
  /**
   * price impact %
   * @pattern ^\d+(\.\d+)?%$
   * @example "99%"
   */
  value: string;
  /** Response Body returned from `/prices` endpoint. */
  priceRoute: ParaSwapPriceRoute;
}

interface ParaSwapOptimalSwap {
  /** @example "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" */
  srcToken: string;
  srcDecimals: ParaSwapTokenDecimals;
  /** @example "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" */
  destToken: string;
  destDecimals: ParaSwapTokenDecimals;
  swapExchanges: ParaSwapOptimalSwapExchange[];
}

interface ParaSwapOptimalRoute {
  /** @example 100 */
  percent: number;
  swaps: ParaSwapOptimalSwap[];
}

interface ParaSwapOptimalSwapExchange {
  /** @example "UniswapV2" */
  exchange: string;
  /** @example "1000000000000000000" */
  srcAmount: string;
  /** @example "1000000000000000000" */
  destAmount: string;
  /** @example 100 */
  percent: number;
  /** @example {"$ref":"#/components/examples/ExchangeDataExample/value"} */
  data?: object;
}

interface ParaSwapOptionalRate {
  /** @example "UniswapV2" */
  exchange: string;
  /** @example "1000000000000000000" */
  srcAmount: string;
  /** @example "3255989380" */
  destAmount: string;
  /** @example "3255989380" */
  unit?: string;
  /** @example {"$ref":"#/components/examples/ExchangeDataExample/value"} */
  data?: object;
}

/** @example {"$ref":"#/components/examples/TransactionsRequestBodyExample/value"} */
interface ParaSwapTransactionsRequestPayload {
  /**
   * Source Token Address. Only Token Symbol could be speciﬁed for tokens from `/tokens`.
   * @example "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
   */
  srcToken: string;
  /**
   * Source Token Decimals; can be omitted if Symbol is provided for `srcToken`.
   * @example 18
   */
  srcDecimals?: number;
  /**
   * Destination Token Address. Only Token Symbol could be speciﬁed for tokens from `/tokens`.
   * @example "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
   */
  destToken: string;
  /**
   * Destination Token Decimals; can be omitted if Symbol is provided for `destToken`.
   * @example 6
   */
  destDecimals?: number;
  /**
   * Amount in the Denomination of `srcToken` as returned from the `/prices` end-point. Required if `side=SELL`. Could only be ommitted if slippage & destAmount is provided when `side=BUY`
   * @example 1000000000000000000
   */
  srcAmount?: number;
  /**
   * Amount in the Denomination of `destToken`  as returned from the `/prices` end-point.Required if `side=SELL`. Could only be ommitted if slippage & srcAmount is provided when `side=SELL`
   * @example 1000000000000000000
   */
  destAmount?: number;
  /**
   * Slippage percentage (represented in basis points). Eg: for 2.5% slippage, set the value to 0.025 * 10000 = 250; for 10% = 1000. <b>slippage</b> could be passed instead of `destAmount` when `side=SELL` or `srcAmount` when `side=BUY`
   * @min 0
   * @max 10000
   */
  slippage?: number;
  /**
   * Address of the Signer
   * @example "0xF7B2F3cD946052f8b397F801299b80F053515AF9"
   */
  userAddress: string;
  /** Whenever msg.sender (userAddress) is different than the address calling the paraswap contract, `txOrigin` must be passed along with `userAddress`. */
  txOrigin?: string;
  /** Address of the Receiver. */
  receiver?: string;
  /** Partner Address. If provided takes precedence over `partner` */
  partnerAddress?: string;
  /**
   * Used together with `partner` if provided. Should be parsed in Basis Points. Look at `slippage` parameter description to understand better.
   * @min 0
   * @max 10000
   */
  partnerFeePercent?: number;
  /**
   * Partner string. If `partnerAddress` not provided, partnerFeePercent is matched against known partners
   * @example "metamask"
   */
  partner?: string;
  /** Permit-hash (hex-string) to omit approving the user before swap. Helps in saving gas. */
  permit?: string;
  /** Timestamp (10 digit/seconds precision) till when the given transaction is valid. Eg: 1629214486. For a 5 minute, `deadline` could be calculated as `Date.now()/1000 + 300.` */
  deadline?: number;
  /** Response Body returned from `/prices` endpoint. */
  priceRoute: ParaSwapPriceRoute;
}

interface ParaSwapTransactionsBuildResponse {
  /** @example "0xbe0eb53f46cd790cd13851d5eff43d12404d33e8" */
  from?: string;
  /** @example "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57" */
  to?: string;
  /** @example "10000000000000000" */
  value?: string;
  /** @example "0xf566103400000000000000000000000075e48c954594d64ef9613aeef97ad85370f13807b2b53dca60cae1d1f93f64d80703b888689f28b63c483459183f2f4271fa0308000000000000000000000000000000000000000000000000002386f26fc100000000000000000000000000000000000000000000000000000000000001c2354900000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7" */
  data?: string;
  /** @example "42452400000" */
  gasPrice?: string;
  chainId?: ParaSwapNetwork;
  /**
   * `gas` is included only if neither of `ignoreChecks` and `ignoreGasEstimate` are true
   * @example "197142"
   */
  gas?: string;
}

enum ParaSwapTransactionsErrorMessage {
  UnableToCheckPriceImpact = "Unable to check price impact",
  ItSeemsLikeTheRateHasChangedPleaseReQueryTheLatestPrice = "It seems like the rate has changed, please re-query the latest Price",
  TheRateHasChangedPleaseReQueryTheLatestPrice = "The rate has changed, please re-query the latest Price",
  ItSeemsLikeYourWalletDoesntContainEnoughETHToCoverTheGasFees = "It seems like your wallet doesn't contain enough ETH to cover the gas fees.",
  ItSeemsLikeYourWalletDoesntContainEnoughBNBToCoverTheGasFees = "It seems like your wallet doesn't contain enough BNB to cover the gas fees.",
  ItSeemsLikeYourWalletDoesntContainEnoughMATICToCoverTheGasFees = "It seems like your wallet doesn't contain enough MATIC to cover the gas fees.",
  NotEnoughTOKENADDRESSOrTOKENSYMBOLBalance = "Not enough <TOKEN_ADDRESS or TOKEN_SYMBOL> balance",
  NotEnoughTOKENADDRESSOrTOKENSYMBOLAllowanceGivenToTokenTransferProxyCONTRACTADDRESS = "Not enough <TOKEN_ADDRESS or TOKEN_SYMBOL> allowance given to TokenTransferProxy(<CONTRACT_ADDRESS>)",
  NetworkMismatch = "Network Mismatch",
  MissingSrcAmount = "Missing srcAmount",
  MissingDestAmount = "Missing destAmount",
  CannotSpecifyBothSlippageAndSrcAmount = "Cannot specify both slippage and srcAmount",
  CannotSpecifyBothSlippageAndDestAmount = "Cannot specify both slippage and destAmount",
  MissingSlippageOrSrcAmount = "Missing slippage or srcAmount",
  MissingSlippageOrDestAmount = "Missing slippage or destAmount",
  SourceAmountMismatch = "Source Amount Mismatch",
  DestinationAmountMismatch = "Destination Amount Mismatch",
  SourceTokenMismatch = "Source Token Mismatch",
  DestinationTokenMismatch = "Destination Token Mismatch",
  ErrorParsingParams = "Error Parsing params",
  PriceRouteMustBeUnmodifiedAsSentByThePriceEndpoint = "priceRoute must be unmodified as sent by the price endpoint",
  UnableToProcessTheTransaction = "Unable to process the transaction",
  ERROR_BUILDING_TRANSACTION = "ERROR_BUILDING_TRANSACTION",
  AnErrorHasOccurredPleaseTryAgainLaterOrContactOurSupport = "An error has occurred, please try again later or contact our support",
}

/** @example {"error":"Unable to process the transaction"} */
interface ParaSwapTransactionsError {
  error: ParaSwapTransactionsErrorMessage;
}

/**
 * returned when `/tarnsactions` is called with `onlyParams=true`
 * @example {"$ref":"#/components/examples/RouterParametersExample/value"}
 */
type ParaSwapRouterParameters = (string | string[])[];

interface ParaSwapPricesListParams {
  /**
   * Source Token Address or Token Symbol (for tokens from /tokens).
   * @example "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
   */
  srcToken: string;
  /**
   * Source Token Decimals; can be omitted if Symbol is provided for `srcToken`.
   * @example 18
   */
  srcDecimals?: ParaSwapTokenDecimals;
  /**
   * Destination Token Address or Token Symbol (for tokens from /tokens).
   * @example "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
   */
  destToken: string;
  /**
   * Destination Token Decimals; can be omitted if Symbol is provided for `destToken`.
   * @example 6
   */
  destDecimals?: ParaSwapTokenDecimals;
  /**
   * Amount in the Denomination of Source Token
   * @pattern ^\d+$
   * @example "1000000000000000000"
   */
  amount: string;
  /** Side of the swap. */
  side: ParaSwapSwapSide;
  /** ID of the blockchain network. */
  network?: ParaSwapNetwork;
  /** _If provided_, **others** object is filled in the response with price quotes from other exchanges (if available for comparison). */
  otherExchangePrices?: boolean;
  /** Comma Separated List of DEXs to include without spaces. */
  includeDEXS?: ParaSwapDEXs[];
  /** Comma Separated List of DEXs to exclude without spaces. */
  excludeDEXS?: ParaSwapDEXs[];
  /** Comma Separated List of Contract Methods to include without spaces. */
  includeContractMethods?: ParaSwapContractMethod[];
  /** Comma Separated List of Contract Methods to exclude without spaces. */
  excludeContractMethods?: ParaSwapContractMethod[];
  /** User Wallet Address. */
  userAddress?: string;
  /** Dash (-) separated list of tokens (addresses or symbols from /tokens) to comprise the price route. Max 4 tokens */
  route?: string;
  /** partner string */
  partner?: string;
}

interface ParaSwapTransactionsCreateParams {
  /** The set gas-price for the transaction in wei. */
  gasPrice?: string;
  /**
   * Allows the API to skip performing onchain checks such as balances, allowances, as well as transaction simulations.
   * <b>Note:</b> The response does not contain <b><u>gas</u></b> parameter when <i>ignoreChecks</i> is set to `true`.
   */
  ignoreChecks?: boolean;
  /** Allows the API to skip gas checks <b>Note:</b> The response does not contain <b><u>gas</u></b> parameter when <i>ignoreGasEstimate</i> is set to `true`. */
  ignoreGasEstimate?: boolean;
  /** Allows the API to return the contract parameters only. */
  onlyParams?: boolean;
  /** ID of the network. (Mainnet - 1, Ropsten - 3, Polygon - 56, BSC - 137). */
  network: ParaSwapNetwork;
}
