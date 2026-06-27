import {
  AppointmentStatus,
  InvoiceStatus,
  PaymentMethod,
  PrismaClient,
  Role,
  TransactionType,
  WorkOrderStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const e2ePassword = 'Admin@123';
const demoPassword = 'Demo@123';

type SeedMode = 'e2e' | 'demo';

const mode = parseMode(process.argv[2]);

async function main() {
  console.log(`Cleaning database and seeding ${mode} data...`);
  await cleanDatabase();

  if (mode === 'e2e') {
    await seedE2eData();
  } else {
    await seedDemoData();
  }

  console.log(`Seed ${mode} completed.`);
}

async function cleanDatabase() {
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.invoiceLine.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.inventoryTransaction.deleteMany(),
    prisma.partUsage.deleteMany(),
    prisma.workOrderItem.deleteMany(),
    prisma.workOrder.deleteMany(),
    prisma.appointment.deleteMany(),
    prisma.maintenanceReminder.deleteMany(),
    prisma.vehicle.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.part.deleteMany(),
    prisma.service.deleteMany(),
    prisma.userAccount.deleteMany(),
  ]);
}

async function seedE2eData() {
  await createUsers(
    [
      ['admin', 'Quản trị viên E2E', 'admin.e2e@garage.local', Role.Admin],
      [
        'advisor',
        'Cố vấn dịch vụ E2E',
        'advisor.e2e@garage.local',
        Role.ServiceAdvisor,
      ],
      [
        'technician',
        'Kỹ thuật viên E2E',
        'technician.e2e@garage.local',
        Role.Technician,
      ],
      [
        'inventory',
        'Thủ kho E2E',
        'inventory.e2e@garage.local',
        Role.InventoryClerk,
      ],
      ['cashier', 'Thu ngân E2E', 'cashier.e2e@garage.local', Role.Cashier],
      ['manager', 'Quản lý E2E', 'manager.e2e@garage.local', Role.Manager],
    ],
    e2ePassword,
  );

  await seedCatalog();
}

async function seedDemoData() {
  const users = await createUsers([
    ['admin', 'Nguyễn Minh Quân', 'admin@garage.local', Role.Admin],
    ['advisor', 'Trần Thị Mai', 'advisor@garage.local', Role.ServiceAdvisor],
    ['technician', 'Lê Văn Hùng', 'technician@garage.local', Role.Technician],
    [
      'inventory',
      'Phạm Quốc Bảo',
      'inventory@garage.local',
      Role.InventoryClerk,
    ],
    ['cashier', 'Võ Thị Lan', 'cashier@garage.local', Role.Cashier],
    ['manager', 'Đặng Hoàng Nam', 'manager@garage.local', Role.Manager],
  ]);
  const admin = users.admin;
  const advisor = users.advisor;
  const technician = users.technician;
  const cashier = users.cashier;

  const services = await seedCatalog();
  const parts = await seedPartsWithLedger(admin.id);
  const customers = await seedCustomers();
  const vehicles = await seedVehicles(customers);

  await seedAppointments(vehicles, advisor.id);
  await seedWorkOrders({
    vehicles,
    services,
    parts,
    users: {
      advisorId: advisor.id,
      technicianId: technician.id,
      cashierId: cashier.id,
      adminId: admin.id,
    },
  });
  await seedReminders(customers, vehicles);
  await seedAuditLogs(admin.id);
}

async function createUsers(
  rows: Array<[string, string, string, Role]>,
  rawPassword = demoPassword,
) {
  const passwordHash = await bcrypt.hash(rawPassword, 12);
  const result: Record<string, { id: string }> = {};
  for (const [username, fullName, email, role] of rows) {
    const user = await prisma.userAccount.create({
      data: {
        username,
        passwordHash,
        fullName,
        email,
        phone: phoneByRole(role),
        role,
        isActive: true,
      },
      select: { id: true },
    });
    result[username] = user;
  }
  return result;
}

