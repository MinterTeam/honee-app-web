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

interface SwapPoolRouteResponse {
  /**
   * Input coin amount
   * @example "1.000000000000000000"
   */
  amountIn: string;
  /**
   * Iutput coin amount
   * @example "1.000000000000000000"
   */
  amountOut: string;
  /** Coins route */
  coins: CoinIdResource[];
}

interface PoolStatsCollectionResponse {
  /** Pool stats */
  data: PoolStatsResponse[];
}

interface PoolStatsResponse {
  /**
   * Date
   * @example "2021-10-12T00:00:00Z"
   */
  date?: string;
  /**
   * Volume in first pool coin
   * @example "10000.000000000000000000"
   */
  firstCoinVolume?: string;
  /**
   * Volume in second pool coin
   * @example "10000.000000000000000000"
   */
  secondCoinVolume?: string;
  /**
   * Volume in bip
   * @example "10000.000000000000000000"
   */
  bipVolume?: string;
}

interface PoolsPaginatedCollectionResponse {
  /** Pools */
  data: PoolResponse[];
  links: PaginationLinksResponse;
  meta: PaginationMetaResponse;
}

interface PoolProvidersPaginatedCollectionResponse {
  /** Pools */
  data: PoolProviderResponse[];
  links: PaginationLinksResponse;
  meta: PaginationMetaResponse;
}

interface PoolProviderResponse {
  /**
   * Provider Minter address
   * @example "Mxe449e9fd85fd553fa45d245b62e30253bce29cc7"
   */
  address: string;
  /** Pool coin0 */
  coin0: CoinIdResource;
  /** Pool coin1 */
  coin1: CoinIdResource;
  /** Pool token */
  token: CoinIdResource;
  /**
   * Provider coin0 amount
   * @example "1.000000000000000000"
   */
  amount0: string;
  /**
   * Provider coin1 amount
   * @example "1.000000000000000000"
   */
  amount1: string;
  /**
   * Provider liquidity amount
   * @example "1.000000000000000000"
   */
  liquidity: string;
  /**
   * Provider liquidity amount in bip
   * @example "1.000000000000000000"
   */
  liquidityBip: string;
  /**
   * Provider share
   * @example "12.35"
   */
  liquidityShare: string;
}

interface PoolResponse {
  /** Pool coin0 */
  coin0: CoinIdResource;
  /** Pool coin1 */
  coin1: CoinIdResource;
  /** Pool token */
  token: CoinIdResource;
  /**
   * Coin0 amount
   * @example "1.000000000000000000"
   */
  amount0: string;
  /**
   * Coin1 amount
   * @example "1.000000000000000000"
   */
  amount1: string;
  /**
   * Liquidity amount
   * @example "1.000000000000000000"
   */
  liquidity: string;
  /**
   * Liquidity amount in bip
   * @example "1.000000000000000000"
   */
  liquidityBip: string;
}

interface CheckResponse {
  /**
   * Check issuer
   * @example "Mxa55b52bc4a5a90f84ebc7832a8b359c2ae3c0f41"
   */
  addressFrom: string;
  /**
   * Check redeemer
   * @example "Mxc64064647a20f918c4dc3a946903d476d0b5543b"
   */
  addressTo: string;
  /** Check coin */
  coin: CoinIdResource;
  /** Check gas coin */
  gasCoin: CoinIdResource;
  /**
   * Check nonce in base64
   * @example "OGNhMDdkYWY3MDA3YzBjNw=="
   */
  nonce: string;
  /**
   * Check value
   * @example "1.000000000000000000"
   */
  value: string;
  /**
   * Check due block
   * @example 99999999
   */
  dueBlock: number;
  /**
   * Raw check
   * @example "Mxf8a89038636130376461663730303763306337018405f5e0ff80880de0b6b3a764000080b841869dea308adb182224d9e93a88365c25d744381c5ec8f3b0ec8fa2b9953300c26de7367fc6733cb2e81a4eda0d9f55f02d7c2812949d78bc6f5ee058932333ed001ba07f150d18c95a2cbaa9a84058124a2ee3fedbc8725a47bc85ebe95f21267cfa71a036f2c5b4b515268ac6135f00dcb24181bf33a67043405922119d9155ca0e943f"
   */
  rawCheck: string;
}

