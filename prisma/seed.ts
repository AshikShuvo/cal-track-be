import { PrismaClient, AuthProvider } from '@prisma/client';
import { Role } from '../src/common/enums/role.enum';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
}

async function main(): Promise<void> {
  // Clean the database first
  await prisma.user.deleteMany();

  const defaultPassword = await hashPassword('Password123!');

  // Create users with different roles
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'user@example.com',
        name: 'Regular User',
        password: defaultPassword,
        role: Role.USER,
        provider: AuthProvider.EMAIL,
        profileImageUrl: null,
      },
    }),
    prisma.user.create({
      data: {
        email: 'moderator@example.com',
        name: 'Content Moderator',
        password: defaultPassword,
        role: Role.MODERATOR,
        provider: AuthProvider.EMAIL,
        profileImageUrl: null,
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'System Admin',
        password: defaultPassword,
        role: Role.ADMIN,
        provider: AuthProvider.EMAIL,
        profileImageUrl: null,
      },
    }),
  ]);

  console.log('Database has been seeded with the following users:');
  users.forEach(user => {
    console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
  });
  console.log('\nDefault password for all users: Password123!');
}

main()
  .catch((e) => {
    console.error('Error seeding the database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 