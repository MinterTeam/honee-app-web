module.exports = {
    "moduleNameMapper": {
        "~(.*)$": "<rootDir>/$1",
        // "^vue$": "vue/dist/vue.common.js"
    },
    transform: { '^.+\\.js$': '<rootDir>/jest-babel.config.js' },
    "transformIgnorePatterns": [
        "node_modules/(?!(lodash-es|date-fns)/)",
    ],
};