interface CheckPaginatedCollectionResponse {
  /** Checks */
  data: CheckResponse[];
  links: PaginationLinksResponse;
  meta: PaginationMetaResponse;
}

interface BlockResponse {
  /**
   * Block height
   * @example 34863
   */
  height: number;
  /**
   * Block size
   * @example 253
   */
  size: number;
  /**
   * Transaction count
   * @example 125
   */
  transactionCount: number;
  /**
   * Block time
   * @example 4.23123
   */
  blockTime: number;
  /**
   * Block timestamp
   * @example "2019-02-19T00:00:00+03:00"
   */
  timestamp: string;
  /**
   * Block reward
   * @example "333"
   */
  reward: string;
  /**
   * Block hash
   * @example "ITHA0XQPS5XTOY6NTTOOJX5VAVZQHTRIZJDHQKKUPUQDNX7JYVDE4UO5LFFCWSVA"
   */
  hash: string;
  /**
   * Block validators count
   * @example 5
   */
  validatorsCount: number;
}

interface BlockDetailedResponse {
  /**
   * Block height
   * @example 34863
   */
  height: number;
  /**
   * Block size
   * @example 253
   */
  size: number;
  /**
   * Transaction count
   * @example 125
   */
  transactionCount: number;
  /**
   * Block time
   * @example 4.23123
   */
  blockTime: number;
  /**
   * Block timestamp
   * @example "2019-02-19T00:00:00+03:00"
   */
  timestamp: string;
  /**
   * Block reward
   * @example "333"
   */
  reward: string;
  /**
   * Block hash
   * @example "ITHA0XQPS5XTOY6NTTOOJX5VAVZQHTRIZJDHQKKUPUQDNX7JYVDE4UO5LFFCWSVA"
   */
  hash: string;
  /** Block validators */
  validators: BlockValidatorResponse[];
}

interface BlockPaginatedCollectionResponse {
  /** Blocks */
  data: BlockResponse[];
  links: PaginationLinksResponse;
  meta: PaginationMetaResponse;
}

interface CoinCollectionResponse {
  data: CoinResponse[];
}

interface CoinResponse {
  /**
   * Coin id
   * @example 1
   */
  id: number;
  /**
   * Coin crr
   * @example 10
   */
  crr: number;
  /**
   * Coin volume
   * @example "45656534.3546"
   */
  volume: string;
  /**
   * Coin reserve balance
   * @example "10.356"
   */
  reserveBalance: string;
  /**
   * Coin max supply
   * @example "100.000000000000000000"
   */
  maxSupply: string;
  /**
   * Coin name
   * @example "My super coin"
   */
  name: string;
  /**
   * Coin symbol
   * @example "MNT"
   */
  symbol: string;
  /**
   * Coin owner address
   * @example "Mxd82558ea00eb81d35f2654953598f5d51737d31d"
   */
  ownerAddress: string;
  /**
   * Is coin burnable
   * @example true
   */
  burnable: boolean;
  /**
   * Is coin mintable
   * @example false
   */
  mintable: boolean;
  /**
   * Coin type
   * @example "token"
   */
  type: string;
}

interface PaginationLinksResponse {
  /**
   * First page
   * @example "https://testnet.explorer.minter.network/blocks?page=1"
   */
  first: string;
  /**
   * Last page
   * @example "https://testnet.explorer.minter.network/blocks?page=10"
   */
  last: string;
  /**
   * Previous page
   * @example "https://testnet.explorer.minter.network/blocks?page=1"
   */
  prev: string | null;
  /**
   * Next page
   * @example "https://testnet.explorer.minter.network/blocks?page=2"
   */
  next: string | null;
}

interface PaginationMetaResponse {
  /**
   * Current page number
   * @example 2
   */
  currentPage: number;
  /**
   * Last page number
   * @example 10
   */
  lastPage: number;
  /**
   * Request path
   * @example "https://testnet.explorer.minter.network"
   */
  path: string;
  /**
   * Elements per page
   * @example 50
   */
  perPage: number;
  /**
   * Total number of elements
   * @example 16434
   */
  total: number;
}

