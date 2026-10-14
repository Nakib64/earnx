/**
 * Standalone VPS Migration & Seeding Script
 * 
 * Usage on VPS:
 *   cd /var/www/earnx/backend
 *   node prisma/seed-live-packages.js
 * 
 * What this script does:
 * 1. Upserts the 3 Premium Packages (Bronze, Silver, Gold) & removes obsolete test packages.
 * 2. Clears obsolete legacy Investment Plans (e.g. Starter Yield Plan, VIP Growth Fund)
 *    and upserts only the 2 active plans (3 Month plan, 6 Month Plan).
 * 3. Migrates legacy premium users (is_premium = true with null package) to Bronze VIP.
 * 4. Seeds initial marketplace products if empty.
 */

const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultPackages = [
  {
    title: 'Bronze VIP Package',
    description: 'Entry-level VIP membership. Watch 30 ads daily to earn ৳30 guaranteed cash.',
    original_price: new Prisma.Decimal(10000),
    discount_percent: 65,
    price: new Prisma.Decimal(3500),
    daily_ads_count: 30,
    daily_reward_amount: new Prisma.Decimal(30),
    duration_days: 365,
    is_active: true,
    direct_referral_commission: new Prisma.Decimal(500),
  },
  {
    title: 'Silver VIP Package',
    description: 'Mid-tier VIP membership. Watch 30 ads daily to earn ৳60 guaranteed cash.',
    original_price: new Prisma.Decimal(20000),
    discount_percent: 65,
    price: new Prisma.Decimal(7000),
    daily_ads_count: 30,
    daily_reward_amount: new Prisma.Decimal(60),
    duration_days: 365,
    is_active: true,
    direct_referral_commission: new Prisma.Decimal(800),
  },
  {
    title: 'Gold VIP Package',
    description: 'High-yield VIP membership. Watch 40 ads daily to earn ৳120 guaranteed cash.',
    original_price: new Prisma.Decimal(30000),
    discount_percent: 50,
    price: new Prisma.Decimal(15000),
    daily_ads_count: 40,
    daily_reward_amount: new Prisma.Decimal(120),
    duration_days: 365,
    is_active: true,
    direct_referral_commission: new Prisma.Decimal(1500),
  },
];

const defaultInvestmentPlans = [
  {
    title: '3 Month plan',
    amount: new Prisma.Decimal(10000),
    min_amount: new Prisma.Decimal(10000),
    max_amount: new Prisma.Decimal(10000),
    monthly_return_percent: new Prisma.Decimal(5),
    duration_months: 3,
    is_lifetime: false,
    is_active: true,
  },
  {
    title: '6 Month Plan',
    amount: new Prisma.Decimal(20000),
    min_amount: new Prisma.Decimal(20000),
    max_amount: new Prisma.Decimal(20000),
    monthly_return_percent: new Prisma.Decimal(7),
    duration_months: 6,
    is_lifetime: false,
    is_active: true,
  },
];

const initialProducts = [
  {
    name: 'Smart Fitness Watch Ultra (Series 9)',
    description: 'High-definition 1.96-inch AMOLED display with 24/7 Heart Rate, SpO2 monitoring, 100+ Sports modes, IP68 water resistance, and up to 10 days battery life.',
    price: 2850.0,
    stock: 45,
    category: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'True Wireless Noise-Cancelling Earbuds Pro',
    description: 'Immersive sound with 35dB Active Noise Cancellation, Bluetooth 5.3 low latency audio, dual microphones with ENC for crystal-clear calls, and 32 hours total playback.',
    price: 1990.0,
    stock: 60,
    category: 'Audio',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'Ultra-Slim 20,000mAh 22.5W Fast Charging Power Bank',
    description: 'Premium metal casing dual-input and triple-output power bank. Supports PD 3.0 and QC 4.0 fast charging protocols for iPhone, Android, and tablets.',
    price: 1450.0,
    stock: 75,
    category: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1609592426507-063a82e99d9d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'Mechanical RGB Gaming Keyboard (Tactile Blue Switches)',
    description: 'Compact 87-key tenkeyless layout with double-shot PBT keycaps, per-key dynamic RGB backlighting, anti-ghosting, and durable braided USB-C cable.',
    price: 3400.0,
    stock: 30,
    category: 'Gaming',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'Smart LED Desk Lamp with 15W Qi Wireless Charger',
    description: 'Adjustable gooseneck lamp with 5 color temperatures, eye-care flicker-free lighting, timer shutdown, and integrated 15W fast wireless charging pad.',
    price: 1750.0,
    stock: 40,
    category: 'Home & Office',
    images: [
      'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'High-Speed Portable External SSD 512GB (USB 3.2 Gen 2)',
    description: 'Blazing fast data transfer speeds up to 1,050 MB/s. Shock-resistant compact aluminum body with drop protection up to 2 meters. Compatible with Windows, Mac, and Android.',
    price: 4200.0,
    stock: 25,
    category: 'Storage',
    images: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    ],
  },
];

