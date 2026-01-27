import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,

  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-console": "off",
      "no-unused-vars": "warn",
      eqeqeq: "error", // Enforces strict equality (===)
    },
  },
];

// npx eslint .            // Check your project files for showing warining/errors
// npx eslint . --fix      // Fix errors automatically if possible

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// .prettierrc.js
// export default {
//   semi: true,           // add semicolons
//   singleQuote: false,   // use double quotes
//   tabWidth: 2,          // 2-space indentation
//   trailingComma: "es5", // Trailing commas only in arrays and objects, not in functions, backward support
//   endOfLine: "lf"       // consistent LF line endings
// };

//   trailingComma: "all", // Trailing commas only in arrays, objects and also functions for modern JS.
// endOfLine: "lf" tells Prettier to use LF (\n) at the end of every line.
// It solves Git diff and OS inconsistency problems by making line endings the same on Windows, macOS, and Linux.
// This keeps your code clean, consistent, and portable across all environments.

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// // Import ESLint's recommended JavaScript rules
// import js from "@eslint/js";

// // Import predefined global variables (Node.js, browser, etc.)
// import globals from "globals";

// // Export ESLint flat config (ESLint v9+ style)
// export default [
//   // Base recommended rules from ESLint
//   js.configs.recommended,

//   {
//     // Apply this config to all JavaScript files
//     files: ["**/*.js"],

//     // Language and environment settings
//     languageOptions: {
//       // Allow modern JavaScript syntax up to ES2021
//       ecmaVersion: 2021,

//       // Treat files as ES Modules (import/export)
//       sourceType: "module",

//       // Enable Node.js global variables (process, __dirname, etc.)
//       globals: {
//         ...globals.node,
//       },
//     },

//     // Custom rule overrides
//     rules: {
//       // Allow console.log (useful for backend / debugging)
//       "no-console": "off",

//       // Enforce 2-space indentation
//       "indent": ["error", 2],

//       // Enforce double quotes for strings
//       "quotes": ["error", "double"],

//       // Require semicolons at the end of statements
//       "semi": ["error", "always"],

//       // Warn (not error) about unused variables
//       "no-unused-vars": "warn",
//     },
//   },
// ];