interface AddressCollectionResponse {
  data: AddressResponse[];
}

interface AddressResponse {
  /**
   * Minter address
   * @example "Mxe449e9fd85fd553fa45d245b62e30253bce29cc7"
   */
  address: string;
  /** Address balances */
  balances: AddressBalanceResponse[];
}

interface AddressWithSumResponse {
  /**
   * Minter address
   * @example "Mxe449e9fd85fd553fa45d245b62e30253bce29cc7"
   */
  address: string;
  /**
   * Address balance sum in base
   * @example "100.000000000000000000"
   */
  balanceSumInBaseCoin: string;
  /**
   * Address balance sum in USD by bip.dev price
   * @example "5.000000000000000000"
   */
  balanceSumInUsd: number;
  /** Address balances */
  balances: AddressBalanceResponse[];
}

interface AddressBalanceResponse {
  coin: CoinIdTypeResource;
  /**
   * Amount of coin
   * @example "1257.4657"
   */
  amount: string;
  /**
   * Amount of coin in basecoin
   * @example "1257.4657"
   */
  bipAmount?: string;
}

interface TransactionResponse {
  /**
   * Transaction number
   * @example 17653
   */
  txn: number;
  /**
   * Transaction hash
   * @example "Mtc923c18c1d842dcba262c63df22003d5ee4e683dc2927acf9580f083ad9e193e"
   */
  hash: string;
  /**
   * Transaction nonce
   * @example 113
   */
  nonce: number;
  /**
   * Block height
   * @example 119
   */
  height: number;
  /**
   * Transaction timestamp
   * @example "2019-02-19T00:00:00+03:00"
   */
  timestamp: string;
  /**
   * Gas
   * @example "100"
   */
  gas: string;
  gasCoin: CoinIdResource;
  /**
   * Gas price
   * @example 1
   */
  gasPrice: number;
  /**
   * Transaction fee
   * @example "10.000000000000000000"
   */
  fee: string;
  /**
   * Transaction type
   * @example 1
   */
  type: number;
  /**
   * Transaction payload
   * @example "Super tx from developers"
   */
  payload: string;
  /**
   * Transaction sender address
   * @example "Mx184ac726059e43643e67290666f7b3195093f870"
   */
  from: string;
  data: TxSendCoinData;
  /**
   * Transaction raw
   * @example "f86a820f690201800198d78094a1f103c242237370d409ff5ff9f1817d42f94dda80808001b845f8431ca0e28faabf44e82e013210bc3cc50a29db6fb9794605e1f5e6efdeaa6ac55ea5b5a02808f13510775dd3e89271662b78fa2295169060ac0fb0469d01ae4731e93fad"
   */
  rawTx: string;
  /**
   * Commission in base coin
   * @example "2.250000000000000000"
   */
  commissionInBaseCoin: string;
  /**
   * Commission in gas coin
   * @example "2.250000000000000000"
   */
  commissionInGasCoin: string;
  /**
   * Commission price
   * @example "2.250000000000000000"
   */
  commissionPrice: string;
  commissionPriceCoin: CoinIdResource;
}

interface CoinIdResource {
  /**
   * Coin id
   * @example 10
   */
  id: number;
  /**
   * Coin symbol
   * @example "TESTCOIN"
   */
  symbol: string;
}

interface CoinIdTypeResource {
  /**
   * Coin id
   * @example 10
   */
  id: number;
  /**
   * Coin symbol
   * @example "TESTCOIN"
   */
  symbol: string;
  /**
   * Coin type. Variants: coin, token, pool_token
   * @example "coin"
   */
  type: string;
}

interface InvalidTransactionResponse {
  /**
   * Transaction hash
   * @example "Mtc923c18c1d842dcba262c63df22003d5ee4e683dc2927acf9580f083ad9e193e"
   */
  hash: string;
  /**
   * Block height
   * @example 119
   */
  height: number;
  /**
   * Transaction timestamp
   * @example "2019-02-19T00:00:00+03:00"
   */
  timestamp: string;
  /**
   * Transaction type
   * @example "send"
   */
  type: string;
  /**
   * Transaction sender address
   * @example "Mx184ac726059e43643e67290666f7b3195093f870"
   */
  from: string;
}

