import { PrismaClient } from '@prisma/client';
import { PACKAGES_DEFAULT } from '../src/utils/pagekage.utils';

const prisma = new PrismaClient();

async function main() {
  for (const pkg of PACKAGES_DEFAULT) {
    await prisma.subscriptionPackage.upsert({
      where: { id: pkg.id },
      update: {},
      create: pkg,
    });
  }

  console.log('📦 Package seeding complete.');

  const updated = await prisma.user.updateMany({
    where: {
      OR: [
        { subscriptionPackageId: null },
        { subscriptionPackageId: 'basic-id' },
      ],
    },
    data: { subscriptionPackageId: 'premium-id' },
  });

  console.log(`👤 Updated ${updated.count} users to have Premium package.`);
  console.log('✅ Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
