import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateProfiles() {
  const users = await prisma.user.findMany({
    include: {
      household: {
        include: {
          members: true,
        },
      },
    },
  });

  const toMigrate = users.filter((u) => !u.household);

  console.log(`🔎 Users with no household: ${toMigrate.length}`);

  for (const user of toMigrate) {
    console.log(`🚀 Creating household for: ${user.email}`);

    // 1. สร้าง household ใหม่
    const household = await prisma.household.create({
      data: {
        name: `${user.name}'s Household`,
        userId: user.id,
      },
    });

    // 2. สร้าง householdMember (default) + เชื่อม userId
    const member = await prisma.householdMember.create({
      data: {
        name: user.name,
        householdId: household.id,
        userId: user.id,
      },
    });

    // 3. ลบ orphan profile ที่ householdMemberId = null
    await prisma.profile.deleteMany({
      where: {
        householdMemberId: null,
      },
    });

    // 4. สร้าง Profile ใหม่
    await prisma.profile.create({
      data: {
        name: user.name,
        householdMemberId: member.id,
      },
    });

    console.log(`✅ Migrated user ${user.email}`);
  }

  // 🔄 ดัก user ที่มี household แล้ว แต่ member ยังไม่ได้เชื่อมกับ userId
  const usersWithHouseholdButNoLinkedMember = users.filter(
    (u) =>
      u.household &&
      u.household.members.length > 0 &&
      !u.household.members.some((m) => m.userId === u.id),
  );

  console.log(
    `🛠️ Fixing ${usersWithHouseholdButNoLinkedMember.length} users with unlinked member`,
  );

  for (const user of usersWithHouseholdButNoLinkedMember) {
    const member = user.household!.members[0];

    await prisma.householdMember.update({
      where: { id: member.id },
      data: {
        userId: user.id,
      },
    });

    console.log(`🔗 Linked member ${member.id} with user ${user.email}`);
  }

  console.log('🎉 Migration + linking completed');
  await prisma.$disconnect();
}

migrateProfiles().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
