/**
 * The authRoles object defines the authorization roles for the Fuse application.
 */
const authRoles = {
  /**
   * The admin role grants access to users with the 'admin' role.
   */
  admin: ['admin'],

  /**
   * The staff role grants access to users with the 'admin' or 'staff' role.
   */
  staff: ['admin', 'staff'],

  /**
   * The user role grants access to users with the  or 'user' role.
   */
  user: ['user'],

  /**
   * The collaborator role grants access to users with the  'user' or 'collaborator' role.
   */
  collaborator: ['user', 'collaborator'],

  /**
   * The onlyGuest role grants access to unauthenticated users.
   */
  onlyGuest: [],
};

export default authRoles;
