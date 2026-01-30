import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Začínám seedování databáze...');

  // Smazat existující data
  console.log('🗑️  Mažu existující data...');
  await prisma.booking.deleteMany();
  await prisma.blockedTime.deleteMany();
  await prisma.workingHours.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  // Hasho heslo pro všechny uživatele
  const hashedPassword = await bcrypt.hash('password123', 10);

  // ==================== RESTAURACE ====================
  console.log('🍽️  Vytvářím restauraci...');

  const restaurantTenant = await prisma.tenant.create({
    data: {
      slug: 'restaurant-test',
      name: 'Testovací Restaurace',
      email: 'restaurant@test.cz',
      phone: '+420 777 111 222',
      primaryColor: '#E63946',
      category: 'RESTAURANT',
      categoryData: {
        tableCount: 15,
        seatingCapacity: 60,
        cuisineType: 'Česká kuchyně',
      },
    },
  });

  const restaurantUser = await prisma.user.create({
    data: {
      email: 'restaurant@test.cz',
      password: hashedPassword,
      name: 'Restaurant Owner',
      role: 'tenant',
      tenantId: restaurantTenant.id,
    },
  });

  await prisma.service.createMany({
    data: [
      {
        tenantId: restaurantTenant.id,
        name: 'Večeře pro 2 osoby',
        duration: 120,
        price: 0,
        description: 'Rezervace stolu na večeři',
        active: true,
        serviceData: { personCount: 2 },
      },
      {
        tenantId: restaurantTenant.id,
        name: 'Večeře pro 4 osoby',
        duration: 120,
        price: 0,
        description: 'Rezervace stolu pro rodinu',
        active: true,
        serviceData: { personCount: 4 },
      },
      {
        tenantId: restaurantTenant.id,
        name: 'Oběd pro 2 osoby',
        duration: 90,
        price: 0,
        description: 'Rezervace stolu na oběd',
        active: true,
        serviceData: { personCount: 2 },
      },
    ],
  });

  await createWorkingHours(restaurantTenant.id, '11:00', '22:00');

  // ==================== WELLNESS & SPA ====================
  console.log('💆 Vytvářím wellness centrum...');

  const wellnessTenant = await prisma.tenant.create({
    data: {
      slug: 'wellness-test',
      name: 'Testovací Wellness',
      email: 'wellness@test.cz',
      phone: '+420 777 222 333',
      primaryColor: '#06D6A0',
      category: 'WELLNESS_SPA',
      categoryData: {
        roomCount: 5,
        procedureTypes: ['Masáž', 'Sauna', 'Baňkování', 'Reflexní terapie'],
        therapists: [
          { id: '1', name: 'Jana Nováková' },
          { id: '2', name: 'Petra Svobodová' },
        ],
      },
    },
  });

  const wellnessUser = await prisma.user.create({
    data: {
      email: 'wellness@test.cz',
      password: hashedPassword,
      name: 'Wellness Owner',
      role: 'tenant',
      tenantId: wellnessTenant.id,
    },
  });

  await prisma.service.createMany({
    data: [
      {
        tenantId: wellnessTenant.id,
        name: 'Masáž 60 min',
        duration: 60,
        price: 800,
        description: 'Relaxační masáž celého těla',
        active: true,
        serviceData: { procedureType: 'Masáž' },
      },
      {
        tenantId: wellnessTenant.id,
        name: 'Masáž 90 min',
        duration: 90,
        price: 1100,
        description: 'Prodloužená relaxační masáž',
        active: true,
        serviceData: { procedureType: 'Masáž' },
      },
      {
        tenantId: wellnessTenant.id,
        name: 'Sauna',
        duration: 45,
        price: 300,
        description: 'Soukromá sauna',
        active: true,
        serviceData: { procedureType: 'Sauna' },
      },
      {
        tenantId: wellnessTenant.id,
        name: 'Reflexní terapie',
        duration: 50,
        price: 600,
        description: 'Terapie chodidel',
        active: true,
        serviceData: { procedureType: 'Reflexní terapie' },
      },
    ],
  });

  await createWorkingHours(wellnessTenant.id, '09:00', '20:00');

  // ==================== KADEŘNICTVÍ ====================
  console.log('✂️  Vytvářím kadeřnictví...');

  const barbershopTenant = await prisma.tenant.create({
    data: {
      slug: 'barbershop-test',
      name: 'Testovací Barbershop',
      email: 'barbershop@test.cz',
      phone: '+420 777 333 444',
      primaryColor: '#F72585',
      category: 'BARBERSHOP',
      categoryData: {
        chairCount: 4,
        stylists: [
          { id: '1', name: 'Lukáš Černý', specialties: ['Pánské střihy', 'Holení'] },
          { id: '2', name: 'Martina Bílá', specialties: ['Dámské střihy', 'Barvy'] },
          { id: '3', name: 'Jan Dvořák', specialties: ['Dětské střihy'] },
        ],
      },
    },
  });

  const barbershopUser = await prisma.user.create({
    data: {
      email: 'barbershop@test.cz',
      password: hashedPassword,
      name: 'Barbershop Owner',
      role: 'tenant',
      tenantId: barbershopTenant.id,
    },
  });

  await prisma.service.createMany({
    data: [
      {
        tenantId: barbershopTenant.id,
        name: 'Pánský střih',
        duration: 30,
        price: 400,
        description: 'Klasický pánský střih',
        active: true,
        serviceData: { serviceType: 'Pánský střih' },
      },
      {
        tenantId: barbershopTenant.id,
        name: 'Dámský střih',
        duration: 60,
        price: 600,
        description: 'Dámský střih a styling',
        active: true,
        serviceData: { serviceType: 'Dámský střih' },
      },
      {
        tenantId: barbershopTenant.id,
        name: 'Barva',
        duration: 90,
        price: 1200,
        description: 'Barvení vlasů',
        active: true,
        serviceData: { serviceType: 'Barva' },
      },
      {
        tenantId: barbershopTenant.id,
        name: 'Holení',
        duration: 20,
        price: 250,
        description: 'Tradiční holení břitvou',
        active: true,
        serviceData: { serviceType: 'Holení' },
      },
    ],
  });

  await createWorkingHours(barbershopTenant.id, '08:00', '19:00');

  // ==================== FITNESS ====================
  console.log('🏋️  Vytvářím fitness centrum...');

  const fitnessTenant = await prisma.tenant.create({
    data: {
      slug: 'fitness-test',
      name: 'Testovací Fitness',
      email: 'fitness@test.cz',
      phone: '+420 777 444 555',
      primaryColor: '#F77F00',
      category: 'FITNESS_SPORT',
      categoryData: {
        trainers: [
          { id: '1', name: 'Tomáš Silný', specialties: ['Posilování', 'CrossFit'] },
          { id: '2', name: 'Eva Fit', specialties: ['Yoga', 'Pilates'] },
          { id: '3', name: 'Martin Sport', specialties: ['Spinning', 'HIIT'] },
        ],
        activityTypes: ['Osobní trénink', 'Skupinová lekce', 'Yoga', 'Pilates', 'Spinning'],
        groupSizeLimit: 12,
      },
    },
  });

  const fitnessUser = await prisma.user.create({
    data: {
      email: 'fitness@test.cz',
      password: hashedPassword,
      name: 'Fitness Owner',
      role: 'tenant',
      tenantId: fitnessTenant.id,
    },
  });

  await prisma.service.createMany({
    data: [
      {
        tenantId: fitnessTenant.id,
        name: 'Osobní trénink 60 min',
        duration: 60,
        price: 500,
        description: 'Individuální trénink s trenérem',
        active: true,
        serviceData: { activityType: 'Osobní trénink' },
      },
      {
        tenantId: fitnessTenant.id,
        name: 'Yoga lekce',
        duration: 75,
        price: 200,
        description: 'Skupinová yoga lekce',
        active: true,
        serviceData: { activityType: 'Yoga', isGroup: true },
      },
      {
        tenantId: fitnessTenant.id,
        name: 'Pilates lekce',
        duration: 60,
        price: 200,
        description: 'Skupinová pilates lekce',
        active: true,
        serviceData: { activityType: 'Pilates', isGroup: true },
      },
      {
        tenantId: fitnessTenant.id,
        name: 'Spinning 45 min',
        duration: 45,
        price: 150,
        description: 'Intenzivní spinning lekce',
        active: true,
        serviceData: { activityType: 'Spinning', isGroup: true },
      },
    ],
  });

  await createWorkingHours(fitnessTenant.id, '06:00', '21:00');

  console.log('✅ Seedování dokončeno!');
  console.log('\n📝 Přihlašovací údaje:');
  console.log('   Restaurace: restaurant@test.cz / password123');
  console.log('   Wellness: wellness@test.cz / password123');
  console.log('   Kadeřnictví: barbershop@test.cz / password123');
  console.log('   Fitness: fitness@test.cz / password123');
  console.log('\n🌐 Veřejné URL tenanů:');
  console.log('   http://localhost:3000/restaurant-test');
  console.log('   http://localhost:3000/wellness-test');
  console.log('   http://localhost:3000/barbershop-test');
  console.log('   http://localhost:3000/fitness-test');
}

async function createWorkingHours(tenantId: string, startTime: string, endTime: string) {
  const workingHoursData = [
    { tenantId, dayOfWeek: 1, startTime, endTime, isWorking: true }, // Pondělí
    { tenantId, dayOfWeek: 2, startTime, endTime, isWorking: true }, // Úterý
    { tenantId, dayOfWeek: 3, startTime, endTime, isWorking: true }, // Středa
    { tenantId, dayOfWeek: 4, startTime, endTime, isWorking: true }, // Čtvrtek
    { tenantId, dayOfWeek: 5, startTime, endTime, isWorking: true }, // Pátek
    { tenantId, dayOfWeek: 6, startTime: '10:00', endTime: '16:00', isWorking: true }, // Sobota
    { tenantId, dayOfWeek: 0, startTime: '10:00', endTime: '14:00', isWorking: false }, // Neděle - zavřeno
  ];

  await prisma.workingHours.createMany({ data: workingHoursData });
}

main()
  .catch((e) => {
    console.error('❌ Chyba při seedování:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
