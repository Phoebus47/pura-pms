const path = require('path');

module.exports = {
  'apps/web/**/*.{ts,tsx}': (filenames) => {
    const relativeFiles = filenames.map((f) =>
      path.relative('apps/web', f).replace(/\\/g, '/'),
    );
    const commands = filenames.map((f) => `prettier --write "${f}"`);
    const eslintFiles = relativeFiles.map((f) => `"${f}"`).join(' ');
    commands.push(`pnpm --filter web exec -- eslint --fix ${eslintFiles}`);
    return commands;
  },
  'apps/api/**/*.{ts,tsx}': (filenames) => {
    const relativeFiles = filenames.map((f) =>
      path.relative('apps/api', f).replace(/\\/g, '/'),
    );
    const commands = filenames.map((f) => `prettier --write "${f}"`);
    const eslintFiles = relativeFiles.map((f) => `"${f}"`).join(' ');
    commands.push(`pnpm --filter api exec -- eslint --fix ${eslintFiles}`);
    return commands;
  },
  '*.{ts,tsx}': (filenames) => {
    return filenames.map((f) => `prettier --write "${f}"`);
  },
  '*.{json,md,yml,yaml}': (filenames) => {
    return filenames.map((f) => `prettier --write "${f}"`);
  },
};