async function seedCatalog() {
  const serviceRows = [
    {
      name: 'Bảo dưỡng định kỳ cấp 1',
      description: 'Kiểm tra tổng quát, thay dầu và vệ sinh khoang máy.',
      unitPrice: 450000,
      durationMin: 90,
    },
    {
      name: 'Thay dầu động cơ và lọc dầu',
      description: 'Thay dầu 5W-30 và lọc dầu chính hãng.',
      unitPrice: 280000,
      durationMin: 45,
    },
    {
      name: 'Kiểm tra hệ thống phanh',
      description: 'Kiểm tra má phanh, dầu phanh và cân chỉnh phanh.',
      unitPrice: 350000,
      durationMin: 60,
    },
    {
      name: 'Vệ sinh kim phun buồng đốt',
      description: 'Vệ sinh chuyên sâu giúp động cơ vận hành ổn định.',
      unitPrice: 650000,
      durationMin: 120,
    },
    {
      name: 'Cân chỉnh thước lái',
      description: 'Cân chỉnh góc đặt bánh xe bằng thiết bị chuyên dụng.',
      unitPrice: 420000,
      durationMin: 75,
    },
    {
      name: 'Nạp gas điều hòa',
      description: 'Hút chân không và nạp gas điều hòa theo tiêu chuẩn.',
      unitPrice: 380000,
      durationMin: 45,
    },
  ];

  const services: Record<string, { id: string }> = {};
  for (const row of serviceRows) {
    const service = await prisma.service.create({
      data: row,
      select: { id: true },
    });
    services[row.name] = service;
  }

  return services;
}

async function seedPartsWithLedger(performedBy: string) {
  const partRows = [
    {
      partNumber: 'OIL-5W30-4L',
      name: 'Dầu nhớt tổng hợp 5W-30 4L',
      unit: 'can',
      unitCost: 185000,
      unitPrice: 260000,
      stockQuantity: 32,
      reorderLevel: 10,
    },
    {
      partNumber: 'FILTER-OIL-01',
      name: 'Lọc dầu động cơ Toyota/Honda',
      unit: 'cái',
      unitCost: 42000,
      unitPrice: 70000,
      stockQuantity: 28,
      reorderLevel: 8,
    },
    {
      partNumber: 'FILTER-AIR-01',
      name: 'Lọc gió động cơ',
      unit: 'cái',
      unitCost: 65000,
      unitPrice: 110000,
      stockQuantity: 16,
      reorderLevel: 6,
    },
    {
      partNumber: 'BRAKE-PAD-F01',
      name: 'Má phanh trước sedan',
      unit: 'bộ',
      unitCost: 220000,
      unitPrice: 360000,
      stockQuantity: 9,
      reorderLevel: 4,
    },
    {
      partNumber: 'SPARK-PLUG-IR',
      name: 'Bugi Iridium',
      unit: 'cái',
      unitCost: 95000,
      unitPrice: 150000,
      stockQuantity: 24,
      reorderLevel: 8,
    },
    {
      partNumber: 'AC-FILTER-01',
      name: 'Lọc gió điều hòa',
      unit: 'cái',
      unitCost: 55000,
      unitPrice: 95000,
      stockQuantity: 2,
      reorderLevel: 5,
    },
  ];

  const parts: Record<
    string,
    { id: string; unitPrice: number; stockQuantity: number }
  > = {};
  for (const row of partRows) {
    const part = await prisma.part.create({
      data: row,
      select: { id: true, unitPrice: true, stockQuantity: true },
    });
    await prisma.inventoryTransaction.create({
      data: {
        partId: part.id,
        type: TransactionType.Adjustment,
        quantityDelta: row.stockQuantity,
        note: 'Tồn đầu kỳ dữ liệu demo',
        performedBy,
      },
    });
    parts[row.partNumber] = {
      id: part.id,
      unitPrice: Number(part.unitPrice),
      stockQuantity: part.stockQuantity,
    };
  }
  return parts;
}

