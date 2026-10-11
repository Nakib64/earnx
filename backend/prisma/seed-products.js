const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

async function seed() {
  const existingCount = await prisma.product.count();
  if (existingCount > 0) {
    console.log(`Products table already has ${existingCount} items. Skipping.`);
    return;
  }

  console.log('Seeding initial marketplace products...');
  for (const item of initialProducts) {
    await prisma.product.create({
      data: item,
    });
  }
  console.log(`Successfully seeded ${initialProducts.length} initial products!`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
