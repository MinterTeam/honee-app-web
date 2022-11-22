const esModules = ['date-fns'].join('|');

export default {
    moduleNameMapper: {
        '~(.*)$': '<rootDir>/$1',
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