async function seedCustomers() {
  const individual = await prisma.customer.create({
    data: {
      fullName: 'Nguyễn Văn An',
      phone: '0901234567',
      email: 'an.nguyen@example.com',
      address: '12 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh',
      type: 'Individual',
      notes: 'Khách hàng thân thiết, ưu tiên nhắc lịch bảo dưỡng định kỳ.',
    },
    select: { id: true },
  });
  const corporate = await prisma.customer.create({
    data: {
      fullName: 'Lê Thu Hà',
      phone: '0912345678',
      email: 'fleet@minhphat.vn',
      address: '88 Lê Văn Việt, TP. Thủ Đức, TP. Hồ Chí Minh',
      type: 'Corporate',
      companyName: 'Công ty TNHH Vận tải Minh Phát',
      taxCode: '0312345678',
      notes: 'Đội xe giao hàng nội thành.',
    },
    select: { id: true },
  });
  const vip = await prisma.customer.create({
    data: {
      fullName: 'Phạm Gia Bảo',
      phone: '0987654321',
      email: 'bao.pham@example.com',
      address: '25 Trần Phú, Quận Hải Châu, Đà Nẵng',
      type: 'Individual',
      notes: 'Xe thường xuyên đi đường dài.',
    },
    select: { id: true },
  });

  return { individual, corporate, vip };
}

async function seedVehicles(
  customers: Awaited<ReturnType<typeof seedCustomers>>,
) {
  const camry = await prisma.vehicle.create({
    data: {
      customerId: customers.individual.id,
      licensePlate: '51G-246.80',
      make: 'Toyota',
      model: 'Camry',
      year: 2021,
      color: 'Đen',
      vin: 'JTNB11HK5M3012345',
      mileage: 46500,
    },
    select: { id: true },
  });
  const city = await prisma.vehicle.create({
    data: {
      customerId: customers.corporate.id,
      licensePlate: '51F-888.12',
      make: 'Honda',
      model: 'City',
      year: 2022,
      color: 'Trắng',
      vin: 'MRHGM6660NP012345',
      mileage: 38200,
    },
    select: { id: true },
  });
  const transit = await prisma.vehicle.create({
    data: {
      customerId: customers.corporate.id,
      licensePlate: '51D-456.78',
      make: 'Ford',
      model: 'Transit',
      year: 2020,
      color: 'Bạc',
      vin: 'NM0EXXTTRELU12345',
      mileage: 90500,
    },
    select: { id: true },
  });
  const cx5 = await prisma.vehicle.create({
    data: {
      customerId: customers.vip.id,
      licensePlate: '43A-999.99',
      make: 'Mazda',
      model: 'CX-5',
      year: 2023,
      color: 'Đỏ',
      vin: 'JM7KF4WLAJ0123456',
      mileage: 22100,
    },
    select: { id: true },
  });

  return { camry, city, transit, cx5 };
}

async function seedAppointments(
  vehicles: Awaited<ReturnType<typeof seedVehicles>>,
  advisorId: string,
) {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const yesterday = addDays(today, -1);

  await prisma.appointment.createMany({
    data: [
      {
        vehicleId: vehicles.camry.id,
        scheduledAt: setHour(today, 9).toISOString(),
        serviceNote: 'Bảo dưỡng định kỳ và kiểm tra tiếng kêu gầm.',
        status: AppointmentStatus.Scheduled,
        createdBy: advisorId,
      },
      {
        vehicleId: vehicles.city.id,
        scheduledAt: setHour(tomorrow, 14).toISOString(),
        serviceNote: 'Kiểm tra điều hòa không đủ lạnh.',
        status: AppointmentStatus.Scheduled,
        createdBy: advisorId,
      },
      {
        vehicleId: vehicles.transit.id,
        scheduledAt: setHour(yesterday, 10).toISOString(),
        serviceNote: 'Xe đã đến xưởng để kiểm tra phanh.',
        status: AppointmentStatus.Arrived,
        createdBy: advisorId,
      },
      {
        vehicleId: vehicles.cx5.id,
        scheduledAt: setHour(addDays(today, 3), 8).toISOString(),
        serviceNote: 'Khách hủy lịch do đổi kế hoạch.',
        status: AppointmentStatus.Cancelled,
        createdBy: advisorId,
      },
    ],
  });
}

