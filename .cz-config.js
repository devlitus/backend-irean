module.exports = {
  types: [
    { value: 'feat', name: 'feat:     A new feature' },
    { value: 'fix', name: 'fix:      A bug fix' },
    { value: 'docs', name: 'docs:     Documentation only changes' },
    {
      value: 'style',
      name: 'style:    Changes that do not affect the meaning of the code\n            (white-space, formatting, missing semi-colons, etc)',
    },
    {
      value: 'refactor',
      name: 'refactor: A code change that neither fixes a bug nor adds a feature',
    },
    {
      value: 'perf',
      name: 'perf:     A code change that improves performance',
    },
    { value: 'test', name: 'test:     Adding missing tests or correcting existing tests' },
    {
      value: 'chore',
      name: "chore:    Other changes that don't modify src or test files",
    },
    { value: 'ci', name: 'ci:       Changes to our CI/CD configuration files and scripts' },
    { value: 'revert', name: 'revert:   Revert to a commit' },
  ],

  scopes: [
    'api',
    'auth',
    'database',
    'config',
    'docs',
    'scripts',
    'deps',
    'types',
  ],

  scopeOverrides: {
    fix: [
      { name: 'merge' },
      { name: 'style' },
      { name: 'e2eTest' },
      { name: 'unitTest' },
    ],
  },

  allowTicketNumber: false,
  isTicketNumberRequired: false,
  ticketNumberPrefix: 'TICKET-',
  ticketNumberRegex: /^\d{1,5}$/,

  // it needs to match the value for field type 'fix' and 'feat'
  scopePrompt: 'Select a scope this change affects (optional):',

  messages: {
    customScope: 'Denote the SCOPE of this change (optional):',
    type: "Select the type of change that you're committing:",
    scope: '\nDenote the SCOPE of this change (optional):',
    customScope: 'Denote the SCOPE of this change:',
    subject: 'Write a SHORT, imperative tense description of the change:\n',
    body: 'Provide a LONGER description of the change (optional). Use "|" to break new line:\n',
    breaking: 'List any BREAKING CHANGES (optional). Use "|" to break new line:\n',
    footer: 'List any ISSUES CLOSED by this change (optional). E.g.: #31, #34:\n',
    confirmCommit: 'Are you sure you want to proceed with the commit above?',
  },

  allowCustomScopes: true,
  allowBreakingChanges: ['feat', 'fix'],
  // limit subject length
  subjectLimit: 100,

  // breaklineChar: '|', // It is supported for fields body and footer.
  // footerPrefix : 'ISSUES CLOSED:'
  // askForBreakingChangeFirst : true, // default is false
};