async function main() {
  console.log('----------------------------------------------------');
  console.log('🚀 Starting EarnX Live Seeding & Migration Script...');
  console.log('----------------------------------------------------\n');

  // ========================================================
  // 1. Seed / Upsert Premium Packages & Remove Obsolete Ones
  // ========================================================
  console.log('📦 1. Checking Premium Packages...');
  let bronzePackageId = null;

  for (const pkg of defaultPackages) {
    let existing = await prisma.premiumPackage.findFirst({
      where: { title: pkg.title },
    });

    if (!existing) {
      existing = await prisma.premiumPackage.create({
        data: pkg,
      });
      console.log(`   + Created: ${pkg.title} (ID: ${existing.id})`);
    } else {
      console.log(`   ✓ Already Exists: ${pkg.title} (ID: ${existing.id})`);
    }

    if (pkg.title.includes('Bronze')) {
      bronzePackageId = existing.id;
    }
  }

  // Remove obsolete test packages if any
  const activePackageTitles = defaultPackages.map((p) => p.title);
  const obsoletePackages = await prisma.premiumPackage.findMany({
    where: {
      title: { notIn: activePackageTitles },
    },
    select: { id: true, title: true },
  });

  if (obsoletePackages.length > 0) {
    const obsoletePkgIds = obsoletePackages.map((p) => p.id);
    console.log(`   Found ${obsoletePackages.length} obsolete package(s): ${obsoletePackages.map((p) => p.title).join(', ')}`);

    if (bronzePackageId) {
      await prisma.user.updateMany({
        where: { premium_package_id: { in: obsoletePkgIds } },
        data: { premium_package_id: bronzePackageId },
      });
    }

    await prisma.dailyAdClaim.deleteMany({
      where: { package_id: { in: obsoletePkgIds } },
    });

    await prisma.premiumPackage.deleteMany({
      where: { id: { in: obsoletePkgIds } },
    });
    console.log(`   🗑️ Removed ${obsoletePackages.length} obsolete Premium Package(s).`);
  }

  // ========================================================
  // 2. Clear Obsolete Investment Plans & Upsert Active Ones
  // ========================================================
  console.log('\n🧹 2. Checking & Cleaning Investment Plans...');
  const activePlanTitles = defaultInvestmentPlans.map((p) => p.title);

  // Find any plans not in the active list (e.g. Starter Yield Plan, VIP Growth Fund, test plans)
  const obsoletePlans = await prisma.investmentPlan.findMany({
    where: {
      title: { notIn: activePlanTitles },
    },
    select: { id: true, title: true },
  });

  if (obsoletePlans.length > 0) {
    const obsoleteIds = obsoletePlans.map((p) => p.id);
    console.log(`   Found ${obsoletePlans.length} obsolete plan(s): ${obsoletePlans.map((p) => p.title).join(', ')}`);

    // Cleanly unlink any UserInvestment pointing to obsolete plans
    await prisma.userInvestment.updateMany({
      where: { plan_id: { in: obsoleteIds } },
      data: { plan_id: null },
    });
    await prisma.userInvestment.updateMany({
      where: { pending_plan_id: { in: obsoleteIds } },
      data: { pending_plan_id: null },
    });

    // Delete obsolete plans
    const deleted = await prisma.investmentPlan.deleteMany({
      where: { id: { in: obsoleteIds } },
    });
    console.log(`   🗑️ Successfully removed ${deleted.count} obsolete Investment Plan(s).`);
  } else {
    console.log('   ✓ No obsolete Investment Plans found.');
  }

  // Upsert the 2 valid active plans (3 Month plan, 6 Month Plan)
  for (const plan of defaultInvestmentPlans) {
    let existing = await prisma.investmentPlan.findFirst({
      where: { title: plan.title },
    });

    if (!existing) {
      existing = await prisma.investmentPlan.create({
        data: plan,
      });
      console.log(`   + Created Plan: ${plan.title} (ID: ${existing.id})`);
    } else {
      console.log(`   ✓ Already Exists: ${plan.title} (ID: ${existing.id})`);
    }
  }

  // ========================================================
  // 3. Migrate Legacy Premium Users to Bronze Package
  // ========================================================
  console.log('\n👥 3. Checking Legacy Premium Users (is_premium = true without package)...');

  if (!bronzePackageId) {
    console.error('❌ Error: Bronze package ID not found. Aborting user migration.');
    return;
  }

  const legacyUsers = await prisma.user.findMany({
    where: {
      is_premium: true,
      premium_package_id: null,
    },
    select: {
      id: true,
      phone: true,
      full_name: true,
    },
  });

  console.log(`   Found ${legacyUsers.length} legacy premium users requiring Bronze package assignment.`);

  if (legacyUsers.length > 0) {
    const updateResult = await prisma.user.updateMany({
      where: {
        is_premium: true,
        premium_package_id: null,
      },
      data: {
        premium_package_id: bronzePackageId,
      },
    });

    console.log(`   ✅ Successfully updated ${updateResult.count} users to Bronze VIP Package!`);
  } else {
    console.log('   ✓ All premium users already have an active package assigned.');
  }

  // ========================================================
  // 4. Seed Initial Marketplace Products if Empty
  // ========================================================
  console.log('\n🛒 4. Checking Marketplace Products...');
  try {
    const productCount = await prisma.product.count();
    if (productCount === 0) {
      console.log('   Seeding initial marketplace products...');
      for (const item of initialProducts) {
        await prisma.product.create({
          data: item,
        });
      }
      console.log(`   ✅ Successfully seeded ${initialProducts.length} initial products!`);
    } else {
      console.log(`   ✓ Marketplace products already exist (${productCount} items).`);
    }
  } catch (err) {
    console.warn(`   Notice while checking products: ${err.message}`);
  }

  console.log('\n----------------------------------------------------');
  console.log('🎉 Live Migration & Seeding Complete!');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
