module.exports = {
  parser: 'vue-eslint-parser',
  parserOptions: {
    // project: 'tsconfig.json',
    // tsconfigRootDir: __dirname,
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:vue/vue3-essential',
  ],
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  // ignorePatterns: [".eslintrc.js"],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
}
