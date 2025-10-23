# Commit Conventions Guide

This project uses **Conventional Commits** with Husky + Commitlint validation.

## Quick Start

```bash
npm run commit
# or
git commit -m "type(scope): subject"
```

## Commit Format

```
<type>(<scope>): <subject>
```

## Types

- **feat** - A new feature
- **fix** - A bug fix
- **docs** - Documentation only changes
- **style** - Format/styling (no code logic changes)
- **refactor** - Code refactoring (no feature/bug changes)
- **perf** - Performance improvements
- **test** - Adding or updating tests
- **chore** - Maintenance tasks, dependencies
- **ci** - CI/CD configuration changes
- **revert** - Reverting a previous commit

## Scopes (Optional)

- `api` - API layer changes
- `auth` - Authentication related
- `database` - Database changes
- `config` - Configuration files
- `docs` - Documentation
- `scripts` - Utility scripts
- `deps` - Dependencies
- `types` - Type definitions

## Examples

```bash
# Feature with scope
feat(api): add JWT token refresh endpoint

# Bug fix with scope
fix(database): resolve connection pooling issue

# Documentation
docs(readme): update installation instructions

# Chore/refactor
chore(deps): update strapi to v5.26.0
refactor(api): simplify product controller logic
```

## Rules

- ✅ Type must be lowercase
- ✅ Subject must start with lowercase
- ✅ No period at end of subject
- ✅ Maximum 100 characters for header
- ✅ Empty type/subject not allowed
- ❌ Commits that don't follow format will be rejected by Husky

## Interactive Commit (Recommended)

```bash
npm run commit
```

This guides you through:
1. Select commit type
2. Select scope (optional)
3. Write subject
4. Add optional body
5. Add optional breaking changes
6. Confirm

## Verify Commit Format

```bash
npm run commit:check
```

## References

- Full guide: `.github/copilot-instructions.md` → "Commit Conventions" section
- Conventional Commits spec: https://www.conventionalcommits.org/
