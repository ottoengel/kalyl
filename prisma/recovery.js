import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function restoreBookings() {
  const bookings = JSON.parse(fs.readFileSync('./prisma/backup/backup.json', 'utf8'));

  for (const booking of bookings) {
    await prisma.booking.create({ data: booking });
  }

  console.log("Dados de Booking restaurados com sucesso!");
  await prisma.$disconnect();
}

restoreBookings().catch((e) => {
  console.error(e);
  process.exit(1);
});
