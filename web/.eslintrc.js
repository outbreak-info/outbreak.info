module.exports = {
  root: true,

  env: {
    node: true,
  },

  extends: ['plugin:vue/recommended', 'eslint:recommended', 'prettier'],

  parserOptions: {
    parser: '@babel/eslint-parser',
  },

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

  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
};
