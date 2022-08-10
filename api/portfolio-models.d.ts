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

export interface UpdatePortfolio {
  coins: PortfolioItem[];

  /** @example my desc */
  description?: string;

  /** @example Cool portfolie */
  title: string;
}
