module.exports = {
  env: {
    node: true
  },
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true
  },
  plugins: ['prettier', '@typescript-eslint', 'unused-imports', 'simple-import-sort'],
  extends: [
    'eslint:recommended',
    'prettier',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:playwright/playwright-test'
  ],
  rules: {
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-explicit-any': ['warn'],
    'simple-import-sort/exports': 'error',
    'simple-import-sort/imports': 'error',
    'no-unused-vars': 'off',
    'no-empty-pattern': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'error',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_'
      }
    ]
  }
};
