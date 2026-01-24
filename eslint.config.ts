import typescriptPlugin from "@typescript-eslint/eslint-plugin";

import typescriptParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier";
import type eslint from "eslint";

export const eslintConfig: eslint.Linter.Config[] = [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "**/.vscode/**",
      "**/.idea/**",
      "**/pnpm-lock.yaml",
      "**/package-lock.json",
      "**/yarn.lock",
    ],
  },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        project: ["./tsconfig.json", "./packages/*/tsconfig.json"],
      },
      globals: {
        node: "readonly",
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        exports: "writable",
        module: "writable",
        require: "readonly",
      },
    },
    plugins: {
      //@ts-expect-error
      "@typescript-eslint": typescriptPlugin,
      import: importPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // Prettier integration
      "prettier/prettier": "error",

      // TypeScript specific rules
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/prefer-as-const": "error",
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/consistent-type-exports": "error",

      // Import rules (Airbnb-style)
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import/prefer-default-export": "off",
      "import/extensions": [
        "error",
        "ignorePackages",
        {
          ts: "never",
          tsx: "never",
          js: "always",
          jsx: "never",
        },
      ],
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: [
            "**/*.test.ts",
            "**/*.spec.ts",
            "**/*.config.ts",
            "**/*.config.js",
            "**/test/**",
          ],
        },
      ],
      "import/no-duplicates": "error",
      "import/no-self-import": "error",
      "import/no-cycle": "error",
      "import/no-useless-path-segments": "error",
      "import/first": "error",
      "import/exports-last": "error",
      "import/newline-after-import": "error",
      "import/no-absolute-path": "error",
      "import/no-mutable-exports": "error",

      // Coding standards from copilot-instructions (Airbnb-style)
      "no-console": "error",
      "prefer-const": "error",
      "prefer-arrow-callback": "error",
      "prefer-template": "error",
      "prefer-destructuring": ["error", { object: true, array: false }],
      eqeqeq: ["error", "always"],
      "no-eq-null": "error",
      "prefer-promise-reject-errors": "error",
      "no-return-await": "error",

      // Variable declarations
      "no-var": "error",
      "one-var": ["error", "never"],
      "no-undef-init": "error",
      "no-unused-vars": "off", // Use TypeScript version instead

      // Functions
      "func-style": ["error", "expression"],
      "arrow-body-style": ["error", "as-needed"],
      "arrow-parens": ["error", "as-needed"],
      "arrow-spacing": "error",
      "no-confusing-arrow": "error",

      // Objects
      "object-shorthand": "error",
      "prefer-object-spread": "error",
      "object-curly-spacing": ["error", "always"],
      "dot-notation": "error",
      "quote-props": ["error", "as-needed"],

      // Arrays
      "array-bracket-spacing": ["error", "never"],
      "prefer-spread": "error",

      // Strings
      quotes: ["error", "single", { avoidEscape: true }],
      "no-useless-concat": "error",

      // Naming conventions
      camelcase: ["error", { properties: "never" }],
      "no-underscore-dangle": "off",

      // Control flow
      "no-else-return": "error",
      "no-lonely-if": "error",
      "no-unneeded-ternary": "error",
      "no-nested-ternary": "error",

      // Semicolons and commas
      semi: ["error", "always"],
      "comma-dangle": ["error", "always-multiline"],
      "comma-spacing": "error",
      "comma-style": "error",

      // Whitespace
      indent: ["error", 2],
      tabWidth: 2,
      "no-mixed-spaces-and-tabs": "warn",
      tabIndent: "warn",

      "key-spacing": "error",
      "keyword-spacing": "error",
      "space-before-blocks": "error",
      "space-before-function-paren": [
        "error",
        {
          anonymous: "always",
          named: "never",
          asyncArrow: "always",
        },
      ],
      "space-in-parens": "error",
      "space-infix-ops": "error",
      "space-unary-ops": "error",
      "spaced-comment": ["error", "always"],

      // ES6+ features
      "prefer-rest-params": "error",
      "prefer-numeric-literals": "error",
      "prefer-regex-literals": "error",
      "symbol-description": "error",
      "no-useless-computed-key": "error",
      "no-useless-constructor": "error",
      "no-useless-rename": "error",

      // Error prevention
      "no-duplicate-imports": "error",
      "no-new-symbol": "error",
      "no-this-before-super": "error",
      "constructor-super": "error",
      "no-const-assign": "error",
      "no-class-assign": "error",
      "no-dupe-class-members": "error",

      // Best practices
      "no-param-reassign": "error",
      "no-plusplus": ["error", { allowForLoopAfterthoughts: true }],
      "no-continue": "error",
      "consistent-return": "error",
      "default-case": "error",
      "no-case-declarations": "error",
      "no-multi-spaces": "error",
      "no-multiple-empty-lines": ["error", { max: 2, maxBOF: 0, maxEOF: 1 }],
      "no-trailing-spaces": "error",
      "eol-last": "error",

      // Complexity
      complexity: ["warn", 10],
      "max-depth": ["warn", 4],
      "max-lines": ["warn", 300],
      "max-params": ["warn", 4],
    },
  },
  {
    files: ["**/*.test.ts", "**/*.spec.ts"],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        before: "readonly",
        after: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
      "import/no-extraneous-dependencies": "off",
      "func-style": "off",
      "prefer-arrow-callback": "off",
      "max-lines": "off",
      "no-unused-expressions": "off",
    },
  },
  prettierConfig,
];
