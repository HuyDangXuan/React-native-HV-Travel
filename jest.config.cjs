module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.cjs"],
  testPathIgnorePatterns: ["/node_modules/", "/.test-dist/"],
  clearMocks: true,
};
