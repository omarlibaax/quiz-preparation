import 'dotenv/config'
import { importQuestionBank } from '../src/modules/admin/admin.service'
import { prisma } from '../src/shared/prisma'

async function main() {
  const clearExisting = process.argv.includes('--clear')
  const filePathArg = process.argv.find((a) => a.startsWith('--file='))
  const filePath = filePathArg ? filePathArg.replace('--file=', '') : undefined

  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true },
  })
  if (!admin) {
    throw new Error('No ADMIN user found. Create one via POST /api/admin/bootstrap-admin first.')
  }

  const result = await importQuestionBank({
    clearExisting,
    filePath,
    adminUserId: admin.id,
  })

  // eslint-disable-next-line no-console
  console.log('Import done:', result)
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