async function seedWorkOrders(input: {
  vehicles: Awaited<ReturnType<typeof seedVehicles>>;
  services: Awaited<ReturnType<typeof seedCatalog>>;
  parts: Awaited<ReturnType<typeof seedPartsWithLedger>>;
  users: {
    advisorId: string;
    technicianId: string;
    cashierId: string;
    adminId: string;
  };
}) {
  const { vehicles, services, parts, users } = input;

  await createWorkOrder({
    vehicleId: vehicles.transit.id,
    status: WorkOrderStatus.Repairing,
    diagnosis:
      'Má phanh trước mòn không đều, cần thay mới và kiểm tra dầu phanh.',
    advisorId: users.advisorId,
    technicianId: users.technicianId,
    items: [
      {
        serviceId: services['Kiểm tra hệ thống phanh'].id,
        description: 'Kiểm tra hệ thống phanh',
        quantity: 1,
        unitPrice: 350000,
        usages: [
          { partId: parts['BRAKE-PAD-F01'].id, quantity: 1, unitPrice: 360000 },
        ],
      },
    ],
    performedBy: users.adminId,
  });

  await createWorkOrder({
    vehicleId: vehicles.city.id,
    status: WorkOrderStatus.ReadyForDelivery,
    diagnosis: 'Điều hòa yếu lạnh, đã vệ sinh lọc gió và nạp gas.',
    advisorId: users.advisorId,
    technicianId: users.technicianId,
    items: [
      {
        serviceId: services['Nạp gas điều hòa'].id,
        description: 'Nạp gas điều hòa',
        quantity: 1,
        unitPrice: 380000,
        usages: [
          { partId: parts['AC-FILTER-01'].id, quantity: 1, unitPrice: 95000 },
        ],
      },
    ],
    invoice: {
      paid: false,
      discount: 0,
      tax: 0,
      notes: 'Chờ khách xác nhận thanh toán.',
    },
    performedBy: users.adminId,
  });

  await createWorkOrder({
    vehicleId: vehicles.camry.id,
    status: WorkOrderStatus.Delivered,
    diagnosis: 'Bảo dưỡng định kỳ cấp 1 hoàn tất, xe vận hành ổn định.',
    advisorId: users.advisorId,
    technicianId: users.technicianId,
    deliveredAt: addDays(new Date(), -2),
    items: [
      {
        serviceId: services['Bảo dưỡng định kỳ cấp 1'].id,
        description: 'Bảo dưỡng định kỳ cấp 1',
        quantity: 1,
        unitPrice: 450000,
        usages: [
          { partId: parts['OIL-5W30-4L'].id, quantity: 1, unitPrice: 260000 },
          { partId: parts['FILTER-OIL-01'].id, quantity: 1, unitPrice: 70000 },
        ],
      },
    ],
    invoice: {
      paid: true,
      discount: 30000,
      tax: 0,
      notes: 'Khách thanh toán tiền mặt.',
      receivedBy: users.cashierId,
    },
    performedBy: users.adminId,
  });

  await createWorkOrder({
    vehicleId: vehicles.cx5.id,
    status: WorkOrderStatus.Delivered,
    diagnosis: 'Cân chỉnh thước lái và kiểm tra lốp hoàn tất.',
    advisorId: users.advisorId,
    technicianId: users.technicianId,
    deliveredAt: new Date(),
    items: [
      {
        serviceId: services['Cân chỉnh thước lái'].id,
        description: 'Cân chỉnh thước lái',
        quantity: 1,
        unitPrice: 420000,
        usages: [],
      },
    ],
    invoice: {
      paid: true,
      discount: 0,
      tax: 0,
      notes: 'Thanh toán chuyển khoản.',
      receivedBy: users.cashierId,
    },
    performedBy: users.adminId,
  });
}

