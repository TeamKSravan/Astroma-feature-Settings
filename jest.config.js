const { transform } = require("typescript");

module.exports = {
  preset: "react-native",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  setupFilesAfterEnv: ["./jest-setup.ts"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|react-native-reanimated|react-native-gesture-handler|react-native-safe-area-context|react-native-screens|react-native-webview|react-native-svg|react-native-vector-icons|react-native-tab-view|react-native-pager-view|react-native-modal|react-native-date-picker|react-native-iap|react-native-nitro-modules|@react-native-async-storage/async-storage)",
  ],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  testPathIgnorePatterns: ["/node_modules/", "/android/", "/ios/"],

  moduleNameMapper: {
    "\\.svg$": "<rootDir>/__mocks__/svgMock.tsx",
    "react-native-responsive-fontsize": "<rootDir>/__mocks__/react-native-responsive-fontsize.tsx",
  },
  collectCoverage: true,
  coverageReporters: ["json", "lcov", "text", "clover"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "src/**/*.tsx",
    "!src/**/*.d.ts",
    "!src/**/*.js",
    "!src/**/*.jsx",
    "src/navigation/**/*.ts",
    "src/navigation/**/*.tsx",
  ],
  globals: {
    "ts-jest": {
      babelConfig: true,
      tsconfig: "tsconfig.json",
    },
  },
};
