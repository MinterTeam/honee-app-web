import axios from 'axios';
import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import {differenceInCalendarUTCISOWeeks} from '~/assets/utils/date-fns.js';
import format from 'date-fns/esm/format';
import {PORTFOLIO_API_URL, NETWORK, MAINNET} from "~/assets/variables.js";
import {toSnake} from '~/assets/utils/snake-case.js';
import {arrayToMap} from '~/assets/utils/collection.js';
import NotFoundError from '~/assets/utils/error-404.js';
import addToCamelInterceptor from '~/assets/axios-to-camel.js';
import addEcdsaAuthInterceptor from '~/assets/axios-ecdsa-auth.js';


const instance = axios.create({
    baseURL: PORTFOLIO_API_URL,
    adapter: cacheAdapterEnhancer(axios.defaults.adapter, { enabledByDefault: false}),
    // timeout: 5,
});
addToCamelInterceptor(instance);
addEcdsaAuthInterceptor(instance);


/**
 * https://github.com/MinterTeam/honee-portfolio/blob/master/swagger.json
 * https://portfolio-api.honee.app/v1/docs
 */


/**
 * @param {UpdatePortfolio} portfolio
 * @param {string} privateKey
 * @param {string} [telegramAuthProof]
 * @return {Promise<Portfolio>}
 */
export function createPortfolio(portfolio, privateKey, telegramAuthProof) {
    return instance.post('portfolio', portfolio, {
            ecdsaAuth: {
                privateKey,
            },
            headers: {
                'X-Telegram-Auth': telegramAuthProof,
            },
        })
        .then((response) => response.data);
}

/**
 * @param {number} id
 * @param {UpdatePortfolio} portfolio
 * @param {string} privateKey
 * @return {Promise<Portfolio>}
 */
export function updatePortfolio(id, portfolio, privateKey) {
    return instance.put(`portfolio/${id}`, portfolio, {
            ecdsaAuth: {
                privateKey,
            },
        })
        .then((response) => response.data);
}

/**
 * @return {Promise<Portfolio>}
 */
export function getPortfolio(id) {
    return instance.get(`portfolio/${id}`)
        .then((response) => response.data);
}

/**
 * @param {PortfolioListParams&{owner?: string, apyPeriod?: number}} [params]
 * @return {Promise<PortfolioList>}
 */
export function getPortfolioList(params) {
    // params.profitPeriod = params.profitPeriod || PORTFOLIO_PROFIT_PERIOD.AWP;
    return instance.get(`portfolio`, {
            params: toSnake(params),
        })
        .then((response) => response.data);
}


/**
 * week numbers starting from BATTLE_START_DATE
 * @param {number} week - week number
 * @param {PaginationParams&{skipTotalProfit:boolean}} [params]
 * @return {Promise<PortfolioList>}
 */
export function getPortfolioBattleWeek(week, params) {
    const weekMonday = shiftDate(BATTLE_START_DATE, (week - 1) * 7);
    const weekEnd = shiftDate(BATTLE_START_DATE, week * 7);

    const weekPromise = getPortfolioListByDates(formatDate(weekMonday), formatDate(weekEnd), {
        limit: 100,
        ...params,
    });
    if (params.skipTotalProfit) {
        return weekPromise;
    }

    // fill portfolio list with `totalProfit` field
    if (Number(week) === 1) {
        return weekPromise
            .then((portfolioInfo) => {
                portfolioInfo = JSON.parse(JSON.stringify(portfolioInfo));
                portfolioInfo.list = portfolioInfo.list.map((portfolio) => {
                    portfolio.totalProfit = portfolio.profit;
                    return portfolio;
                });
                return portfolioInfo;
            });
    } else {
        const totalPromise = getPortfolioListByDates(formatDate(BATTLE_START_DATE), formatDate(weekEnd), {
            limit: 100000,
        });
        return Promise.all([weekPromise, totalPromise])
            .then(([portfolioInfo, totalBattlePortfolioInfo]) => {
                const totalBattleMap = arrayToMap(totalBattlePortfolioInfo.list, 'id');
                portfolioInfo = JSON.parse(JSON.stringify(portfolioInfo));
                portfolioInfo.list = portfolioInfo.list.map((portfolio) => {
                    portfolio.totalProfit = totalBattleMap[portfolio.id]?.profit;
                    return portfolio;
                });
                return portfolioInfo;
            });
    }
}

const portfolioByDatesCacheLong = new Cache({ttl: 24 * 60 * 60 * 1000, max: 1000});
const portfolioByDatesCacheShort = new Cache({ttl: 5 * 60 * 1000, max: 1000});

/**
 * week numbers starting from BATTLE_START_DATE
 * @param {string} start
 * @param {string} end - end week number
 * @param {PaginationParams} params
 * @return {Promise<PortfolioList>}
 */
export function getPortfolioListByDates(start, end, params) {
    const today = getToday();
    const endDate = new Date(end + 'T00:00:00Z');
    // check equal here, because 00:00:00 snapshot is considered as past day snapshot
    const isPastDaySnapshot = endDate <= today;

    return instance.get(`portfolio/${start}/${end}`, {
            params,
            cache: isPastDaySnapshot  ? portfolioByDatesCacheLong : portfolioByDatesCacheShort,
        })
        .then((response) => response.data);
}

