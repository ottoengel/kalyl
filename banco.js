import { PrismaClient } from "@prisma/client";
import * as fs from 'node:fs'

const prisma = new PrismaClient();

const backupTable = async () => {
  try {
    // Buscar todos os registros da tabela Block, incluindo relacionamentos
    const blocks = await prisma.user.findMany({
      include: {
        accounts: true,
        sessions: true,
        bookings: true,
        block: true
      },
    });

    // Converter para JSON formatado
    const jsonData = JSON.stringify(blocks, null, 2);

    // Escrever no arquivo
    fs.writeFileSync("backup_user.json", jsonData);

    console.log("Backup realizado com sucesso!");
  } catch (error) {
    console.error("Erro ao realizar backup:", error);
  } finally {
    await prisma.$disconnect();
  }
};

// Executar o backup
backupTable();