interface TransactionPaginatedCollectionResponse {
  /** Transactions */
  data: TransactionResponse[];
  links: PaginationLinksResponse;
  meta: PaginationMetaResponse;
}

interface BlockValidatorResponse {
  /**
   * Is block signed by validator
   * @example true
   */
  signed: boolean;
  validator: Validator;
}

interface ValidatorBanPaginatedCollectionResponse {
  /** Bans */
  data: ValidatorBanResponse[];
  links: PaginationLinksResponse;
  meta: PaginationMetaResponse;
}

interface ValidatorBanResponse {
  /**
   * Block height
   * @example 215
   */
  height: number;
  /**
   * Timestamp
   * @example "2019-02-19T00:00:00+03:00"
   */
  timestamp: string;
}

interface AddressBanPaginatedCollectionResponse {
  /** Bans */
  data: AddressBanResponse[];
  links: PaginationLinksResponse;
  meta: PaginationMetaResponse;
}

interface AddressBanResponse {
  /**
   * Block height
   * @example 215
   */
  height: number;
  validator: Validator;
  /**
   * Timestamp
   * @example "2019-02-19T00:00:00+03:00"
   */
  timestamp: string;
}

interface SlashPaginatedCollectionResponse {
  /** Slashes */
  data: SlashResponse[];
  links: PaginationLinksResponse;
  meta: PaginationMetaResponse;
}

interface SlashResponse {
  /**
   * Block height
   * @example 215
   */
  height: number;
  coin: CoinIdResource;
  /**
   * Slash amount
   * @example "0.000000000000000001"
   */
  amount: string;
  /**
   * Minter address
   * @example "Mxee81347211c72524338f9680072af90744333146"
   */
  address: string;
  validator: Validator;
  /**
   * Timestamp
   * @example "2019-02-19T00:00:00+03:00"
   */
  timestamp: string;
}

interface UnbondCollectionResponse {
  /** Slashes */
  data: UnbondResponse[];
}

interface UnbondResponse {
  coin: CoinIdResource;
  /**
   * Minter address
   * @example "Mxee81347211c72524338f9680072af90744333146"
   */
  address: string;
  /**
   * Unbond value
   * @example "0.000000000000000001"
   */
  value: string;
  validator: Validator;
  /**
   * Block height
   * @example 215
   */
  height: number;
}

interface AggregatedRewardPaginatedCollectionResponse {
  /** Rewards */
  data: AggregatedRewardResponse[];
  links: PaginationLinksResponse;
  meta: PaginationMetaResponse;
}

interface AggregatedRewardResponse {
  /**
   * Time id
   * @deprecated
   * @example "2019-11-19T00:00:00Z"
   */
  timeId?: string;
  /**
   * Timestamp
   * @example "2019-11-19T00:00:00Z"
   */
  timestamp: string;
  /**
   * Role
   * @example "Developers"
   */
  role: string;
  /**
   * Reward amount
   * @example "155.764917315250067002"
   */
  amount: string;
  /**
   * Minter address
   * @example "Mxee81347211c72524338f9680072af90744333146"
   */
  address: string;
  validator: Validator;
}

interface RewardStatisticCollectionResponse {
  /** Chart data */
  data: RewardStatisticResponse[];
}

interface RewardStatisticResponse {
  /**
   * Timestamp
   * @example "2019-02-18 00:00:00+03"
   */
  time: string;
  /**
   * Sum of reward amount
   * @example "38602.071957527232491487"
   */
  amount: string;
}

interface OrderResponse {
  /**
   * Limit order id
   * @example 215
   */
  id?: number;
  /**
   * Limit order placer address
   * @example "Mxe449e9fd85fd553fa45d245b62e30253bce29cc7"
   */
  address?: string;
  /**
   * Limit order pool id
   * @example 1
   */
  poolId?: number;
  /**
   * Limit order initial coin volume to buy
   * @example "10000.000000000000000000"
   */
  initialCoinToBuyVolume?: string;
  /**
   * Limit ordercoin volume to buy
   * @example "10000.000000000000000000"
   */
  coinToBuyVolume?: string;
  /**
   * Limit order initial coin volume to sell
   * @example "10000.000000000000000000"
   */
  initialCoinToSellVolume?: string;
  /**
   * Limit order coin volume to sell
   * @example "10000.000000000000000000"
   */
  coinToSellVolume?: string;
  coinToBuy?: CoinIdResource;
  coinToSell?: CoinIdResource;
  /**
   * Limit order height
   * @example 1000
   */
  height?: number;
  /**
   * Limit order current status. Possible values: active, partially_filled, filled, canceled, expired.
   * @example "active"
   */
  status?: string;
}

