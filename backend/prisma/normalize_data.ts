import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  console.log('Starting data normalization script...');

  // 1. Wipe all wallet transactions
  const deletedTx = await prisma.walletTransaction.deleteMany({});
  console.log(`Deleted ${deletedTx.count} wallet transaction records.`);

  // 2. Reset wallet balances to 0.00 for all users
  await prisma.user.updateMany({
    data: {
      wallet_balance: 0.00,
    },
  });
  console.log('Reset all user wallet balances to 0.00 BDT.');

  // 3. Mark all users with a designation as is_premium = true
  const updatedPremium = await prisma.user.updateMany({
    where: {
      designation_id: { not: null },
    },
    data: {
      is_premium: true,
      premium_started_at: new Date(),
      premium_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });
  console.log(`Set is_premium = true for ${updatedPremium.count} badged users.`);

  // 4. Normalize User full_names (remove patterns like "(3 Star)", "(Root VIP Diamond)", etc.)
  const allUsers = await prisma.user.findMany();
  let normalizedUsersCount = 0;
  for (const user of allUsers) {
    if (user.full_name) {
      const cleanName = user.full_name.replace(/\s*\([^)]*\)/g, '').trim();
      if (cleanName !== user.full_name) {
        await prisma.user.update({
          where: { id: user.id },
          data: { full_name: cleanName },
        });
        normalizedUsersCount++;
      }
    }
  }
  console.log(`Normalized ${normalizedUsersCount} user names.`);

  // 5. Normalize Designation names (remove "1 Star", "2 Star", "3 Star" prefix/suffixes)
  const designations = await prisma.designation.findMany();
  for (const des of designations) {
    const cleanDesName = des.name.replace(/\d+\s*Stars?\s*/gi, '').trim();
    await prisma.designation.update({
      where: { id: des.id },
      data: { name: cleanDesName },
    });
  }
  console.log('Normalized designation names.');

  console.log('Data normalization completed successfully!');
}

run()
  .catch((e) => {
    console.error('Error running normalization script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
