/**
 * Role utility helpers.
 * The backend may return either 'advocate' or 'lawyer_advisor' for advocate accounts.
 * All role-checks MUST go through these helpers - never compare role strings directly.
 */

/** True for both 'advocate' and 'lawyer_advisor' backend role values. */
export function isAdvocate(role) {
  return role === 'advocate' || role === 'lawyer_advisor';
}

/** True for the citizen role. */
export function isCitizen(role) {
  return role === 'citizen';
}

/** True for the admin role. */
export function isAdmin(role) {
  return role === 'admin';
}

/**
 * Returns the display badge label for a role.
 * Never defaults a missing role to CITIZEN.
 */
export function getRoleBadge(role) {
  if (isAdvocate(role)) return 'ADVOCATE';
  if (isAdmin(role)) return 'ADMIN';
  if (isCitizen(role)) return 'CITIZEN';
  return null;
}

/**
 * Returns the home/dashboard route for a given role.
 */
export function getHomeRoute(role) {
  if (isAdvocate(role)) return '/advocate/dashboard';
  if (isAdmin(role)) return '/admin';
  return '/dashboard';
}
