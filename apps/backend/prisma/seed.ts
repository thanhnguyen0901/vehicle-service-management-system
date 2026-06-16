import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Default Admin account
  const adminExists = await prisma.userAccount.findUnique({
    where: { username: 'admin' },
  });

  if (!adminExists) {
    const passwordHash = await bcrypt.hash('Admin@123', 12);
    await prisma.userAccount.create({
      data: {
        username: 'admin',
        passwordHash,
        fullName: 'System Administrator',
        email: 'admin@garage.local',
        role: Role.Admin,
        isActive: true,
      },
    });
    console.log('Created default admin user — username: admin / password: Admin@123');
  } else {
    console.log('Admin user already exists, skipping.');
  }

  // Sample service catalog
  const serviceCount = await prisma.service.count();
  if (serviceCount === 0) {
    await prisma.service.createMany({
      data: [
        { name: 'Thay dầu nhớt động cơ', unitPrice: 150000, durationMin: 30 },
        { name: 'Kiểm tra tổng quát', unitPrice: 200000, durationMin: 60 },
        { name: 'Vệ sinh buồng đốt', unitPrice: 500000, durationMin: 120 },
        { name: 'Thay lọc gió', unitPrice: 80000, durationMin: 20 },
        { name: 'Cân chỉnh góc bánh xe', unitPrice: 300000, durationMin: 90 },
        { name: 'Thay má phanh trước', unitPrice: 450000, durationMin: 60 },
        { name: 'Thay má phanh sau', unitPrice: 400000, durationMin: 60 },
        { name: 'Nạp gas điều hòa', unitPrice: 350000, durationMin: 45 },
      ],
    });
    console.log('Created sample services');
  }

  // Sample parts
  const partCount = await prisma.part.count();
  if (partCount === 0) {
    await prisma.part.createMany({
      data: [
        {
          partNumber: 'OIL-5W30-4L',
          name: 'Dầu nhớt 5W-30 4L',
          unitCost: 180000,
          unitPrice: 250000,
          stockQuantity: 50,
          reorderLevel: 10,
        },
        {
          partNumber: 'FILTER-OIL-01',
          name: 'Lọc dầu tổng hợp',
          unitCost: 40000,
          unitPrice: 65000,
          stockQuantity: 30,
          reorderLevel: 5,
        },
        {
          partNumber: 'FILTER-AIR-01',
          name: 'Lọc gió động cơ',
          unitCost: 55000,
          unitPrice: 85000,
          stockQuantity: 20,
          reorderLevel: 5,
        },
        {
          partNumber: 'BRAKE-PAD-F01',
          name: 'Má phanh trước (bộ 4)',
          unitCost: 200000,
          unitPrice: 320000,
          stockQuantity: 15,
          reorderLevel: 3,
        },
        {
          partNumber: 'BRAKE-PAD-R01',
          name: 'Má phanh sau (bộ 4)',
          unitCost: 180000,
          unitPrice: 290000,
          stockQuantity: 15,
          reorderLevel: 3,
        },
        {
          partNumber: 'SPARK-PLUG-01',
          name: 'Bugi iridium (chiếc)',
          unitCost: 85000,
          unitPrice: 130000,
          stockQuantity: 40,
          reorderLevel: 8,
        },
      ],
    });
    console.log('Created sample parts');
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