interface OrderPaginatedCollectionResponse {
  /** Bans */
  data: OrderResponse[];
  links: PaginationLinksResponse;
  meta: PaginationMetaResponse;
}

interface DelegationCollectionResponse {
  /** Delegations data */
  data: DelegationResponse[];
}

interface DelegationPaginatedCollectionResponse {
  /** Blocks */
  data: DelegationResponse[];
  links: PaginationLinksResponse;
  meta: {
    /**
     * Current page number
     * @example 2
     */
    current_page: number;
    /**
     * Last page number
     * @example 10
     */
    last_page: number;
    /**
     * Request path
     * @example "https://testnet.explorer.minter.network"
     */
    path: string;
    /**
     * Elements per page
     * @example 50
     */
    per_page: number;
    /**
     * Total number of elements
     * @example 16434
     */
    total: number;
    additional: {
      /**
       * Address delegated bip value sum
       * @example "30000000.000000000000000000"
       */
      total_delegated_bip_value?: string;
    };
  };
}

interface DelegationResponse {
  coin: CoinIdResource;
  /**
   * Amount
   * @example "38602.071957527232491487"
   */
  value: string;
  /**
   * Amount in base coin (BIP)
   * @example "10000.071957527232491487"
   */
  bipValue: string;
  validator: Validator;
  /**
   * Is stake in waitlist
   * @example false
   */
  isWaitlisted: boolean;
}

interface Validator {
  /**
   * Validator public key
   * @example "Mp8f053f3802d33f5e7092bb01ca99ae77606f4faf759c72560d5ee69b8e191a56"
   */
  publicKey: string;
  /**
   * Validator name
   * @example "Super validator"
   */
  name: string;
  /**
   * Validator description
   * @example "My description"
   */
  description: string;
  /**
   * Validator icon url
   * @example "https://explorer-static.minter.network/validators/icon.png"
   */
  iconUrl: string;
  /**
   * Validator site url
   * @example "https://minter.network"
   */
  siteUrl: string;
  /**
   * Validator status. 1 - not ready, 2 - ready
   * @example 2
   */
  status: number;
}

interface ValidatorCollectionResponse {
  /** Validators data */
  data: ValidatorResponse[];
}

/** Validator data */
interface ValidatorResponse {
  /**
   * Validator public_key
   * @example "Mp65758496f8a5d626cac77f5a38894beae0050fdef862da201964cd2fd8111111"
   */
  publicKey: string;
  /**
   * Validator status. 1 - not ready, 2 - ready
   * @example 2
   */
  status: number;
  /**
   * Validator stake
   * @example "2456.78543535"
   */
  stake: string;
  /**
   * Validator name
   * @example "Super validator"
   */
  name: string;
  /**
   * Validator description
   * @example "My description"
   */
  description: string;
  /**
   * Validator icon url
   * @example "https://explorer-static.minter.network/validators/icon.png"
   */
  iconUrl: string;
  /**
   * Validator site url
   * @example "https://minter.network"
   */
  siteUrl: string;
  /**
   * Validator commission
   * @example 10
   */
  commission?: number;
  /**
   * Validator stake part of total stake
   * @example "0.33"
   */
  part: string;
  /**
   * Validator min stake value
   * @example "100.000000000000000000"
   */
  minStake?: string;
  /**
   * Delegators count
   * @example 12
   */
  delegatorCount: number;
}

interface StakeCollectionResponse {
  /** Chart data */
  data: StakeResponse[];
}

