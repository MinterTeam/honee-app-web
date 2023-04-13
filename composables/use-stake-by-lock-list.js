import {ref, computed} from 'vue';
import {getAddressLockList, getPremiumLevel} from '~/api/staking.js';
import {PREMIUM_STAKE_PROGRAM_ID} from '~/assets/variables.js';
import {fillCardWithCoin, flatCardList} from '~/data/cards.js';
import {pretty} from '~/assets/utils.js';
import {deepMerge} from '~/assets/utils/collection.js';

/**
 * @template T
 * @typedef {import('vue').Ref} Ref
 */

/** @type {Ref<Array<StakingProgramAddressLock>>} */
const lockList = ref([]);

export default function useStakeByLockList({$td, initFetchAddress}) {
    $td = typeof $td === 'function' ? $td : (val) => val;

    // reduce lock list to on item per coin
    /** @type {ComputedRef<Array<CardListItem>>} */
    const coinLockList = computed(() => {
        const result = {};
        lockList.value.forEach((lockItem) => {
            const isPremium = lockItem.program.id === PREMIUM_STAKE_PROGRAM_ID;
            const coinSymbol = isPremium ? PREMIUM_STAKE_PROGRAM_ID : lockItem.program.lockCoin.symbol;
            if (!result[coinSymbol]) {
                result[coinSymbol] = isPremium ? getEmptyPremiumCard() : getEmptyStakeCard(coinSymbol, lockItem.program.id);
            }
            result[coinSymbol].amount += Number(lockItem.amount);
            if (isPremium) {
                result[coinSymbol].title = 'LEVEL ' + getPremiumLevel(result[coinSymbol].amount);
            } else {
                // use latest program to ensure it is actual (it is fallback if nothing found in card-data)
                result[coinSymbol].programId = Math.max(lockItem.program.id, result[coinSymbol].programId);
                result[coinSymbol].action = `/stake/${result[coinSymbol].programId}`;
            }
        });
        return Object.values(result);
    });

    const premiumCard = computed(() => {
        const found = coinLockList.value.find((item) => item.programId === PREMIUM_STAKE_PROGRAM_ID);
        return prepareStakeCardList([found || getEmptyPremiumCard()])[0];
    });

    function prepareStakeCardList(list) {
        return list
            .map((item) => {
                item = JSON.parse(JSON.stringify(item));
                item.stats.value = pretty(item.amount);
                // get latest actual staking program from card-data
                const cardData = flatCardList.find((data) => data.coin === item.coin && data.actionType === item.actionType);
                if (cardData) {
                    // overwrite action to ensure latest actual
                    item.action = cardData.action;
                    item.description = cardData.description;
                    item.ru = deepMerge(item.ru, cardData.ru);
                }
                return item;
            });
    }

    const fetchLockList = (address) => getAddressLockList(address)
        .then((lockListResult) => {
            lockList.value = Object.freeze(lockListResult);
        });

    /**
     * @param {string|number} coinSymbol
     * @param {number} programId
     * @return {CardListItem}
     */
    function getEmptyStakeCard(coinSymbol, programId) {
        return fillCardWithCoin({
            amount: 0,
            coin: coinSymbol,
            // store previous item programId to compare it later
            programId,
            // dummy action to fill correct actionType
            action: `/stake/${programId}`,
            caption: 'Stake & Earn',
            stats: {
                caption: 'Total staked',
                value: 0,
            },
            ru: {
                caption: 'Стейкинг',
                stats: {
                    caption: 'Общий стейк',
                },
            },
            buttonLabel: $td('Stake more', 'index.stake-more'),
        });
    }
    /**
     * @return {CardListItem}
     */
    function getEmptyPremiumCard() {
        return {
            ...getEmptyStakeCard(PREMIUM_STAKE_PROGRAM_ID, PREMIUM_STAKE_PROGRAM_ID),
            caption: 'Premium',
            title: 'LEVEL 0',
            description: 'Premium is extended account that allows you to get extra rewards without lifting a finger and enjoy additional features.',
            icon: '/img/icon-premium.svg',
            action: `/premium`,
            ru: {
                description: 'Premium – это расширенный аккаунт, который позволит получать дополнительный доход, а также добавит новые функции.',
                caption: 'Premium',
                stats: {
                    caption: 'Общий стейк',
                },
            },
            buttonLabel: $td('Upgrade your level', 'premium.card-update-button'),
        };
    }

    let lockListPromise;
    if (initFetchAddress) {
        lockListPromise = fetchLockList(initFetchAddress);
    }

    return {
        lockListPromise,
        lockList,
        coinLockList,
        premiumCard,
        prepareStakeCardList,
        fetchLockList,
    };
}
