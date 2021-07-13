// Custom Jest transform implementation that wraps babel-jest and injects our
// babel presets, so we don't have to use .babelrc.

module.exports = require('babel-jest').createTransformer({
    presets: ["vue-app"],
    // ignore: false, // do nothing, jest's transformIgnorePatterns works instead
});
