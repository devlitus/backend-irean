# Automated Commits by Convention

You are helping the user commit all staged and unstaged changes to the repository, organizing them by Conventional Commits standards.

## Task

1. **View current state**: Run `git status` and `git diff` to see what has changed
2. **Analyze changes**: Group files by type of change:
   - **feat**: New features
   - **fix**: Bug fixes
   - **docs**: Documentation changes
   - **refactor**: Code refactoring
   - **style**: Formatting/styling (no logic)
   - **test**: Test files
   - **chore**: Dependencies, config, maintenance
   - **perf**: Performance improvements
   - **ci**: CI/CD changes

3. **Make commits**: For each group of changes:
   ```bash
   git add <specific-files>
   git commit -m "type(scope): description"
   ```

   Examples:
   - `feat(api): add new product endpoint`
   - `fix(database): resolve connection pooling issue`
   - `docs(readme): update installation instructions`
   - `chore(deps): update strapi to v5.26.0`

4. **Push to repository**:
   ```bash
   git push origin <current-branch>
   ```

## Rules

- Make **separate commits** for different types of changes
- Keep each commit focused on one thing
- Use lowercase for type and subject
- Maximum 100 characters for commit message
- No period at the end of subject
- Scope is optional but recommended when relevant

## Default Scope Suggestions

- `api` - API endpoints, controllers
- `auth` - Authentication
- `database` - Database, schemas
- `config` - Configuration files
- `docs` - Documentation
- `scripts` - Utility scripts
- `deps` - Dependencies

## Report

After pushing, show the user:
1. ✅ Number of commits created
2. ✅ List of commit messages
3. ✅ Current branch status (ahead/behind)
4. ✅ Confirmation that push was successful
