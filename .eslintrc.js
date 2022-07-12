module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
    },
    parserOptions: {
        parser: '@babel/eslint-parser',
        requireConfigFile: false,
    },
    extends: [
        'eslint:recommended',
        // https://github.com/vuejs/eslint-plugin-vue
        'plugin:vue/recommended',
    ],
    // required to lint *.vue files
    plugins: [
        'vue',
    ],
    // add your custom rules here
    rules: {
        'arrow-parens': ["error", "always"],
        'no-unused-vars': 0,
        'no-undef': 0,
        'no-console': 0,
        'no-empty': 0,
        'comma-dangle': ["error", "always-multiline"],
        'comma-spacing': ["error", { "before": false, "after": true }],
        'semi': ["error", "always"],
        'semi-spacing': "error",
        'space-before-function-paren': ["error", {"anonymous": "never", "named": "never", "asyncArrow": "always"}],


        // VUE UNCATEGORIZED
        'vue/html-button-has-type': ['error'],
        "vue/next-tick-style": ["warn", "promise"],
        'vue/no-duplicate-attr-inheritance': ['error'],
        "vue/no-potential-component-option-typo": ["warn"],
        'vue/no-this-in-before-route-enter': 'error',
        "vue/script-indent": ["warn", 4, {
            "baseIndent": 0,
            "switchCase": 1,
            "ignores": [],
        }],
        'vue/v-on-function-call': ["error", "always"],

        // VUE 3 ESSENTIAL
        'vue/no-deprecated-data-object-declaration': 'error',
        'vue/no-deprecated-filter': 'error',
        'vue/no-deprecated-props-default-this': 'error',
        'vue/no-deprecated-router-link-tag-prop': 'error',
        'vue/no-deprecated-scope-attribute': 'error',
        'vue/no-deprecated-slot-attribute': 'error',
        'vue/no-deprecated-slot-scope-attribute': 'error',
        'vue/prefer-import-from-vue': 'error',
        'vue/require-toggle-inside-transition': 'error',

        // VUE STRONGLY-RECOMMENDED
        'vue/html-closing-bracket-spacing': 0,
        'vue/html-indent': ["warn", 4, {
            "attribute": 1,
            "baseIndent": 1,
            "closeBracket": 0,
            "alignAttributesVertically": true,
            // align with default webstorm behavior
            "ignores": ['VElement[name=thead].children', 'VElement[name=tbody].children'],
        }],
        "vue/html-self-closing": ["error", {
            "html": {
                "void": "any",
                "normal": "any",
                "component": "always",
            },
            "svg": "always",
            "math": "always",
        }],
        'vue/max-attributes-per-line': 0,
        'vue/singleline-html-element-content-newline': 0,
        // 'vue/v-bind-style': 0,
        // 'vue/v-on-style': 0,
        'vue/v-slot-style': 0,
        'vue/no-unused-vars': 0,
        // allow `$value`
        'vue/prop-name-casing': ["warn"],
        // allow pages/index.vue
        'vue/multi-word-component-names': 0,

        // VUE 3 STRONGLY RECOMMENDED
        'vue/require-explicit-emits': 'warn',

        // VUE RECOMMENDED
        // undefined prop is okay
        'vue/require-default-prop': 0,
        'vue/no-v-html': 0,
        'vue/attribute-hyphenation': 0,
        "vue/attributes-order": ["warn", {
            "order": [
                "DEFINITION",
                "CONDITIONALS", // v-else before v-for
                "LIST_RENDERING",
                "RENDER_MODIFIERS",
                // "GLOBAL", // allow to be first
                // ["UNIQUE", "SLOT"], // allow ref and v-slot to be first
                "TWO_WAY_BINDING",
                // "OTHER_DIRECTIVES", // allow to be first
                // "OTHER_ATTR", // allow html attributes to be first
                "EVENTS",
                "CONTENT",
            ],
        }],
        "vue/order-in-components": ["error", {
          "order": [
              "el",
              "name",
              "key",
              "parent",
              "functional",
              ["delimiters", "comments"],
              "components", "directives", "filters",
              "extends",
              "mixins",
              ["provide", "inject"],
              // "layout", // allow layout on top
              "scrollToTop",
              "transition",
              "loading",
              "ROUTER_GUARDS",
              "middleware",
              "validate",
              "inheritAttrs",
              "model",
              ["props", "propsData", "emits"],
              "setup",
              "asyncData",
              "data",
              // "fetch", // allow fetch above data
              // "head", // allow head on top
              ["computed", "validations"],
              "watch",
              "watchQuery",
              "LIFECYCLE_HOOKS",
              "methods",
              ["template", "render"],
              "renderError",
          ],
        }],
    },
    "overrides": [
        {
            "files": ["*.vue"],
            "excludedFiles": "*.test.js",
            "rules": {
                'array-bracket-newline': ["error", "consistent"],
                'array-element-newline': ["error", {
                    "ArrayExpression": "consistent",
                }],
            },
        },
    ],
};
