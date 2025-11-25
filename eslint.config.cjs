const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  {
    files: ["**/*.{js,cjs}"],
    ...js.configs.recommended,

    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },

    rules: {
      "no-console": "off",
      semi: ["error", "always"],
      "eol-last": ["error", "always"],
      indent: ["error", 2, { SwitchCase: 1 }],
      camelcase: ["error", { properties: "never", ignoreDestructuring: true, allow: ["is_delete"] }],
      "import/no-extraneous-dependencies": "off",
      "max-len": [
        "error",
        {
          code: 155,
          ignoreComments: true,
          ignoreUrls: true,
          ignoreTemplateLiterals: true,
        },
      ],
      "no-underscore-dangle": [
        "error",
        {
          allow: ["_export", "_directories", "is_delete"],
          allowAfterThis: true,
        },
      ],
      "no-trailing-spaces": ["error"],
      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1 }],
      "comma-dangle": ["error", "always-multiline"],

      "no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "all",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
];
