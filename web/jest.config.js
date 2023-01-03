module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  collectCoverage: true,
  collectCoverageFrom: ['/src/**/*.vue'],
  transformIgnorePatterns: ['!node_modules/'],
};
