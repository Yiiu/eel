module.exports = {
  root: true,
  parser: 'babel-eslint',
  'rules': {
    // allow paren-less arrow functions
    'indent': [2, 4, { 'SwitchCase': 1 }],
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  },
  // add your custom rules here
  parserOptions: {
    sourceType: 'module'
  }
}