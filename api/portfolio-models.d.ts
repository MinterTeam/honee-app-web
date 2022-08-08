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

export interface PortfolioError {
  /**
   * @format int32
   * @example 405
   */
  code?: number;
  type?: string;

  /** @example Validation exception */
  message?: string;
}

export interface Portfolio {
  /**
   * @format int64
   * @example 1
   */
  id?: number;

  /** @example Cool portfolie */
  title?: string;

  /** @example my desc */
  description?: string;

  /** @example Mx68f4839d7f32831b9234f9575f3b95e1afe21a56 */
  owner?: string;
  coins?: PortfolioItem[];
}

export interface UpdatePortfolio {
  /** @example Cool portfolie */
  title: string;

  /** @example my desc */
  description: string;
  coins: PortfolioItem[];
}

export interface PortfolioItem {
  /**
   * @format int64
   * @example 1902
   */
  id?: number;

  /**
   * @format float64
   * @example 44.5
   */
  allocation?: number;
}
