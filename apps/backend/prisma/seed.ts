import { PrismaClient, Role } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { hashPassword } from "better-auth/crypto";

const rootPath = path.resolve(__dirname, '..', '..', '..', '.env');
dotenv.config({ path: rootPath });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting to seed STI Cubao RACA data...');

  const adminEmail = 'admin@sticubao.edu.ph';
  const hashedPassword = await hashPassword('nightingale@1435'); 

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Department Head',
      password: hashedPassword,
      role: Role.ADMIN,
      emailVerified: true,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    },
  });
  console.log(`👤 Admin account created: ${adminEmail}`);

  const roomsData = [
    { name: 'Room 101 (ComLab)', floor: 'Ground', type: 'Laboratory' },
    { name: 'Ground Floor Lobby', floor: 'Ground', type: 'Common Area' },
    { name: 'GYM', floor: '8th', type: 'Facility' },
    { name: 'Multipurpose Hall (MPH)', floor: '7th', type: 'Event Space' },
    { name: '6th Floor Library', floor: '6th', type: 'Facility' },
    ...Array.from({ length: 11 }, (_, i) => ({
      name: `Room ${201 + i}`, floor: '2nd', type: 'Lecture Room'
    })),
    ...Array.from({ length: 11 }, (_, i) => ({
      name: `Room ${301 + i}`, floor: '3rd', type: 'Lecture Room'
    })),
    ...Array.from({ length: 11 }, (_, i) => ({
      name: `Room ${401 + i}`, floor: '4th', type: 'Lecture Room'
    })),
    { name: 'Room 501', floor: '5th', type: 'Lecture Room' },
    { name: 'Room 502 (Broadcasting Room)', floor: '5th', type: 'Laboratory' },
    { name: 'Room 503 (Kitchen Lab)', floor: '5th', type: 'Laboratory' },
    ...Array.from({ length: 4 }, (_, i) => ({
      name: `Room ${504 + i} (ComLab)`, floor: '5th', type: 'Laboratory'
    })),
  ];

  console.log('🏫 Seeding rooms...');
  for (const room of roomsData) {
    await prisma.room.upsert({
      where: { name: room.name },
      update: {
        floor: room.floor,
        type: room.type,
        capacity: room.type === 'Laboratory' ? 40 : (room.name === 'GYM' ? 500 : 45) 
      },
      create: { 
        name: room.name, 
        type: room.type || 'Lecture Room', 
        capacity: room.type === 'Laboratory' ? 40 : (room.name === 'GYM' ? 500 : 45),
        floor: room.floor 
      },
    });
  }

  const inventoryData = [
    { name: 'Movable TV', quantity: 2},
    { name: 'Movable Speaker', quantity: 1 },
    { name: 'Bluetooth Microphone', quantity: 4 },
    { name: 'Projector', quantity: 4 },
    { name: 'Extension Cord', quantity: 4 },
  ];

  console.log('📦 Seeding inventory...');
  for (const item of inventoryData) {
    await prisma.item.upsert({
      where: { name: item.name },
      update: { quantity: item.quantity },
      create: item,
    });
  }

  console.log('📝 Seeding sample requests...');
  const firstRoom = await prisma.room.findFirst({
    where: { name: 'Room 101 (ComLab)' }
  });

  if (firstRoom && admin) {
    const existingRequest = await prisma.request.findFirst({
      where: { title: 'Urgent ComLab Reservation' }
    });

    if (!existingRequest) {
      await prisma.request.create({
        data: {
          title: 'Urgent ComLab Reservation',
          description: 'Need for specialized software testing.',
          status: 'PENDING',
          userId: admin.id,
          roomId: firstRoom.id,
        }
      });
      console.log('✅ Sample request created.');
    } else {
      console.log('⏭️ Sample request already exists, skipping...');
    }
  }

  console.log('✅ STI Cubao RACA Database Seeded Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });