import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      profile: {
        create: {
          height: 175,
          weight: 70,
          activityLevel: 'MODERATE',
          birthDate: new Date('1990-01-01'),
          gender: 'OTHER',
        },
      },
    },
  });

  // Create moderator user
  const moderatorPassword = await bcrypt.hash('moderator123', 10);
  const moderator = await prisma.user.upsert({
    where: { email: 'moderator@example.com' },
    update: {},
    create: {
      email: 'moderator@example.com',
      name: 'Moderator User',
      password: moderatorPassword,
      role: 'MODERATOR',
      profile: {
        create: {
          height: 165,
          weight: 60,
          activityLevel: 'LIGHT',
          birthDate: new Date('1995-01-01'),
          gender: 'OTHER',
        },
      },
    },
  });

  console.log({ admin, moderator });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 