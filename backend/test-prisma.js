require('dotenv/config');

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$connect();
  console.log('Conectado ao banco com Prisma com sucesso!');
}

main()
  .catch((error) => {
    console.error('Erro ao conectar com Prisma:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });