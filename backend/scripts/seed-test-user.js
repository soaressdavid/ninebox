require('dotenv/config');

const prisma = require('../src/lib/prisma');

async function main() {
  // 1. cria usuário + gestor
    /*
    {
        "registrationId": "RA1001",
        "password": "123456",
        "role": "MANAGER"
    } 
    */

  const managerUser = await prisma.users.create({
    data: {
      email: 'gestor@ninebox.com',
      password: '123456',
      role: 'MANAGER',
      active: true,
      managers: {
        create: {
          name: 'Gestor Teste',
          email: 'gestor@ninebox.com',
          registrationId: 'RA1001',
          company: 'Ninebox',
          active: true,
        },
      },
    },
    include: {
      managers: true,
    },
  });

  console.log('Gestor criado:', managerUser);

  // 2. cria usuário + colaborador vinculado ao gestor
  /*
    {
        "registrationId": "RA2001",
        "password": "123456",
        "role": "EMPLOYEE"
    }
    */
  const employeeUser = await prisma.users.create({
    data: {
      email: 'colaborador@ninebox.com',
      password: '123456',
      role: 'EMPLOYEE',
      active: true,
      employees: {
        create: {
          name: 'Colaborador Teste',
          email: 'colaborador@ninebox.com',
          registrationId: 'RA2001',
          company: 'Ninebox',
          active: true,
          managerId: managerUser.managers.id,
        },
      },
    },
    include: {
      employees: true,
    },
  });

  console.log('Colaborador criado:', employeeUser);
}

main()
  .catch((error) => {
    console.error('Erro ao criar usuários de teste:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });