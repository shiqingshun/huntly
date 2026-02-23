const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    devtool: 'inline-source-map',
    mode: 'development',
    watchOptions: {
        // Use polling for more reliable file change detection
        // This helps on macOS and in some Docker/VM environments
        poll: 500,
        // Ignore node_modules to improve performance
        ignored: /node_modules/,
        // Delay rebuild after the first change (ms)
        aggregateTimeout: 200,
        // Follow symlinks
        followSymlinks: true,
    },
    // Disable filesystem caching to ensure fresh rebuilds
    cache: false,
});