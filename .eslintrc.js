module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parserOptions": {
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 2018
  },
  "plugins": [

  ],
  "rules": {
    "no-unused-vars": "off",
    "no-console": "off",
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": "off",
    "semi": [
      "error",
      "always"
    ]
  }
};
