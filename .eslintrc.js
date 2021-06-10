module.exports = {
  extends: [
    'eslint-config-qiwi',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'camelcase': 'off',
    'unicorn/no-null': 'off',
    'unicorn/consistent-function-scoping': 'off'
  }
};
