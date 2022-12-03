/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  moduleNameMapper: {
    '^\\(SRC\\)/(.*)$': '<rootDir>/src/$1'
  },
  roots: ['src', 'tests'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.js$': 'babel-jest'
  },
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.test.ts'
  ]
};
