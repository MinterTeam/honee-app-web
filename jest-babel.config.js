// Custom Jest transform implementation that wraps babel-jest and injects our
// babel presets, so we don't have to use .babelrc.

import babelJest from 'babel-jest';
const createTransformer = babelJest.createTransformer || babelJest.default.createTransformer;
export default createTransformer({
    babelrc: false,
    "presets": ["@babel/preset-env"],
    // ignore: false, // do nothing, jest's transformIgnorePatterns works instead
});