interface StakeResponse {
  coin: CoinIdResource;
  /**
   * Minter address
   * @example "Mxe449e9fd85fd553fa45d245b62e30253bce29cc7"
   */
  address: string;
  /**
   * Amount
   * @example "38602.071957527232491487"
   */
  value: string;
  /**
   * Amount in base coin (BIP)
   * @example "10000.071957527232491487"
   */
  bipValue: string;
  /**
   * Is stake in waitlist
   * @example false
   */
  isWaitlisted: boolean;
}

interface StatisticCollectionResponse {
  /** Chart data */
  data: StatisticResponse[];
}

interface StatisticResponse {
  /**
   * Timestamp
   * @example "2019-02-19T00:00:00+03:00"
   */
  date: string;
  /**
   * Transaction count
   * @example 356
   */
  transactionCount: number;
}

interface StatusResponse {
  data: {
    /**
     * Average block time in seconds.
     * @example 5.1676245210727965
     */
    avg_block_time: number;
    /**
     * Bip price change
     * @example 10
     */
    bip_price_change: number;
    /**
     * Bip price in USD
     * @example 0.07
     */
    bip_price_usd: number;
    /**
     * Latest block height
     * @example 1245
     */
    latest_block_height: number;
    /**
     * Latest block time
     * @example "2019-02-19T00:00:00+03:00"
     */
    latest_block_time: string;
    /**
     * Market cap
     * @example 24335.640000000003
     */
    market_cap: number;
    /**
     * Total transaction count
     * @example 120546
     */
    total_transactions: number;
    /**
     * Transactions per second by last 24 hours
     * @example 2.5678
     */
    transactions_per_second: number;
  };
}

interface StatusPageResponse {
  data: {
    /**
     * Active candidates.
     * @example 10
     */
    active_candidates: number;
    /**
     * Active validators.
     * @example 16
     */
    active_validators: number;
    /**
     * Average transaction commission.
     * @example 24.5
     */
    avg_transaction_commission: number;
    /**
     * Emission of basecoin.
     * @example 786952800
     */
    bip_emission: number;
    /**
     * Average block time in seconds by last 24 hours.
     * @example 5.1676245210727965
     */
    block_speed_24h: number;
    /**
     * The number of custom coins.
     * @example 100
     */
    custom_coins_count: number;
    /**
     * Sum of custom coins.
     * @example "200320979.992105033830437239"
     */
    custom_coins_sum: string;
    /**
     * Free float of base coin.
     * @example 126652410.55061746
     */
    free_float_bip: number;
    /**
     * Blocks count.
     * @example 1044
     */
    blocks_count: number;
    /**
     * Explorer status. Can be: down | active
     * @example "active"
     */
    status: string;
    /**
     * Total transaction commission
     * @example 10
     */
    total_commission: number;
    /**
     * Total delegated in base coin.
     * @example "10000"
     */
    total_delegated_bip: string;
    /**
     * Transaction count by last 24 hours.
     * @example 1246
     */
    transaction_count_24h: number;
    /**
     * Transaction speed per second by last 24 hours
     * @example 2.5
     */
    transactions_per_second: number;
    /**
     * Total transaction count
     * @example 20435
     */
    transactions_total: number;
    /**
     * Network uptime
     * @example 99
     */
    uptime: number;
  };
}

interface TxSendCoinData {
  coin?: CoinIdResource;
  /**
   * Receiver address
   * @example "Mxd82558ea00eb81d35f2654953598f5d51737d31d"
   */
  to?: string;
  /**
   * Send coin amount
   * @example "12.357"
   */
  value?: string;
}

interface TxBuyCoinData {
  coinToBuy?: CoinIdResource;
  coinToSell?: CoinIdResource;
  /**
   * Buy coin amount
   * @example "12.357"
   */
  valueToBuy?: string;
  /**
   * Sell coin amount
   * @example "12.257"
   */
  valueToSell?: string;
  /**
   * Maximum amount to sell
   * @example "1.000000000000000000"
   */
  maximumValueToSell?: string;
}

interface TxSellCoinData {
  coinToBuy?: CoinIdResource;
  coinToSell?: CoinIdResource;
  /**
   * Buy coin amount
   * @example "12.357"
   */
  valueToBuy?: string;
  /**
   * Sell coin amount
   * @example "12.257"
   */
  valueToSell?: string;
  /**
   * Maximum amount to buy
   * @example "1.000000000000000000"
   */
  maximumValueToBuy?: string;
}

