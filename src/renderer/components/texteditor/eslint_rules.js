import rulesBestPractices from "eslint-config-airbnb-base/rules/best-practices";
import rulesBestErrors from "eslint-config-airbnb-base/rules/errors";
import rulesBestStyle from "eslint-config-airbnb-base/rules/style";
import rulesBestVariables from "eslint-config-airbnb-base/rules/variables";
import rulesBestEs6 from "eslint-config-airbnb-base/rules/es6";

export default {
  root: true,
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    es6: true
  },
  rules: {
    ...rulesBestPractices.rules,
    ...rulesBestErrors.rules,
    ...rulesBestStyle.rules,
    ...rulesBestVariables.rules,
    ...rulesBestEs6.rules,

    indent: [
      "error",
      2,
      {
        SwitchCase: 1,
        VariableDeclarator: 1,
        outerIIFEBody: 1,
        FunctionDeclaration: {
          parameters: 1,
          body: 1
        },
        FunctionExpression: {
          parameters: 1,
          body: 1
        },
        CallExpression: {
          arguments: 1
        },
        ArrayExpression: 1,
        ObjectExpression: 1,
        ImportDeclaration: 1,
        flatTernaryExpressions: false,
        ignoredNodes: [
          "JSXElement",
          "JSXElement > *",
          "JSXAttribute",
          "JSXIdentifier",
          "JSXNamespacedName",
          "JSXMemberExpression",
          "JSXSpreadAttribute",
          "JSXExpressionContainer",
          "JSXOpeningElement",
          "JSXClosingElement",
          "JSXText",
          "JSXEmptyExpression",
          "JSXSpreadChild"
        ],
        ignoreComments: false
      }
    ],
    semi: ["error", "never"],
    "comma-dangle": ["error", "never"],
    quotes: [1, "single", "avoid-escape"],
    "class-methods-use-this": 0,
    "prefer-destructuring": [
      "error",
      {
        object: true,
        array: false
      }
    ]
  }
};
