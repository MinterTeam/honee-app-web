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

interface OneInchApproveSpenderResponseDto {
  /** Address of the 1inch router that must be trusted to spend funds for the exchange */
  address: string;
}

interface OneInchApproveCalldataResponseDto {
  /** The encoded data to call the approve method on the swapped token contract */
  data: string;
  /** Gas price for fast transaction processing */
  gasPrice: string;
  /**
   * Token address that will be allowed to exchange through 1inch router
   * @example "0x6b175474e89094c44da98b954eedeac495271d0f"
   */
  to: string;
  /** Native token value in WEI (for approve is always 0) */
  value: string;
}

interface OneInchTokenDto {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI: string;
}

interface OneInchTokensResponseDto {
  /** List of supported tokens */
  tokens: OneInchTokenDto[];
}

interface OneInchProtocolImageDto {
  /** Protocol id */
  id: string;
  /** Protocol title */
  title: string;
  /** Protocol logo image */
  img: string;
  /** Protocol logo image in color */
  img_color: string;
}

interface OneInchProtocolsResponseDto {
  /** List of protocols that are available for routing in the 1inch Aggregation protocol */
  protocols: OneInchProtocolImageDto[];
}

interface OneInchPathViewDto {
  name: string;
  part: number;
  fromTokenAddress: string;
  toTokenAddress: string;
}

interface OneInchQuoteResponseDto {
  /** Source token info */
  fromToken: OneInchTokenDto;
  /** Destination token info */
  toToken: OneInchTokenDto;
  /** Expected amount of destination token */
  toTokenAmount: string;
  /** Amount of source token */
  fromTokenAmount: string;
  /** Selected protocols in a path */
  protocols: OneInchPathViewDto[];
  estimatedGas: number;
}

interface OneInchNestErrorMeta {
  /**
   * Type of field
   * @example "fromTokenAddress"
   */
  type: string;
  /**
   * Value of field
   * @example "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
   */
  value: object;
}

interface OneInchSwapErrorDto {
  /**
   * HTTP code
   * @example 400
   */
  statusCode: number;
  /**
   * Error code description
   * @example "Bad Request"
   */
  error: string;
  /** Error description (one of the following) */
  description: string;
  /** Request id */
  requestId: string;
  /** Meta information */
  meta: OneInchNestErrorMeta[];
}

interface OneInchTx {
  from: string;
  to: string;
  data: string;
  value: string;
  gasPrice: string;
  gas: string;
}

interface OneInchSwapResponseDto {
  /** Source token info */
  fromToken: OneInchTokenDto;
  /** Destination token info */
  toToken: OneInchTokenDto;
  /** Expected amount of destination token */
  toTokenAmount: string;
  /** Amount of source token */
  fromTokenAmount: string;
  /** Selected protocols in a path */
  protocols: string[];
  /** Transaction object */
  tx: OneInchTx;
}

interface OneInchChainApproveControllerGetCallDataParams {
  /**
   * Token address you want to exchange
   * @example "0x111111111117dc0aa78b770fa6a738034120c302"
   */
  tokenAddress: string;
  /**
   * The number of tokens that the 1inch router is allowed to spend.If not specified, it will be allowed to spend an infinite amount of tokens.
   * @example "100000000000"
   */
  amount?: string;
}

interface OneInchChainApproveControllerGetAllowanceParams {
  /**
   * Token address you want to exchange
   * @example "0x111111111117dc0aa78b770fa6a738034120c302"
   */
  tokenAddress: string;
  /** Wallet address for which you want to check */
  walletAddress: string;
}

interface OneInchExchangeControllerGetQuoteParams {
  /** @example "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" */
  fromTokenAddress: string;
  /** @example "0x111111111117dc0aa78b770fa6a738034120c302" */
  toTokenAddress: string;
  /** @example "10000000000000000" */
  amount: string;
  /** default: all */
  protocols?: string;
  /** Min: 0; max: 3; Max: 0; max: 3; default: 0;  !should be the same for quote and swap! */
  fee?: string;
  gasLimit?: any;
  /** max: 5; !should be the same for quote and swap! */
  connectorTokens?: any;
  /** min: 0; max: 3; default: 2; !should be the same for quote and swap! */
  complexityLevel?: any;
  /** default: 10; max: 50  !should be the same for quote and swap! */
  mainRouteParts?: any;
  /** split parts. default: 50;  max: 100!should be the same for quote and swap! */
  parts?: any;
  /** default: fast from network */
  gasPrice?: any;
}

interface OneInchExchangeControllerGetSwapParams {
  /** @example "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" */
  fromTokenAddress: string;
  /** @example "0x111111111117dc0aa78b770fa6a738034120c302" */
  toTokenAddress: string;
  /** @example "10000000000000000" */
  amount: string;
  /** The address that calls the 1inch contract */
  fromAddress: string;
  /**
   * min: 0; max: 50;
   * @example 1
   */
  slippage: number;
  /** default: all */
  protocols?: string;
  /** Receiver of destination currency. default: fromAddress */
  destReceiver?: string;
  referrerAddress?: string;
  /** Min: 0; max: 3; Max: 0; max: 3; default: 0;  !should be the same for quote and swap! */
  fee?: string;
  disableEstimate?: boolean;
  /** https://eips.ethereum.org/EIPS/eip-2612 */
  permit?: string;
  /** Allows to build calldata without optimized routers */
  compatibilityMode?: boolean;
  /** default: false; Suggest to check user's balance and allowance before set this flag; CHI should be approved to spender address */
  burnChi?: boolean;
  allowPartialFill?: boolean;
  /** split parts. default: 50;  max: 100!should be the same for quote and swap! */
  parts?: any;
  /** default: 10; max: 50  !should be the same for quote and swap! */
  mainRouteParts?: any;
  /** max: 5; !should be the same for quote and swap! */
  connectorTokens?: any;
  /** min: 0; max: 3; default: 2; !should be the same for quote and swap! */
  complexityLevel?: any;
  gasLimit?: any;
  /** default: fast from network */
  gasPrice?: any;
}
