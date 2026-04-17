import { PrismaClient, Role, ItemCondition } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { hashPassword } from "better-auth/crypto";

// 1. Load environment variables from the root .env
const rootPath = path.resolve(__dirname, '..', '..', '..', '.env');
dotenv.config({ path: rootPath });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting to seed STI Cubao RACA data...');

  // --- 2. ROOMS (STI CUBAO STRUCTURE) ---
  const roomsData: { name: string; floor: string; type: string }[] = [
    { name: 'Room 101 (ComLab)', floor: '1st', type: 'Laboratory' },
    { name: 'Ground Floor Lobby', floor: 'Ground', type: 'Common Area' },
    { name: 'GYM', floor: '8th', type: 'Facility' },
    { name: 'Multipurpose Hall (MPH)', floor: '7th', type: 'Event Space' },
    { name: '6th Floor Library', floor: '6th', type: 'Facility' },
  ];

  // Logic to generate rooms 201-211, 301-311, and 401-411
  for (let floorNum = 2; floorNum <= 4; floorNum++) {
    const suffix = floorNum === 2 ? 'nd' : floorNum === 3 ? 'rd' : 'th';
    
    for (let roomNum = 1; roomNum <= 11; roomNum++) {
      const roomID = `${floorNum}${roomNum.toString().padStart(2, '0')}`;
      roomsData.push({ 
        name: `Room ${roomID}`, 
        floor: `${floorNum}${suffix}`, 
        type: 'Lecture Room' 
      });
    }
  }

  // 5th Floor Specifics
  const fifthFloorRooms = [
    '501', '502 (Broadcasting)', '503 (Bar and Dining)', 
    '504 (ComLab)', '505 (ComLab)', '506 (ComLab)', 
    '507 (ComLab)', '508 (THM Room)'
  ];

  fifthFloorRooms.forEach(room => {
    roomsData.push({ 
        name: `Room ${room}`, 
        floor: '5th', 
        type: room.includes('ComLab') ? 'Laboratory' : 'Facility' 
    });
  });

  console.log(`🏫 Seeding ${roomsData.length} rooms...`);
  for (const room of roomsData) {
    await prisma.room.upsert({
      where: { name: room.name },
      update: { floor: room.floor, type: room.type },
      create: { 
        name: room.name, 
        type: room.type, 
        capacity: room.name === 'GYM' ? 500 : 45,
        floor: room.floor,
        isAvailable: true 
      },
    });
  }

  // --- 3. INVENTORY (EQUIPMENT) ---
  let targetRoom = await prisma.room.findFirst({ where: { name: 'Room 101 (ComLab)' } });
  
  if (!targetRoom) {
      targetRoom = await prisma.room.findFirst();
  }

  const inventoryItems = [
    'Movable TV', 'Movable Speaker', 'Bluetooth Microphone', 
    'Projector', 'Extension Cord', 'Wired Microphone', 
    'Microphone Stand', 'Backdrop'
  ];

  console.log('📦 Seeding inventory...');
  if (targetRoom) {
    for (const itemName of inventoryItems) {
      const existing = await prisma.inventory.findFirst({ where: { itemName } });
      if (!existing) {
        await prisma.inventory.create({
          data: {
            itemName,
            quantity: 2,
            condition: ItemCondition.GOOD,
            roomId: targetRoom.id
          }
        });
        console.log(`  + Created: ${itemName}`);
      }
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