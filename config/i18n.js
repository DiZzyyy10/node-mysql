const i18n = require('i18n');
const path = require('path');

// Configure i18n
i18n.configure({
  locales: ['en', 'ja'],
  defaultLocale: 'en',
  directory: path.join(__dirname, '../locales'),
  objectNotation: true,
  updateFiles: false,
  api: {
    '__': '__',
    '__n': '__n'
  },
  register: global
});

module.exports = i18n;
