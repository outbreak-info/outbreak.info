module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/recommended', 'eslint:recommended', 'prettier'],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'no-unused-vars': 'off',
    'no-undef': 'off',
  },
};