/**
 * @typedef {PaginationParams} PortfolioListParams
 * @property {PORTFOLIO_PROFIT_PERIOD} [profitPeriod]
 */

/**
 * @typedef {object} PaginationParams
 * @property {number} [page]
 * @property {number} [limit]
 */

// leaderboard updates once 24h, so 1h cache is ok
const leaderboardCache = new Cache({ttl: 60 * 60 * 1000, max: 100});
/**
 * @param {PortfolioListParams} [params]
 * @return {Promise<ConsumerPortfolioList>}
 */
export function getLeaderboard({limit, profitPeriod} = {}) {
    return instance.get(`consumer/portfolio/${getLeaderboardDateParams(profitPeriod)}`, {
        cache: leaderboardCache,
    })
        .then((response) => {
            if (limit) {
                return {
                    list: response.data.list.slice(0, limit),
                };
            }

            return response.data;
        });
}
function getLeaderboardDateParams(profitPeriod) {
    if (profitPeriod === PORTFOLIO_PROFIT_PERIOD.DAILY7) {
        const future = '2999-01-01';
        const weekAgo = shiftDate(today, -7);
        return formatDate(weekAgo) + '/' + future;
    }
    if (profitPeriod === PORTFOLIO_PROFIT_PERIOD.WTD) {
        const future = '2999-01-01';
        const monday = getLastMonday();
        return formatDate(monday) + '/' + future;
    }
    if (profitPeriod === PORTFOLIO_PROFIT_PERIOD.WEEKLY) {
        const monday = getLastMonday();
        const weekAgo = shiftDate(monday, -7);
        return formatDate(weekAgo) + '/' + formatDate(monday);
    }
}

/**
 * @param {Date} date
 * @return {string}
 */
function formatDate(date) {
    return format(date, 'yyyy-MM-dd');
}

/**
 * @return {Date}
 */
function getToday() {
    let now = new Date();
    let today = new Date(0);
    today.setUTCFullYear(now.getUTCFullYear());
    today.setUTCMonth(now.getUTCMonth());
    today.setUTCDate(now.getUTCDate());
    return today;
}

function getLastMonday() {
    const today = getToday();
    let todayDay = today.getDay();
    // fix sunday
    if (todayDay === 0) {
        todayDay = 7;
    }
    return shiftDate(today, todayDay * -1 + 1);
}

/**
 * @param {Date} targetDate
 * @param {number} dayCount
 * @return {Date}
 */
function shiftDate(targetDate, dayCount) {
    let result = new Date(targetDate);
    result.setDate(targetDate.getDate() + dayCount);
    return result;
}


/**
 * @param {'init'|'buy'|'sell'} type
 * @param {number} id - portfolio id
 * @param {string} address - isolated account
 * @param {string} privateKey - private key of the main account
 * @return {Promise<ConsumerPortfolio|void>}
 */
export function postConsumerPortfolio(type, id, address, privateKey) {
    return instance.post(`consumer/portfolio/${type}`, {
        id,
        isolatedAddress: address,
    }, {
        ecdsaAuth: {
            privateKey,
        },
    })
        .then((response) => response.data);
}

// consumer portfolio list can be cached, because we will update local state on init/buy/sell change manually
const consumerCache = new Cache({ttl: 1 * 60 * 1000, max: 100});

/**
 * @param {string} address
 * @return {Promise<ConsumerPortfolioList>}
 */
export function getConsumerPortfolioList(address) {
    return instance.get(`consumer/portfolio/${address}`, {
        cache: consumerCache,
    })
        .then((response) => response.data)
        .catch((error) => {
            if (error.response?.status === 404) {
                return {list: []};
            } else {
                throw error;
            }
        });

}

/**
 * @param {string} address
 * @param {number|string} id
 * @return {Promise<ConsumerPortfolio>}
 */
export function getConsumerPortfolio(address, id) {
    id = Number(id);
    return getConsumerPortfolioList(address)
        .then((result) => {
            const portfolio = result.list.find((item) => item.id === id);
            if (!portfolio) {
                return Promise.reject(new NotFoundError('Copied portfolio not found'));
            }
            return portfolio;
        });
}

const coinsCache = new Cache({ttl: 5 * 60 * 1000, max: 100});

/**
 * @return {Promise<Array<CoinItem>>}
 */
export function getCmcCoinList() {
    return instance.get('coins', {
            cache: coinsCache,
        })
        .then((response) => response.data.list.map((item) => {
            item.symbol = item.name;
            return item;
        }));
}

// monday of 43 ISO week
export const BATTLE_START_DATE = new Date('2022-10-24T00:00:00Z');
// week number starting from 1
export const BATTLE_CURRENT_WEEK_NUMBER = differenceInCalendarUTCISOWeeks(new Date(), BATTLE_START_DATE) + 1;


/**
 * @enum {string}
 */
export const PORTFOLIO_PROFIT_PERIOD = {
    // profit for some last updates (5-10) compounded
    APY: 'apy',
    // average weekly profit: average of last 4 full weeks (monday-sunday) (negative week bans metric)
    AWP: 'awp',
    // average of last full week (monday-sunday)
    WEEKLY: 'weekly',
    // average of last 7 days
    DAILY7: 'daily7',
    // from monday to today (aka week to date)
    WTD: 'live',
    // change from last update and filtered for few hours (6hr) since update
    // RECOMMEND: 'recommend',
};
