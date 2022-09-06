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
   * @format int64
   * @example 9086
   */
  cmcId?: number;

  /**
   * @format int64
   * @example 1902
   */
  minterId: number;

  /**
   * @format text
   * @example HUB
   */
  name: string;
}

export interface CoinList {
  list: CoinItem[];
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

  /** @example my desc */
  description: string;

  /**
   * @format int64
   * @example 1
   */
  id: number;

  /** @example Mx68f4839d7f32831b9234f9575f3b95e1afe21a56 */
  owner: string;
  profit?: Profit;

  /** @example Cool portfolio */
  title: string;
}

export interface PortfolioError {
  /**
   * @format int32
   * @example 999
   */
  code?: number;

  /** @example Validation exception */
  message?: string;
  type?: string;
}

export interface PortfolioItem {
  /**
   * @format float64
   * @min 0.01
   * @max 99.99
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

export interface Profit {
  /**
   * @format float64
   * @example 40.25
   */
  daily7?: number;

  /**
   * @format float64
   * @example 45.5
   */
  weekly?: number;
}

export interface UpdatePortfolio {
  coins: PortfolioItem[];

  /** @example my desc */
  description?: string;

  /** @format date-time */
  timestamp: string;

  /** @example Cool portfolio */
  title: string;
}