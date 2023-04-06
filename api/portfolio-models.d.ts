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

export interface CoinItem {
  /**
   * @format float64
   * @example 118.6
   */
  percentChange24H?: number;
  /**
   * @format int64
   * @example 9086
   */
  cmcId?: number;
  /**
   * @format text
   * @example "Minter HUB"
   */
  fullName: string;
  /**
   * @format int64
   * @example 1902
   */
  minterId: number;
  /**
   * @format text
   * @example "HUB"
   */
  name: string;
  /**
   * @format float64
   * @example 240.0477
   */
  price?: number;
}

export interface CoinList {
  list: CoinItem[];
}

export interface ConsumerPortfolio {
  coins: PortfolioItem[];
  /** @example "my desc" */
  description: string;
  /**
   * @format int64
   * @example 1
   */
  id: number;
  /** @example "Mx1234567890123456789012345678901234567890" */
  isolatedAddress: string;
  /** @example "Mx68f4839d7f32831b9234f9575f3b95e1afe21a56" */
  owner: string;
  /**
   * @format float64
   * @example 1100.5
   */
  price: number;
  /**
   * @format float64
   * @example 40.25
   */
  profit: number;
  /**
   * @format float64
   * @example 2.25
   */
  profitValue: number;
  /** @example "Cool portfolio" */
  title: string;
}

export interface ConsumerPortfolioList {
  /**
   * @format float64
   * @example 2038.2
   */
  balance: number;
  list: ConsumerPortfolio[];
  pagination: Pagination;
}

export type OwnerAddress = string;

export interface Pagination {
  /**
   * @format uint32
   * @example 2
   */
  currentPage: number;
  /**
   * @format uint32
   * @example 10
   */
  lastPage: number;
  /**
   * @format uint32
   * @example 50
   */
  perPage: number;
  /**
   * @format uint32
   * @example 16434
   */
  total: number;
}

export interface Portfolio {
  coins: PortfolioItem[];
  /** @example "my desc" */
  description: string;
  /**
   * @format int64
   * @example 1
   */
  id: number;
  /** @example "Mx68f4839d7f32831b9234f9575f3b95e1afe21a56" */
  owner: string;
  profit?: Profit;
  /** @example "Cool portfolio" */
  title: string;
}

export interface PortfolioError {
  /**
   * @format int32
   * @example 999
   */
  code?: number;
  /** @example "Validation exception" */
  message?: string;
  type?: string;
}

export interface PortfolioInterval {
  coins: PortfolioItem[];
  /** @example "my desc" */
  description: string;
  /**
   * @format int64
   * @example 1
   */
  id: number;
  /** @example "Mx68f4839d7f32831b9234f9575f3b95e1afe21a56" */
  owner: string;
  /**
   * @format float64
   * @example 130.9
   */
  price: number;
  /**
   * @format float64
   * @example 30.5
   */
  profit: number;
  /**
   * @format float64
   * @example 33.59
   */
  profitValue: number;
  /** @example "Cool portfolio" */
  title: string;
}

export interface PortfolioItem {
  /**
   * @format float64
   * @min 5
   * @max 95
   * @example 44.5
   */
  allocation: number;
  /**
   * @format int64
   * @example 1902
   */
  id: number;
}

export interface PortfolioList {
  list: Portfolio[];
  pagination: Pagination;
}

export interface PortfolioListInterval {
  list: PortfolioInterval[];
  pagination: Pagination;
}

export interface Profit {
  /**
   * @format float64
   * @example 21.59
   */
  awr4: number;
  /**
   * @format float64
   * @example 40.25
   */
  daily7: number;
  /**
   * @format float64
   * @example 780.29
   */
  apy: number;
  /**
   * @format float64
   * @example 2.59
   */
  awp: number;
  /**
   * @format float64
   * @example 22.9
   */
  live: number;
  /**
   * @format float64
   * @example 12.2
   */
  recommend: number;
  /**
   * @format float64
   * @example 45.5
   */
  weekly: number;
}

export interface UpdateConsumerPortfolio {
  /**
   * @format int64
   * @example 1902
   */
  id: number;
  /**
   * @minLength 42
   * @maxLength 42
   * @example "Mx1234567890123456789012345678901234567890"
   */
  isolatedAddress: string;
  /** @format date-time */
  timestamp: string;
}

export interface UpdatePortfolio {
  /**
   * @maxItems 10
   * @minItems 2
   */
  coins: PortfolioItem[];
  /**
   * @maxLength 128
   * @example "my desc"
   */
  description?: string;
  /** @format date-time */
  timestamp: string;
  /**
   * @maxLength 16
   * @example "Cool portfolio"
   */
  title: string;
}
