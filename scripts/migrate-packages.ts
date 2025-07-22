import { PrismaClient } from '@prisma/client';
import { THIRTY_DAYS } from '../src/utils/auth.utils';

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

  const usersToUpdate = await prisma.user.findMany({
    where: {
      packageExpiredAt: null,
    },
    select: {
      id: true,
    },
  });

  const now = new Date();
  const expiredAt = new Date(now.getTime() + THIRTY_DAYS);

  for (const user of usersToUpdate) {
    await prisma.user.update({
      where: { id: user.id },
      data: { packageExpiredAt: expiredAt },
    });
  }

  console.log(
    `📆 Updated ${usersToUpdate.length} users with default packageExpiredAt.`,
  );

  await prisma.$disconnect();
}

migratePackages().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
