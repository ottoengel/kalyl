import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

const prisma = new PrismaClient();

const restoreBackup = async () => {
  try {
    // Ler o arquivo JSON
    const jsonData = readFileSync("backup_blocks.json", "utf-8");
    const blocks = JSON.parse(jsonData);

    // Inserir os registros no banco
    for (const block of blocks) {
      await prisma.block.create({
        data: {
          id: block.id,
          date: block.date ? new Date(block.date) : undefined,
          createdAt: block.createdAt ? new Date(block.createdAt) : undefined,
          updatedAt: block.updatedAt ? new Date(block.updatedAt) : undefined,
          user: block.user
            ? {
                connectOrCreate: {
                  where: { id: block.user.id },
                  create: {
                    id: block.user.id,
                    name: block.user.name,
                    email: block.user.email,
                    emailVerified: block.user.emailVerified,
                    image: block.user.image,
                    role: block.user.role,
                    createdAt: new Date(block.user.createdAt),
                    updatedAt: new Date(block.user.updatedAt),
                  },
                },
              }
            : undefined,
        },
      });
    }

    console.log("✅ Backup restaurado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao restaurar backup:", error);
  } finally {
    await prisma.$disconnect();
  }
};

// Executar a restauração
restoreBackup();
