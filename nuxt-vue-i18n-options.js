import langRu, {pluralizationRule as pluralizationRuleRu} from './lang/ru.js';
import langEn from './lang/en.js';

// @see https://github.com/nuxt-modules/i18n/pull/605
export default (context) => {
    return {
        fallbackLocale: 'en',
        pluralizationRules: {
            ru: pluralizationRuleRu,
        },
        messages: {
            ru: langRu,
            en: langEn,
        },
    };
};
