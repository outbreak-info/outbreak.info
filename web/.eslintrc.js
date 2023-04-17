module.exports = {
  root: true,
  env: {
    es2021: true,
  },
  extends: ['plugin:vue/vue3-recommended', 'eslint:recommended', 'prettier'],
  parser: 'vue-eslint-parser',
  rules: {
    'no-unused-vars': 'off',
    'no-undef': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/no-reserved-component-names': 'off',
    'vue/no-mutating-props': 'off',
    'vue/attribute-hyphenation': 'off',
    'vue/attributes-order': 'off',
    'vue/require-default-prop': 'off',
    'vue/prop-name-casing': 'off',
    'vue/no-v-html': 'off',
    'vue/no-lone-template': 'off',
    'vue/no-template-shadow': 'off',
    'vue/component-definition-name-casing': 'off',
  },
};
