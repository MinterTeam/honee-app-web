import cardList from '~/content/card-list-data.js';

/**
 * Fill omitted card properties (title, icon, tags) with data from 'coin' property
 * Extract 'actionType' from 'action'
 * @param {CardListItemRaw} card
 * @param {string} [category]
 * @return {CardListItem}
 */
export function fillCardWithCoin(card, category) {
    // title from coin
    if (!card.title && card.coin) {
        card.title = Array.isArray(card.coin) ? card.coin.join(' / ') : card.coin;
    }
    // icon from coin
    if (!card.icon && card.coin) {
        card.icon = card.coin;
    }
    return {
        ...card,
        // add coins to tags
        tags: card.coin ? (card.tags || []).concat(card.coin) : card.tags,
        // expose category
        category,
        // extract type from action
        actionType: card.action.replace(/\?.*/, '').split('/').filter((item) => !!item)[0],
    };
}

for (const categorySlug in cardList) {
    cardList[categorySlug].cards = cardList[categorySlug].cards.map((card) => {
        return fillCardWithCoin(card, categorySlug);
    });
}
const {swap, ...cardListWithoutSwap} = cardList;
/**
 * @type {CardCategoryMap}
 */
export default cardListWithoutSwap;
/**
 * @type {Array<CardListItem>}
 */
export const flatCardList = [].concat(...Object.values(cardList).map((category) => category.cards));
