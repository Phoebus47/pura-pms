# Commit message format (Husky / Commitlint)

When **generating or suggesting commit messages** in Source Control, use the format validated by this repo's Commitlint (see `commitlint.config.cjs` and `.husky/commit-msg`).

## Rules (must pass commitlint)

- **Format:** `type(scope): subject` or `type: subject`
- **Type:** One of: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci` (lower-case only)
- **Scope:** Optional, lower-case (e.g. `navbar`, `hero`)
- **Subject:** Required, no period at end, concise imperative
- **Header max length:** 100 characters

## Examples

- `feat: add product search`
- `fix(navbar): close mobile menu on route change`
- `docs: update README`
- `chore: update dependencies`

Do not use types outside the list (e.g. no `add`, `update` as type). Do not use uppercase or a period at the end of the subject.
