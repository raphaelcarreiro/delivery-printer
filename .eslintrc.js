module.exports = {
  extends: ['erb/typescript', 'prettier', 'plugin:prettier/recommended'],
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'prettier/prettier': 'error',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'react/prop-types': 'off',
    'promise/catch-or-return': 'off',
    'import/no-cycle': 'off',
    'react/jsx-props-no-spreading': 'off',
    'promise/always-return': 'off',
    'no-console': 'off',
    'no-nested-ternary': 'off',
    'react/jsx-filename-extension': [
      1,
      { extensions: ['.js', '.jsx', 'ts', 'tsx'] },
    ],
    'consistent-return': 'off',
    'react/jsx-wrap-multilines': 'off',
    'react/jsx-one-expression-per-line': 'off',
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  plugins: ['prettier'],
  settings: {
    'import/resolver': {
      node: {},
      webpack: {
        config: require.resolve('./configs/webpack.config.eslint.js'),
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
};
