export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // type must be one of these
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'chore',
        'docs',
        'test',
        'style',
        'refactor',
        'hotfix',
        'revert',
      ],
    ],
    // scope must match your module names
    'scope-enum': [
      2,
      'always',
      [
        'auth',
        'users',
        'products',
        'orders',
        'payments',
        'categories',
        'coupons',
        'inventory',
        'reviews',
        'carts',
        'wishlists',
        'addresses',
        'otp',
        'mail',
        'roles',
        'common',
        'config',
        'docker',
        'deps',
        'api',
      ],
    ],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],           // subject cannot be empty
    'subject-full-stop': [2, 'never', '.'],  // no period at end
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'header-max-length': [2, 'always', 72],  // max 72 chars
  },
};
