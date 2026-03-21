/**
 * Create or promote a Super Admin user (role SUPER_ADMIN).
 *
 * Usage (from server/):
 *   npx tsx scripts/createSuperAdmin.ts
 *
 * Required in .env:
 *   SUPER_ADMIN_EMAIL
 *   SUPER_ADMIN_PASSWORD
 * Optional:
 *   SUPER_ADMIN_FULL_NAME (default: "Super Admin")
 *
 * Flags:
 *   --promote   If the email exists, set role to SUPER_ADMIN (otherwise exits with error).
 */
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from '../src/shared/prisma'

async function main() {
  const promote = process.argv.includes('--promote')
  const email = process.env.SUPER_ADMIN_EMAIL?.toLowerCase().trim()
  const password = process.env.SUPER_ADMIN_PASSWORD
  const fullName = process.env.SUPER_ADMIN_FULL_NAME?.trim() || 'Super Admin'

  if (!email || !password || password.length < 8) {
    // eslint-disable-next-line no-console
    console.error('Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD (min 8 chars) in server/.env')
    process.exit(1)
  }

  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    if (existing.role === 'SUPER_ADMIN') {
      // eslint-disable-next-line no-console
      console.log(`User ${email} is already SUPER_ADMIN (id=${existing.id}).`)
      return
    }
    if (!promote) {
      // eslint-disable-next-line no-console
      console.error(
        `User ${email} already exists with role ${existing.role}. Run with --promote to set SUPER_ADMIN, or choose another email.`,
      )
      process.exit(1)
    }
    const passwordHash = await bcrypt.hash(password, 10)
    await prisma.user.update({
      where: { id: existing.id },
      data: { role: 'SUPER_ADMIN', passwordHash, fullName: fullName || existing.fullName },
    })
    // eslint-disable-next-line no-console
    console.log(`Promoted ${email} to SUPER_ADMIN (id=${existing.id}).`)
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  })
  // eslint-disable-next-line no-console
  console.log(`Created SUPER_ADMIN: ${user.email} (id=${user.id})`)
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
