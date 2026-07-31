import { PrismaClient, CommissionType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Default Admin
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@earnx.com' },
    update: {},
    create: {
      email: 'admin@earnx.com',
      password_hash: adminPasswordHash,
      name: 'Super Admin',
    },
  });
  console.log(`Admin created: ${admin.email}`);

  // 2. Default Designations with Star counts & Unlocked max_level depth
  const designations = [
    { name: '1 Star Leader', stars: 1, max_level: 2 },
    { name: '2 Star Director', stars: 2, max_level: 3 },
    { name: '3 Star Executive', stars: 3, max_level: 5 },
    { name: 'VIP Diamond Leader', stars: 5, max_level: 10 },
  ];

  for (const des of designations) {
    const existing = await prisma.designation.findFirst({
      where: { name: des.name },
    });
    if (!existing) {
      await prisma.designation.create({
        data: des,
      });
    }
  }
  console.log('Designations seeded.');

  // 3. Default Commission Rules
  const activationRules = [
    { level: 1, amount: 100.00 },
    { level: 2, amount: 50.00 },
    { level: 3, amount: 25.00 },
  ];

  for (const rule of activationRules) {
    await prisma.commissionRule.upsert({
      where: {
        type_level: {
          type: CommissionType.ACTIVATION,
          level: rule.level,
        },
      },
      update: { amount: rule.amount },
      create: {
        type: CommissionType.ACTIVATION,
        level: rule.level,
        amount: rule.amount,
      },
    });
  }

  const premiumRules = [
    { level: 1, amount: 500.00 },
    { level: 2, amount: 250.00 },
    { level: 3, amount: 100.00 },
  ];

  for (const rule of premiumRules) {
    await prisma.commissionRule.upsert({
      where: {
        type_level: {
          type: CommissionType.PREMIUM,
          level: rule.level,
        },
      },
      update: { amount: rule.amount },
      create: {
        type: CommissionType.PREMIUM,
        level: rule.level,
        amount: rule.amount,
      },
    });
  }

  console.log('Commission rules seeded.');
  console.log('Database seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
