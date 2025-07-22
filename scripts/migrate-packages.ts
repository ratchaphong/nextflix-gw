import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migratePackages() {
  const updated = await prisma.user.updateMany({
    where: {
      OR: [
        { subscriptionPackageId: null },
        { subscriptionPackageId: 'basic-id' },
      ],
    },
    data: {
      subscriptionPackageId: 'premium-id',
    },
  });

  console.log(`📦 Migrated ${updated.count} users to Premium package.`);
  await prisma.$disconnect();
}

migratePackages().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
