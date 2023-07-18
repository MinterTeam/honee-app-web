const esModules = [
    'date-fns',
    'lodash-es',
    '@babel/runtime',
    'axios-extensions',
    'axios',
    'camelcase-keys',
    'camelcase',
    'quick-lru',
].join('|');

export default {
    moduleNameMapper: {
        '~(.*)$': '<rootDir>/$1',
        'axios/lib/adapters/adapters.js': '<rootDir>/node_modules/axios/lib/adapters/adapters.js',
    },
    transform: {
        '^.+\\.jsx?$': '<rootDir>/jest-babel.config.js',
    },
    transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
    // testEnvironment: 'node',
    // collectCoverage: true,
    // collectCoverageFrom: ["./src/**"],
    // coverageReporters: ["lcov", "text"]
};
