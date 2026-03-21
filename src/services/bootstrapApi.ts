import { apiPost } from './apiClient'

export type BootstrapAdminInput = {
  fullName: string
  email: string
  password: string
  bootstrapSecret: string
}

export type BootstrapAdminResult = {
  id: number
  fullName: string
  email: string
  role: 'ADMIN'
}

/** One-time: creates first ADMIN when no admin exists. No auth token. */
export function bootstrapAdmin(input: BootstrapAdminInput) {
  return apiPost<BootstrapAdminResult, BootstrapAdminInput>('/api/admin/bootstrap-admin', input)
}