async function createWorkOrder(input: {
  vehicleId: string;
  status: WorkOrderStatus;
  diagnosis: string;
  advisorId: string;
  technicianId: string;
  deliveredAt?: Date;
  items: Array<{
    serviceId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    usages: Array<{ partId: string; quantity: number; unitPrice: number }>;
  }>;
  invoice?: {
    paid: boolean;
    discount: number;
    tax: number;
    notes: string;
    receivedBy?: string;
  };
  performedBy: string;
}) {
  const workOrder = await prisma.workOrder.create({
    data: {
      vehicleId: input.vehicleId,
      status: input.status,
      diagnosis: input.diagnosis,
      advisorId: input.advisorId,
      technicianId: input.technicianId,
      receivedAt: addDays(new Date(), -4),
      deliveredAt: input.deliveredAt,
    },
    select: { id: true },
  });

  const invoiceLines: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }> = [];

  for (const item of input.items) {
    const amount = item.quantity * item.unitPrice;
    const workOrderItem = await prisma.workOrderItem.create({
      data: {
        workOrderId: workOrder.id,
        serviceId: item.serviceId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount,
      },
      select: { id: true },
    });
    invoiceLines.push({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount,
    });

    for (const usage of item.usages) {
      const partUsage = await prisma.partUsage.create({
        data: {
          workOrderItemId: workOrderItem.id,
          partId: usage.partId,
          quantity: usage.quantity,
          unitPrice: usage.unitPrice,
        },
        select: { id: true },
      });
      await prisma.part.update({
        where: { id: usage.partId },
        data: { stockQuantity: { decrement: usage.quantity } },
      });
      await prisma.inventoryTransaction.create({
        data: {
          partId: usage.partId,
          type: TransactionType.Export,
          quantityDelta: -usage.quantity,
          referenceId: partUsage.id,
          note: `Sử dụng phụ tùng cho phiếu ${workOrder.id}`,
          performedBy: input.performedBy,
        },
      });
      invoiceLines.push({
        description: `Phụ tùng sử dụng`,
        quantity: usage.quantity,
        unitPrice: usage.unitPrice,
        amount: usage.quantity * usage.unitPrice,
      });
    }
  }

  if (input.invoice) {
    const subtotal = invoiceLines.reduce((sum, line) => sum + line.amount, 0);
    const totalAmount = subtotal - input.invoice.discount + input.invoice.tax;
    const invoice = await prisma.invoice.create({
      data: {
        workOrderId: workOrder.id,
        status: input.invoice.paid ? InvoiceStatus.Paid : InvoiceStatus.Unpaid,
        totalAmount,
        discount: input.invoice.discount,
        tax: input.invoice.tax,
        notes: input.invoice.notes,
        paidAt: input.invoice.paid ? new Date() : null,
        lines: {
          create: invoiceLines,
        },
      },
      select: { id: true },
    });

    if (input.invoice.paid) {
      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: totalAmount,
          method: input.invoice.notes.includes('chuyển khoản')
            ? PaymentMethod.BankTransfer
            : PaymentMethod.Cash,
          transactionRef: input.invoice.notes.includes('chuyển khoản')
            ? 'DEMO-BANK-0001'
            : null,
          receivedBy: input.invoice.receivedBy,
        },
      });
    }
  }

  return workOrder;
}

async function seedReminders(
  customers: Awaited<ReturnType<typeof seedCustomers>>,
  vehicles: Awaited<ReturnType<typeof seedVehicles>>,
) {
  await prisma.maintenanceReminder.createMany({
    data: [
      {
        customerId: customers.individual.id,
        vehicleId: vehicles.camry.id,
        dueDate: addDays(new Date(), 30),
        message: 'Nhắc khách bảo dưỡng mốc 50.000 km và kiểm tra lốp.',
        isSent: false,
      },
      {
        customerId: customers.corporate.id,
        vehicleId: vehicles.city.id,
        dueDate: addDays(new Date(), -1),
        message: 'Nhắc lịch kiểm tra điều hòa sau sửa chữa.',
        isSent: true,
        sentAt: new Date(),
      },
    ],
  });
}

async function seedAuditLogs(adminId: string) {
  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminId,
        action: 'CREATE',
        entity: 'Customer',
        entityId: null,
        after: { fullName: 'Nguyễn Văn An', phone: '0901234567' },
        ipAddress: '127.0.0.1',
        userAgent: 'Demo Seed',
      },
      {
        userId: adminId,
        action: 'UPDATE',
        entity: 'WorkOrder',
        entityId: null,
        after: { status: 'Delivered', note: 'Dữ liệu demo' },
        ipAddress: '127.0.0.1',
        userAgent: 'Demo Seed',
      },
    ],
  });
}

function parseMode(value?: string): SeedMode {
  if (value === 'e2e' || value === 'demo') return value;
  return 'demo';
}

function phoneByRole(role: Role) {
  const phones: Record<Role, string> = {
    Admin: '0900000001',
    ServiceAdvisor: '0900000002',
    Technician: '0900000003',
    InventoryClerk: '0900000004',
    Cashier: '0900000005',
    Manager: '0900000006',
  };
  return phones[role];
}

function addDays(value: Date, days: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

function setHour(value: Date, hour: number) {
  const next = new Date(value);
  next.setHours(hour, 0, 0, 0);
  return next;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
