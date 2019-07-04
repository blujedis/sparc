const {
  override,
} = require('customize-cra');

const isBrowser = process.env.BROWSER !== 'none';

const plugin = () => config => {
  if (!isBrowser)
    config.target = 'electron-renderer';
  return config;
}

module.exports = override(
  plugin()
);
