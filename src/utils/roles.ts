/** Roles that can access the admin dashboard and admin APIs (client-side check). */
export function isAdminPanelRole(role: string | undefined): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN'
}

/**
 * SUPER_ADMIN and ADMIN use the same admin panel — show one label in the UI.
 */
export function formatUserRoleLabel(role: string | undefined): string {
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') return 'Admin panel'
  if (role === 'STUDENT') return 'Student'
  return role ?? '—'
}
