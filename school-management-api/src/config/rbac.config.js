const ROLES = {
  STUDENT: 'Student',
  CUSTOMER_SERVICE: 'CustomerService',
  OPERATIONS_MANAGER: 'OperationsManager',
  ADMIN: 'Admin',
  CEO: 'CEO',
};

const PERMISSIONS = {
  [ROLES.STUDENT]: {
    students: ['read_own', 'update_own'],
    payments: ['create'],
    memberships: ['read_own'],
    complaints: ['own'],
    users: ['read_own', 'update_own'],
  },
  [ROLES.CUSTOMER_SERVICE]: {
    students: ['read'],
    payments: ['approve', 'read'],
    memberships: ['update', 'read'],
    complaints: ['manage'],
    users: ['read'],
  },
  [ROLES.OPERATIONS_MANAGER]: {
    students: ['read'],
    payments: ['read'],
    memberships: ['read'],
    complaints: ['manage'],
    users: ['read'],
  },
  [ROLES.ADMIN]: {
    students: ['create', 'read', 'update', 'delete'], // CRUD
    payments: ['create', 'read', 'update', 'delete'], // CRUD
    memberships: ['create', 'read', 'update', 'delete'], // CRUD
    complaints: ['create', 'read', 'update', 'delete'], // CRUD
    users: ['create', 'read', 'update', 'delete'], // CRUD
  },
  [ROLES.CEO]: {
    students: ['*'], // Full
    payments: ['*'], // Full
    memberships: ['*'], // Full
    complaints: ['*'], // Full
    users: ['*'], // Full
  },
};

module.exports = { ROLES, PERMISSIONS };
