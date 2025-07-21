-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "favoriteMovieIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
