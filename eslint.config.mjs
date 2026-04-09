import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["./packs/data/scripts/**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: globals.browser
    },
    settings: {
      "import/resolver": {}
    },
    rules: {
      "no-unused-labels": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn", // or "error" based on your preference
        {
          args: "after-used", // Only check unused arguments that appear after used ones
          argsIgnorePattern: "^_", // Ignore parameters prefixed with `_`
          varsIgnorePattern: "^_", // Ignore variables prefixed with `_`
          caughtErrorsIgnorePattern: "^_" // Ignore caught errors prefixed with `_`
        }
      ]
    },
  }
];
