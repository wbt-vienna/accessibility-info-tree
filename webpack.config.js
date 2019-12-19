var path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = env => {
    var baseDir = '';
    var buildDir = 'app/build/';
    var entryScript = './src/js/mainScript.js';
    var outputFilename = 'a11y-info-tree.bundle.js';
    var mode = env && env.production ? 'production' : 'development';

    var scssRule = {
        test: /\.(s*)css$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
    };

    var vueRule = {
        test: /\.vue$/,
        loader: 'vue-loader'
    };

    var babelRule = {
        test: /\.m?js$/,
        use: {
            loader: 'babel-loader',
            options: {
                presets: [
                    ['env', {
                        modules: false,
                        useBuiltIns: true,
                        targets: {
                            browsers: [
                                '> 1%',
                                'last 2 versions',
                                'Firefox ESR',
                                'ie >= 11'
                            ],
                        },
                    }],
                ],
            },
        },
    };

    var resolve = {
        alias: {
            vue: 'vue/dist/vue.esm.js'
        }
    };

    var plugins = [new VueLoaderPlugin()];

    function getDevServer() {
        return {
            contentBase: path.resolve(__dirname),
            publicPath:  '/' + buildDir,
            host: '0.0.0.0',
            port: 9095,
            open: false,
            watchContentBase: true
        };
    }
    
    return {
        mode: mode,
        entry: entryScript,
        plugins: plugins,
        output: {
            path: path.resolve(__dirname, baseDir + buildDir),
            publicPath: "/" + buildDir,
            filename: outputFilename
        },
        resolve: resolve,
        devServer: getDevServer(),
        module: {
            rules: [/*babelRule, TODO: fix*/ scssRule, vueRule],
        }
    };
};