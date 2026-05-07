const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Starting database seeding...\n');

    console.log('📍 Creating branches...');
    const branchesData = [
      {
        name: 'Barber Shop Downtown',
        address: '123 Main Street',
        phone: '+84912345678',
        email: 'downtown@barbershop.com',
        city: 'Hà Nội',
        district: 'Ba Đình',
        openingTime: new Date('2024-01-01 08:00:00'),
        closingTime: new Date('2024-01-01 19:00:00'),
        isActive: true,
      },
      {
        name: 'Barber Shop Uptown',
        address: '456 Park Avenue',
        phone: '+84987654321',
        email: 'uptown@barbershop.com',
        city: 'Hà Nội',
        district: 'Cầu Giấy',
        openingTime: new Date('2024-01-01 09:00:00'),
        closingTime: new Date('2024-01-01 20:00:00'),
        isActive: true,
      },
    ];

    await prisma.branch.createMany({ data: branchesData });
    const branchDowntown = await prisma.branch.findFirst({ where: { name: 'Barber Shop Downtown' } });
    const branchUptown = await prisma.branch.findFirst({ where: { name: 'Barber Shop Uptown' } });
    console.log('✅ branches created\n');

    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const admin = await prisma.user.create({ data: { username: 'admin', email: 'admin@barbershop.com', passwordHash: hashedPassword, firstName: 'Admin', lastName: 'User', phone: '+84912345678', role: 'admin', isActive: true, isVerified: true } });

    const barberJohn = await prisma.user.create({ data: { username: 'barber_john', email: 'john@barbershop.com', passwordHash: hashedPassword, firstName: 'John', lastName: 'Nguyen', phone: '+84912345679', role: 'staff', isActive: true, isVerified: true } });

    const barberMike = await prisma.user.create({ data: { username: 'barber_mike', email: 'mike@barbershop.com', passwordHash: hashedPassword, firstName: 'Mike', lastName: 'Tran', phone: '+84912345680', role: 'staff', isActive: true, isVerified: true } });

    const customer1 = await prisma.user.create({ data: { username: 'customer_1', email: 'customer1@email.com', passwordHash: hashedPassword, firstName: 'Hùng', lastName: 'Lê', phone: '+84912345681', role: 'customer', isActive: true, isVerified: true } });

    const customer2 = await prisma.user.create({ data: { username: 'customer_2', email: 'customer2@email.com', passwordHash: hashedPassword, firstName: 'Minh', lastName: 'Đặng', phone: '+84912345682', role: 'customer', isActive: true, isVerified: true } });

    console.log('✅ 5 users created\n');

    console.log('💇 Creating barber profiles...');
    const barberProfile1 = await prisma.barber.create({ data: { branchId: branchDowntown.id, userId: barberJohn.id, specialization: 'Modern & Fade Haircuts', experienceYears: 5, rating: 4.9, bio: 'Experienced barber with 5 years in the industry', isActive: true, isAvailable: true } });

    const barberProfile2 = await prisma.barber.create({ data: { branchId: branchUptown.id, userId: barberMike.id, specialization: 'Traditional & Classic Styles', experienceYears: 7, rating: 4.8, bio: 'Master barber with traditional barbering expertise', isActive: true, isAvailable: true } });

    console.log('✅ 2 barber profiles created\n');

    console.log('✂️ Creating services...');
    const serviceTemplates = [
      { name: "Men's Haircut", description: "Classic men's haircut with scissors", price: 150000, durationMinutes: 30, category: 'Haircut', orderIndex: 1 },
      { name: 'Fade Haircut', description: 'Modern fade haircut', price: 180000, durationMinutes: 40, category: 'Haircut', orderIndex: 2 },
      { name: 'Beard Trim', description: 'Professional beard trimming and shaping', price: 100000, durationMinutes: 20, category: 'Beard', orderIndex: 3 },
      { name: 'Hair & Beard Package', description: 'Haircut + Beard trim combo', price: 250000, durationMinutes: 50, category: 'Package', orderIndex: 4 },
      { name: 'Hair Coloring', description: 'Hair coloring service', price: 300000, durationMinutes: 60, category: 'Coloring', orderIndex: 5 },
    ];

    const servicesDowntown = await Promise.all(serviceTemplates.map((service) => prisma.service.create({ data: { branchId: branchDowntown.id, ...service } })));
    const servicesUptown = await Promise.all(serviceTemplates.map((service) => prisma.service.create({ data: { branchId: branchUptown.id, ...service } })));
    console.log('✅ 10 services created\n');

    console.log('⏰ Creating time slots...');
    const timeSlotTimes = [
      { start: '08:00', end: '08:30' },
      { start: '08:30', end: '09:00' },
      { start: '09:00', end: '09:30' },
      { start: '09:30', end: '10:00' },
      { start: '10:00', end: '10:30' },
      { start: '10:30', end: '11:00' },
      { start: '14:00', end: '14:30' },
      { start: '14:30', end: '15:00' },
      { start: '15:00', end: '15:30' },
      { start: '15:30', end: '16:00' },
    ];

    const slots = [];
    for (const branch of [branchDowntown, branchUptown]) {
      for (const time of timeSlotTimes) {
        const s = await prisma.timeSlot.create({ data: { branchId: branch.id, startTime: new Date(`2024-01-01 ${time.start}:00`), endTime: new Date(`2024-01-01 ${time.end}:00`), durationMinutes: 30, isActive: true } });
        slots.push(s);
      }
    }

    console.log('✅ time slots created\n');

    console.log('🕐 Creating working hours...');
    const workingHoursTemplate = [
      { dayOfWeek: 0, startTime: '08:00', endTime: '19:00', isOpen: true },
      { dayOfWeek: 1, startTime: '08:00', endTime: '19:00', isOpen: true },
      { dayOfWeek: 2, startTime: '08:00', endTime: '19:00', isOpen: true },
      { dayOfWeek: 3, startTime: '08:00', endTime: '19:00', isOpen: true },
      { dayOfWeek: 4, startTime: '08:00', endTime: '19:00', isOpen: true },
      { dayOfWeek: 5, startTime: '08:00', endTime: '20:00', isOpen: true },
      { dayOfWeek: 6, startTime: '09:00', endTime: '18:00', isOpen: true },
    ];

    for (const branch of [branchDowntown, branchUptown]) {
      for (const wh of workingHoursTemplate) {
        await prisma.workingHour.create({ data: { branchId: branch.id, dayOfWeek: wh.dayOfWeek, startTime: new Date(`2024-01-01 ${wh.startTime}:00`), endTime: new Date(`2024-01-01 ${wh.endTime}:00`), isOpen: wh.isOpen } });
      }
    }

    console.log('✅ working hours created\n');

    console.log('📅 Creating sample bookings...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const booking1 = await prisma.booking.create({ data: { customerId: customer1.id, barberId: barberProfile1.id, branchId: branchDowntown.id, bookingDate: tomorrow, startTime: new Date('2024-01-01 09:00:00'), endTime: new Date('2024-01-01 09:30:00'), totalAmount: 0, notes: 'Regular haircut', status: 'confirmed', bookingServices: { create: [ { serviceId: servicesDowntown[0].id, quantity: 1, unitPrice: 150000, subtotal: 150000 } ] } }, include: { bookingServices: true } });

    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const booking2 = await prisma.booking.create({ data: { customerId: customer2.id, barberId: barberProfile2.id, branchId: branchUptown.id, bookingDate: dayAfterTomorrow, startTime: new Date('2024-01-01 14:00:00'), endTime: new Date('2024-01-01 14:50:00'), totalAmount: 0, notes: 'Haircut and beard trim', status: 'pending', bookingServices: { create: [ { serviceId: servicesUptown[3].id, quantity: 1, unitPrice: 250000, subtotal: 250000 } ] } }, include: { bookingServices: true } });

    console.log('✅ 2 sample bookings created\n');

    console.log('💳 Creating sample payments...');
    await prisma.payment.create({ data: { bookingId: booking1.id, amount: 150000, paymentMethod: 'cash', paymentStatus: 'pending' } });
    await prisma.payment.create({ data: { bookingId: booking2.id, amount: 250000, paymentMethod: 'card', paymentStatus: 'pending' } });

    console.log('✨ Database seeding completed successfully!\n');
    console.log('🔑 Login Credentials: Admin: username "admin" / email "admin@barbershop.com", password "password123"');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
