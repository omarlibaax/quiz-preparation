/** Roles that can access the admin dashboard and admin APIs (client-side check). */
export function isAdminPanelRole(role: string | undefined): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN'
}
