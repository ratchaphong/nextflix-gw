import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const packages = [
    {
      id: 'basic-id',
      name: 'Basic',
      maxProfiles: 1,
      maxMembers: 1,
      price: 0,
      resolution: '480p',
    },
    {
      id: 'standard-id',
      name: 'Standard',
      maxProfiles: 2,
      maxMembers: 2,
      price: 99,
      resolution: '720p',
    },
    {
      id: 'premium-id',
      name: 'Premium',
      maxProfiles: 4,
      maxMembers: 4,
      price: 199,
      resolution: '1080p',
    },
  ];

  for (const pkg of packages) {
    await prisma.subscriptionPackage.upsert({
      where: { id: pkg.id },
      update: {},
      create: pkg,
    });
  }

  console.log('📦 Package seeding complete.');

  const updated = await prisma.user.updateMany({
    where: { subscriptionPackageId: null },
    data: { subscriptionPackageId: 'basic-id' },
  });

  console.log(`👤 Updated ${updated.count} users to have Basic package.`);
  console.log('✅ Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
