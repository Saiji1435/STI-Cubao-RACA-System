import { PrismaClient, Role, ItemCondition } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { hashPassword } from "better-auth/crypto";

// Pathing to your root .env file
const rootPath = path.resolve(__dirname, '..', '..', '..', '.env');
dotenv.config({ path: rootPath });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting to seed STI Cubao RACA data...');

  // --- 1. ADMIN ACCOUNT ---
  const adminEmail = 'Saiji_Admin@sticubao.edu.ph';
  const hashedPassword = await hashPassword('nightingale@1435'); 

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword },
    create: {
      email: adminEmail,
      name: 'Department Head',
      password: hashedPassword,
      role: Role.ADMIN,
      emailVerified: true,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    },
  });
  console.log(`👤 Admin account synced: ${adminEmail}`);

// --- 2. ROOMS ---
  const roomsData = [
    { name: 'Room 101 (ComLab)', floor: 'Ground', type: 'Laboratory' },
    { name: 'Ground Floor Lobby', floor: 'Ground', type: 'Common Area' },
    { name: 'GYM', floor: '8th', type: 'Facility' },
    { name: 'Multipurpose Hall (MPH)', floor: '7th', type: 'Event Space' },
    { name: '6th Floor Library', floor: '6th', type: 'Facility' },
  ];

  // Dynamically generate Rooms 201-211, 301-311, 401-411
  for (let floor = 2; floor <= 4; floor++) {
    for (let roomNum = 1; roomNum <= 11; roomNum++) {
      const roomID = `${floor}${roomNum.toString().padStart(2, '0')}`;
      roomsData.push({ 
        name: `Room ${roomID}`, 
        floor: `${floor}nd`, // Simple ordinal suffix logic
        type: 'Lecture Room' 
      });
    }
  }

  // 5th Floor Specifics
  roomsData.push(
    { name: 'Room 501', floor: '5th', type: 'Lecture Room' },
    { name: 'Room 502 (Broadcasting)', floor: '5th', type: 'Laboratory' },
    { name: 'Room 503 (Bar and Dining)', floor: '5th', type: 'Facility' },
    { name: 'Room 504 (ComLab)', floor: '5th', type: 'Laboratory' },
    { name: 'Room 505 (ComLab)', floor: '5th', type: 'Laboratory' },
    { name: 'Room 506 (ComLab)', floor: '5th', type: 'Laboratory' },
    { name: 'Room 507 (ComLab)', floor: '5th', type: 'Laboratory' },
    { name: 'Room 508 (THM Room)', floor: '5th', type: 'Facility' }
  );

  console.log(`🏫 Seeding ${roomsData.length} rooms...`);
  for (const room of roomsData) {
    await prisma.room.upsert({
      where: { name: room.name },
      update: { floor: room.floor, type: room.type },
      create: { 
        name: room.name, 
        type: room.type || 'Lecture Room', 
        capacity: room.name === 'GYM' ? 500 : 45,
        floor: room.floor 
      },
    });
  }

  // Get a default room to assign inventory to
  const firstRoom = await prisma.room.findFirst({ where: { name: 'Room 101 (ComLab)' } });

  // --- 3. INVENTORY (EQUIPMENT) ---
  const inventoryData = [
    { itemName: 'Movable TV', quantity: 2, condition: ItemCondition.GOOD },
    { itemName: 'Movable Speaker', quantity: 1, condition: ItemCondition.GOOD },
    { itemName: 'Bluetooth Microphone', quantity: 4, condition: ItemCondition.GOOD },
    { itemName: 'Projector', quantity: 4, condition: ItemCondition.GOOD },
    { itemName: 'Extension Cord', quantity: 4, condition: ItemCondition.GOOD },
    // NEW ITEMS ADDED HERE
    { itemName: 'Wired Microphone', quantity: 2, condition: ItemCondition.GOOD },
    { itemName: 'Microphone Stand', quantity: 2, condition: ItemCondition.GOOD },
    { itemName: 'Backdrop (Green, Blue, Black)', quantity: 1, condition: ItemCondition.GOOD },
  ];

  console.log('📦 Seeding inventory...');
  for (const item of inventoryData) {
    const existing = await prisma.inventory.findFirst({
      where: { itemName: item.itemName }
    });

    if (!existing) {
      await prisma.inventory.create({
        data: {
          itemName: item.itemName,
          quantity: item.quantity,
          condition: item.condition,
          roomId: firstRoom?.id || 1
        }
      });
      console.log(`  + Created: ${item.itemName}`);
    } else {
      await prisma.inventory.update({
        where: { id: existing.id },
        data: { quantity: item.quantity, condition: item.condition }
      });
      console.log(`  ~ Updated: ${item.itemName}`);
    }
  }

  // --- 4. SAMPLE REQUESTS ---
  if (firstRoom && admin) {
    const existingReq = await prisma.request.findFirst({ where: { title: 'Urgent ComLab Reservation' } });
    if (!existingReq) {
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
    }
  }

  console.log('🏁 STI Cubao RACA Database Seeded Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });