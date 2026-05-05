import js from "@eslint/js";

export default [
  {
    ignores: [
      "node_modules/",
      "dist/",
      ".next/",
      "prisma/",
      "coverage/",
      "*.log",
    ],
  },
  {
    files: ["src/**/*.js", "tests/**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        global: "readonly",
        require: "readonly",
        module: "readonly",
        exports: "readonly",
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      indent: "warn",
      "linebreak-style": "off",
      quotes: ["warn", "single"],
      semi: ["warn", "always"],
    },
  },
];
