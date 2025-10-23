# Automated Commits and Pull Request by Convention

You are helping the user commit all staged and unstaged changes to the repository, organizing them by Conventional Commits standards, and optionally create a pull request.

## Task

### Part 1: Commits

1. **View current state**: Run `git status`, `git diff`, and `git log` to see what has changed
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

### Part 2: Pull Request (Optional)

If user requests PR creation with `--pr` flag or confirms they want to create one:

1. **Check branch**: Ensure not on `main` branch
2. **Gather commit info**:
   - Get all commits since branch point: `git log main..HEAD --oneline`
   - Analyze commit types and scopes

3. **Generate PR metadata**:
   - **Title**: Follow Conventional Commits (primary type + scope)
     - Examples:
       - `feat(api): add product filtering and sorting`
       - `fix(auth): resolve JWT token expiration`
       - `refactor(database): improve query performance`

   - **Body**: Markdown structured format:
     ```markdown
     ## Summary
     - Brief bullet points (2-4) of what changed and why

     ## Type of Change
     - [x] feat - New feature
     - [ ] fix - Bug fix
     - [ ] refactor - Code refactoring
     - [ ] docs - Documentation
     - [ ] test - Test changes
     - [ ] chore - Maintenance
     - [ ] perf - Performance improvement
     - [ ] ci - CI/CD changes

     ## Test Plan
     - How changes were tested
     - Manual testing steps if applicable
     - Related API endpoints or features tested

     ## Checklist
     - [x] Code follows project conventions
     - [x] Types have been generated (if applicable)
     - [x] Changes are tested
     - [ ] Documentation updated (if needed)
     - [ ] No breaking changes

     ## Related Issues
     - Link to issues or PRs (if any)
     ```

4. **Create PR**:
   ```bash
   gh pr create --base main --title "Your Title" --body "Your body"
   ```

## Rules

**Commits**:
- Make **separate commits** for different types of changes
- Keep each commit focused on one thing
- Use lowercase for type and subject
- Maximum 100 characters for commit message
- No period at the end of subject
- Scope is optional but recommended when relevant

**Pull Request**:
- Only on feature branches (not main)
- Base branch always `main`
- Title follows Conventional Commits
- Include meaningful summary and test plan
- Mark checklist items appropriately
- Never include sensitive information in PR body

## Default Scope Suggestions

- `api` - API endpoints, controllers
- `auth` - Authentication
- `database` - Database, schemas
- `config` - Configuration files
- `docs` - Documentation
- `scripts` - Utility scripts
- `deps` - Dependencies

## Usage Examples

### Just commits:
```
/commit
```

### Commits + create PR:
```
/commit --pr
```

## Report

After completing commits, show the user:
1. ✅ Number of commits created
2. ✅ List of commit messages
3. ✅ Current branch status (ahead/behind)
4. ✅ Confirmation that push was successful

If PR is created, additionally show:
1. ✅ PR URL
2. ✅ PR number
3. ✅ PR title and branch info
4. ✅ Link to view/review PR
