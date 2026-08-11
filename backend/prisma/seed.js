"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const banglaFirstNames = [
    'Rahim', 'Karim', 'Sumaiya', 'Tanvir', 'Nusrat', 'Shakib', 'Tamim', 'Mushfiq', 'Taskin', 'Mahmudullah',
    'Fariha', 'Mehedi', 'Sabbir', 'Anamul', 'Liton', 'Mustafizur', 'Taijul', 'Soumya', 'Afif', 'Naim',
    'Jahanara', 'Rumana', 'Salma', 'Nigar', 'Farzana', 'Nahida', 'Ritu', 'Sobhana', 'Fargana', 'Sanjida',
    'Ariful', 'Mosaddek', 'Ebadot', 'Shoriful', 'Hasan', 'Nasum', 'Rishad', 'Tanzid', 'Tawhid', 'Jaker',
    'Kamrul', 'Al-Amin', 'Zakir', 'Shahadat', 'Mahidul', 'Rezaur', 'Mridha', 'Kazi', 'Mominul', 'Shanto',
];
const banglaLastNames = [
    'Ahmed', 'Islam', 'Hossain', 'Chowdhury', 'Rahman', 'Khan', 'Siddique', 'Mia', 'Ali', 'Haque',
    'Alam', 'Sarker', 'Bhuiyan', 'Uddin', 'Khandokar', 'Hasan', 'Mahmud', 'Akter', 'Begum', 'Sultana',
];
function getRandomName(idx) {
    const f = banglaFirstNames[idx % banglaFirstNames.length];
    const l = banglaLastNames[(idx * 3) % banglaLastNames.length];
    return `${f} ${l}`;
}
async function main() {
    console.log('Cleaning existing database data...');
    await prisma.walletTransaction.deleteMany({});
    await prisma.activationRequest.deleteMany({});
    await prisma.premiumRequest.deleteMany({});
    await prisma.withdrawalRequest.deleteMany({});
    await prisma.userInvestment.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.admin.deleteMany({});
    await prisma.designation.deleteMany({});
    await prisma.commissionRule.deleteMany({});
    await prisma.offer.deleteMany({});
    await prisma.investmentPlan.deleteMany({});
    await prisma.leaderboardEntry.deleteMany({});
    console.log('Seeding 100 users with ONLY 6 badged leaders & a deep 5-layer tree...');
    const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
    const admin = await prisma.admin.create({
        data: {
            email: 'admin@earnx.com',
            password_hash: adminPasswordHash,
            name: 'Super Admin',
        },
    });
    console.log(`Admin created: ${admin.email}`);
    const dDiamond = await prisma.designation.create({
        data: { name: 'VIP Diamond Leader', stars: 5, max_level: 10 },
    });
    const d3Star = await prisma.designation.create({
        data: { name: '3 Star Executive', stars: 3, max_level: 5 },
    });
    const d2Star = await prisma.designation.create({
        data: { name: '2 Star Director', stars: 2, max_level: 3 },
    });
    const d1Star = await prisma.designation.create({
        data: { name: '1 Star Leader', stars: 1, max_level: 2 },
    });
    await prisma.commissionRule.createMany({
        data: [
            { type: client_1.CommissionType.ACTIVATION, level: 1, amount: 100.00 },
            { type: client_1.CommissionType.ACTIVATION, level: 2, amount: 50.00 },
            { type: client_1.CommissionType.ACTIVATION, level: 3, amount: 25.00 },
            { type: client_1.CommissionType.PREMIUM, level: 1, amount: 500.00 },
            { type: client_1.CommissionType.PREMIUM, level: 2, amount: 250.00 },
            { type: client_1.CommissionType.PREMIUM, level: 3, amount: 100.00 },
        ],
    });
    const defaultPasswordHash = await bcrypt.hash('Password123!', 10);
    const userMap = {};
    userMap[1] = await prisma.user.create({
        data: {
            phone: '01710000001',
            password_hash: defaultPasswordHash,
            full_name: 'Rahim Ahmed (Root VIP Diamond)',
            referral_code: 'REF001',
            referred_by_id: null,
            designation_id: dDiamond.id,
            status: client_1.UserStatus.ACTIVE,
            is_premium: true,
            wallet_balance: 12500.00,
        },
    });
    userMap[2] = await prisma.user.create({
        data: {
            phone: '01710000002',
            password_hash: defaultPasswordHash,
            full_name: 'Karim Chowdhury (3 Star)',
            referral_code: 'REF002',
            referred_by_id: userMap[1].id,
            designation_id: d3Star.id,
            status: client_1.UserStatus.ACTIVE,
            is_premium: true,
            wallet_balance: 6200.00,
        },
    });
    userMap[3] = await prisma.user.create({
        data: {
            phone: '01710000003',
            password_hash: defaultPasswordHash,
            full_name: 'Sumaiya Islam (2 Star)',
            referral_code: 'REF003',
            referred_by_id: userMap[1].id,
            designation_id: d2Star.id,
            status: client_1.UserStatus.ACTIVE,
            is_premium: false,
            wallet_balance: 3400.00,
        },
    });
    userMap[4] = await prisma.user.create({
        data: {
            phone: '01710000004',
            password_hash: defaultPasswordHash,
            full_name: 'Tanvir Hossain (1 Star)',
            referral_code: 'REF004',
            referred_by_id: userMap[2].id,
            designation_id: d1Star.id,
            status: client_1.UserStatus.ACTIVE,
            is_premium: false,
            wallet_balance: 1800.00,
        },
    });
    userMap[5] = await prisma.user.create({
        data: {
            phone: '01710000005',
            password_hash: defaultPasswordHash,
            full_name: 'Nusrat Jahan (1 Star)',
            referral_code: 'REF005',
            referred_by_id: userMap[3].id,
            designation_id: d1Star.id,
            status: client_1.UserStatus.ACTIVE,
            is_premium: false,
            wallet_balance: 1500.00,
        },
    });
    userMap[6] = await prisma.user.create({
        data: {
            phone: '01710000006',
            password_hash: defaultPasswordHash,
            full_name: 'Shakib Al Hasan (1 Star)',
            referral_code: 'REF006',
            referred_by_id: userMap[4].id,
            designation_id: d1Star.id,
            status: client_1.UserStatus.ACTIVE,
            is_premium: false,
            wallet_balance: 950.00,
        },
    });
    console.log('Seeded 6 badged leaders complying with hierarchy.');
    for (let i = 7; i <= 15; i++) {
        const sponsorId = userMap[(i % 3) + 1].id;
        userMap[i] = await prisma.user.create({
            data: {
                phone: `0171${String(i).padStart(7, '0')}`,
                password_hash: defaultPasswordHash,
                full_name: getRandomName(i),
                referral_code: `REF${String(i).padStart(3, '0')}`,
                referred_by_id: sponsorId,
                designation_id: null,
                status: client_1.UserStatus.ACTIVE,
                wallet_balance: Math.floor(Math.random() * 2000) + 100,
            },
        });
    }
    for (let i = 16; i <= 35; i++) {
        const sponsorId = userMap[((i - 16) % 9) + 7].id;
        userMap[i] = await prisma.user.create({
            data: {
                phone: `0171${String(i).padStart(7, '0')}`,
                password_hash: defaultPasswordHash,
                full_name: getRandomName(i),
                referral_code: `REF${String(i).padStart(3, '0')}`,
                referred_by_id: sponsorId,
                designation_id: null,
                status: client_1.UserStatus.ACTIVE,
                wallet_balance: Math.floor(Math.random() * 1500) + 50,
            },
        });
    }
    for (let i = 36; i <= 60; i++) {
        const sponsorId = userMap[((i - 36) % 20) + 16].id;
        userMap[i] = await prisma.user.create({
            data: {
                phone: `0171${String(i).padStart(7, '0')}`,
                password_hash: defaultPasswordHash,
                full_name: getRandomName(i),
                referral_code: `REF${String(i).padStart(3, '0')}`,
                referred_by_id: sponsorId,
                designation_id: null,
                status: client_1.UserStatus.ACTIVE,
                wallet_balance: Math.floor(Math.random() * 1000) + 50,
            },
        });
    }
    for (let i = 61; i <= 80; i++) {
        const sponsorId = userMap[((i - 61) % 25) + 36].id;
        userMap[i] = await prisma.user.create({
            data: {
                phone: `0171${String(i).padStart(7, '0')}`,
                password_hash: defaultPasswordHash,
                full_name: getRandomName(i),
                referral_code: `REF${String(i).padStart(3, '0')}`,
                referred_by_id: sponsorId,
                designation_id: null,
                status: client_1.UserStatus.ACTIVE,
                wallet_balance: Math.floor(Math.random() * 800) + 20,
            },
        });
    }
    for (let i = 81; i <= 100; i++) {
        const sponsorId = userMap[((i - 81) % 20) + 61].id;
        const status = i > 90 ? client_1.UserStatus.DISABLED : client_1.UserStatus.ACTIVE;
        userMap[i] = await prisma.user.create({
            data: {
                phone: `0171${String(i).padStart(7, '0')}`,
                password_hash: defaultPasswordHash,
                full_name: getRandomName(i),
                referral_code: `REF${String(i).padStart(3, '0')}`,
                referred_by_id: sponsorId,
                designation_id: null,
                status,
                wallet_balance: Math.floor(Math.random() * 500),
            },
        });
    }
    console.log('Successfully created deep 5-layer downline tree for 100 users.');
    for (let i = 91; i <= 95; i++) {
        await prisma.activationRequest.create({
            data: {
                user_id: userMap[i].id,
                referrer_id: userMap[i].referred_by_id,
                status: client_1.RequestStatus.PENDING,
            },
        });
    }
    for (let i = 7; i <= 11; i++) {
        await prisma.withdrawalRequest.create({
            data: {
                user_id: userMap[i].id,
                amount: 300.00,
                status: client_1.RequestStatus.PENDING,
            },
        });
    }
    await prisma.offer.createMany({
        data: [
            {
                title: 'Complete Survey & Earn 50 BDT',
                description: 'Answer 5 simple questions about shopping habits.',
                reward_amount: 50.00,
                is_active: true,
            },
            {
                title: 'Download EarnX App',
                description: 'Install the mobile app to receive 100 BDT bonus.',
                reward_amount: 100.00,
                is_active: true,
            },
        ],
    });
    await prisma.investmentPlan.createMany({
        data: [
            {
                title: 'Starter Yield Plan',
                min_amount: 1000.00,
                max_amount: 10000.00,
                monthly_return_percent: 5.00,
                duration_months: 12,
                is_active: true,
            },
            {
                title: 'VIP Growth Fund',
                min_amount: 10000.00,
                max_amount: 100000.00,
                monthly_return_percent: 8.50,
                duration_months: 12,
                is_active: true,
            },
        ],
    });
    for (let rank = 1; rank <= 6; rank++) {
        const topUser = userMap[rank];
        await prisma.leaderboardEntry.create({
            data: {
                rank,
                name: topUser.full_name,
                phone: topUser.phone,
                invested_amount: (7 - rank) * 15000,
                profit_earned: (7 - rank) * 3500,
                badge: rank === 1 ? 'Platinum Champion' : rank <= 3 ? 'Gold Leader' : 'Silver Earner',
                is_active: true,
            },
        });
    }
    console.log('\n======================================================');
    console.log('  SEEDING COMPLETE!');
    console.log('  Total Badged Leaders: 6');
    console.log('  Total Unbadged Members: 94');
    console.log('  Tree Depth: 5 Deep Layers');
    console.log('  Admin Credentials: admin@earnx.com / Admin123!');
    console.log('======================================================\n');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map