interface TxSellAllCoinData {
  coinToBuy?: CoinIdResource;
  coinToSell?: CoinIdResource;
  /**
   * Buy coin amount
   * @example "12.357"
   */
  valueToBuy?: string;
  /**
   * Sell coin amount
   * @example "12.257"
   */
  valueToSell?: string;
  /**
   * Maximum amount to buy
   * @example "1.000000000000000000"
   */
  maximumValueToBuy?: string;
}

interface TxCreateCoinData {
  /**
   * Coin name
   * @example "Minter"
   */
  name?: string;
  /**
   * Coin symbol
   * @example "MNT"
   */
  symbol?: string;
  /**
   * Initial amount of coin
   * @example "1200"
   */
  initialAmount?: string;
  /**
   * Initial reserve of coin
   * @example "12"
   */
  initialReserve?: string;
  /**
   * Constant reserve ratio
   * @example "50"
   */
  constantReserveRatio?: string;
}

interface TxSetCandidateData {
  /**
   * Candidate public key
   * @example "Mpc8c6834da8ba2b0b24f7e5ab67049509278e709cde925f14184586f74dcc9d0b"
   */
  pubKey?: string;
}

interface TxUnbondData {
  /**
   * Validator public key
   * @example "Mpc8c6834da8ba2b0b24f7e5ab67049509278e709cde925f14184586f74dcc9d0b"
   */
  pubKey?: string;
  coin?: CoinIdResource;
  /**
   * Unbond coin amount
   * @example "12.357"
   */
  value?: string;
}

interface TxRedeemCheckData {
  /** Check */
  rawCheck?: string;
  /** Check proof */
  proof?: string;
  check?: {
    coin?: CoinIdResource;
    /** @example "BfC=" */
    nonce?: string;
    /** @example "1.0000" */
    value?: string;
    /** @example "Mxb1ffcc545ba552875c04c18af7095bfa7f3156ee" */
    sender?: string;
    /** @example 999999 */
    due_block?: number;
  };
}

interface TxEditCandidateData {
  /**
   * Validator public key
   * @example "Mpc8c6834da8ba2b0b24f7e5ab67049509278e709cde925f14184586f74dcc9d0b"
   */
  pubKey?: string;
  /**
   * Reward address
   * @example "Mx184ac726059e43643e67290666f7b3195093f870"
   */
  rewardAddress?: string;
  /**
   * Owner address
   * @example "Mx184ac726059e43643e67290666f7b3195093f870"
   */
  ownerAddress?: string;
}

interface TxDelegateCoinData {
  /**
   * Validator public key
   * @example "Mpc8c6834da8ba2b0b24f7e5ab67049509278e709cde925f14184586f74dcc9d0b"
   */
  pubKey?: string;
  coin?: CoinIdResource;
  /**
   * Coin amount
   * @example "12.357"
   */
  stake?: string;
}

interface TxDeclareCandidacyData {
  /**
   * Address
   * @example "Mx184ac726059e43643e67290666f7b3195093f870"
   */
  address?: string;
  /**
   * Validator public key
   * @example "Mpc8c6834da8ba2b0b24f7e5ab67049509278e709cde925f14184586f74dcc9d0b"
   */
  pubKey?: string;
  /**
   * Validator commission
   * @example "10"
   */
  commission?: string;
  coin?: CoinIdResource;
  /**
   * Coin amount
   * @example "12.357"
   */
  stake?: string;
}

interface TxCreateMultisigData {
  /**
   * Address
   * @example "10"
   */
  threshold?: string;
  /** Addresses weights */
  weights?: number[];
  /** Addresses */
  addresses?: string[];
}

interface TxMultisendData {
  /** List of receivers */
  list?: TxSendCoinData[];
}

interface ErrorResponse {
  error: {
    /** @example -1 */
    code: number;
    /** @example "Some error message" */
    message: string;
  };
}

interface ValidationErrorResponse {
  error: {
    /** @example -1 */
    code: number;
    /** @example "Some error message" */
    message: string;
    fields: object;
  };
}
