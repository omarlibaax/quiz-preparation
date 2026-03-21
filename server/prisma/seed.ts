/**
 * Full database seed for local MySQL (e.g. exam_platform in phpMyAdmin).
 *
 * 1. Creates users: Super Admin, Admin, Student (passwords from env or dev defaults).
 * 2. Imports subjects, topics, questions from ../../src/data/questions.json
 *
 * Run from server/:
 *   npx prisma db push
 *   npx prisma db seed
 *
 * First-time full replace of catalog (optional):
 *   SEED_CLEAR=true npx prisma db seed
 */
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import type { UserRole } from '@prisma/client'
import { importQuestionBank } from '../src/modules/admin/admin.service'
import { prisma } from '../src/shared/prisma'

const defaults = {
  superAdminEmail: 'superadmin@exam.local',
  superAdminPassword: 'SuperAdmin123!',
  superAdminName: 'Super Admin',
  adminEmail: 'admin@exam.local',
  adminPassword: 'Admin123!',
  adminName: 'Platform Admin',
  studentEmail: 'student@exam.local',
  studentPassword: 'Student123!',
  studentName: 'Demo Student',
}

async function upsertUser(input: {
  email: string
  password: string
  fullName: string
  role: UserRole
}) {
  const email = input.email.toLowerCase().trim()
  const passwordHash = await bcrypt.hash(input.password, 10)
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        fullName: input.fullName,
        passwordHash,
        role: input.role,
        status: 'ACTIVE',
      },
    })
    // eslint-disable-next-line no-console
    console.log(`  Updated user: ${email} (${input.role})`)
    return existing.id
  }
  const user = await prisma.user.create({
    data: {
      email,
      fullName: input.fullName,
      passwordHash,
      role: input.role,
      status: 'ACTIVE',
    },
  })
  // eslint-disable-next-line no-console
  console.log(`  Created user: ${email} (${input.role}) id=${user.id}`)
  return user.id
}

async function main() {
  // eslint-disable-next-line no-console
  console.log('Seeding database…')

  if (!process.env.DATABASE_URL?.includes('mysql')) {
    // eslint-disable-next-line no-console
    console.warn('Warning: DATABASE_URL does not look like MySQL.')
  }

  const superEmail = process.env.SEED_SUPER_ADMIN_EMAIL ?? defaults.superAdminEmail
  const superPass = process.env.SEED_SUPER_ADMIN_PASSWORD ?? defaults.superAdminPassword
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? defaults.adminEmail
  const adminPass = process.env.SEED_ADMIN_PASSWORD ?? defaults.adminPassword
  const studentEmail = process.env.SEED_STUDENT_EMAIL ?? defaults.studentEmail
  const studentPass = process.env.SEED_STUDENT_PASSWORD ?? defaults.studentPassword

  // eslint-disable-next-line no-console
  console.log('\nUsers:')
  await upsertUser({
    email: superEmail,
    password: superPass,
    fullName: process.env.SEED_SUPER_ADMIN_NAME ?? defaults.superAdminName,
    role: 'SUPER_ADMIN',
  })
  await upsertUser({
    email: adminEmail,
    password: adminPass,
    fullName: process.env.SEED_ADMIN_NAME ?? defaults.adminName,
    role: 'ADMIN',
  })
  await upsertUser({
    email: studentEmail,
    password: studentPass,
    fullName: process.env.SEED_STUDENT_NAME ?? defaults.studentName,
    role: 'STUDENT',
  })

  const importBank = process.env.SEED_IMPORT_BANK !== 'false'
  if (!importBank) {
    // eslint-disable-next-line no-console
    console.log('\nSkipping question bank (SEED_IMPORT_BANK=false).')
    return
  }

  const adminForImport = await prisma.user.findFirst({
    where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] } },
    orderBy: { id: 'asc' },
    select: { id: true },
  })
  if (!adminForImport) {
    throw new Error('No admin user found for import attribution')
  }

  const clearExisting = process.env.SEED_CLEAR === 'true'
  // eslint-disable-next-line no-console
  console.log(`\nImporting question bank (clearExisting=${clearExisting})…`)

  const result = await importQuestionBank({
    clearExisting,
    adminUserId: adminForImport.id,
  })

  // eslint-disable-next-line no-console
  console.log('Import result:', result)
  // eslint-disable-next-line no-console
  console.log('\nDone. Log in at the app with:')
  // eslint-disable-next-line no-console
  console.log(`  Super Admin: ${superEmail} / (your SEED_SUPER_ADMIN_PASSWORD)`)
  // eslint-disable-next-line no-console
  console.log(`  Admin:       ${adminEmail} / (your SEED_ADMIN_PASSWORD)`)
  // eslint-disable-next-line no-console
  console.log(`  Student:     ${studentEmail} / (your SEED_STUDENT_PASSWORD)`)
  // eslint-disable-next-line no-console
  console.log(`  Admin UI:    http://localhost:5173/admin/dashboard`)
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
