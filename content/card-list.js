import cardList from '~/content/card-list-data.js';


for (const categorySlug in cardList) {
    cardList[categorySlug].cards = cardList[categorySlug].cards.map((card) => {
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
            category: categorySlug,
            // extract type from action
            actionType: card.action.replace(/\?.*/, '').split('/').filter((item) => !!item)[0],
        };
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
