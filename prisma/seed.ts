import { PrismaClient } from '@prisma/client';
import { PACKAGES_DEFAULT } from '../src/utils/pagekage.utils';
import {
  MOCK_RECOMMENDED_VIDEO,
  MOCK_VIDEO_BY_CATEGORY,
} from '../src/utils/movie.utils';

const prisma = new PrismaClient();

const toValidDate = (dateStr?: string): Date | undefined => {
  if (!dateStr || isNaN(Date.parse(dateStr))) return undefined;
  return new Date(dateStr);
};

async function main() {
  for (const pkg of PACKAGES_DEFAULT) {
    await prisma.subscriptionPackage.upsert({
      where: { id: pkg.id },
      update: {},
      create: pkg,
    });
  }

  console.log('📦 Package seeding complete.');

  // await prisma.movie.deleteMany({});
  // console.log('🗑️ Deleted all existing movies');

  // Seed Movies if not exist
  const movieCount = await prisma.movie.count();
  if (movieCount === 0) {
    const movies = [...MOCK_RECOMMENDED_VIDEO, ...MOCK_VIDEO_BY_CATEGORY];
    for (const movie of movies) {
      await prisma.movie.create({
        data: {
          ...movie,
          releaseDate: toValidDate(movie.releaseDate),
        },
      });
    }
    console.log(`🎬 Seeded ${movies.length} movies.`);
  } else {
    console.log('🎬 Movies already exist. Skipping seeding.');
  }

  console.log('✅ Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
