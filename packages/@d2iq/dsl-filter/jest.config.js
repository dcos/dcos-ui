module.exports = {
  verbose: true,
  testURL: "http://localhost/",
  globals: {
    __DEV__: true,
    "ts-jest": {
      useBabelrc: true
    }
  },
  transform: {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.tsx?$": "ts-jest"
  },
  testRegex: "/__tests__/.*\\-test\\.(js|ts)$",
  moduleFileExtensions: ["js", "json", "ts", "tsx"],
  modulePathIgnorePatterns: ["/tmp/", "/node_modules/", "/.module-cache/"],
  timers: "fake",
  coverageReporters: ["json", "lcov", "cobertura", "text"],
  testPathIgnorePatterns: ["/tmp/", "/node_modules/"]
};
