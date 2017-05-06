const babel = require('rollup-plugin-babel')
const eslint = require('rollup-plugin-eslint')
const uglify = require('rollup-plugin-uglify')
const author = process.env.AUTHOR || require('../package.json').author
const version = process.env.VERSION || require('../package.json').version

let plugins = [
    babel({
        exclude: 'node_modules/**'
    }),
    // eslint(),
]
if (!process.env.NODE_ENV) {
    plugins.push(uglify())
}

module.exports =  {
    entry: 'src/index.js',
    dest: 'dist/js/eel.js',
    format: 'umd',
    sourceMap: 'inline',
    moduleName: 'eel',
    plugins: plugins,
    banner: 
`/**
 * test v${version}
 * (c) ${new Date().getFullYear()} ${author}
 * @license MIT
 */`
}