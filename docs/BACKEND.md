# Backend - Guia Completo

> Stack: Node.js + Express + Prisma + Supabase + JWT + Joi

## Primeira vez aqui?

**Se você não sabe por onde começar**, volte pro [`README.md`](../README.md) primeiro.

**Se você já leu o README**, continue aqui para entender a arquitetura geral antes de ir pro seu doc específico.

---

## Início Rápido

```bash
# 1. Setup
cd backend
npm install
cp .env.example .env  # Configurar DATABASE_URL e JWT_SECRET

# 2. Banco de dados
npx prisma migrate dev
npx prisma generate
npm run prisma:seed

# 3. Rodar
npm run dev  # http://localhost:3000
```

## Estrutura

```
backend/
├── src/
│   ├── config/         # database.js, env.js
│   ├── middlewares/    # auth.js, errorHandler.js
│   ├── modules/
│   │   ├── users/      # Estagiário 1
│   │   ├── evaluations/  # Estagiário 2
│   │   └── competencies/ # Estagiário 3
│   ├── utils/          # errors.js
│   ├── app.js
│   └── server.js
├── prisma/
│   ├── schema.prisma
│   └── seed.js
└── package.json
```

## Divisão de Trabalho

### Estagiário 1 - Usuários
- Autenticação (login/logout)
- CRUD de usuários
- Sistema de RA (identificador único)
- Permissões (Admin/Gestor/Colaborador)

**Endpoints (8)**:
- `POST /api/users/register` (apenas admin)
- `POST /api/users/login`
- `GET /api/users/profile`
- `PUT /api/users/profile`
- `GET /api/users`
- `GET /api/users/:id`
- `GET /api/users/ra/:ra` ← busca por RA
- `DELETE /api/users/:id` (apenas admin)

📖 Ver: [`docs/backend/ESTAGIARIO_1_USERS.md`](backend/ESTAGIARIO_1_USERS.md)

---

### Estagiário 2 - Avaliações
- Avaliações tradicionais
- Sistema Nine Box
- Estatísticas

**Endpoints (10)**:
- `POST /api/evaluations`
- `GET /api/evaluations`
- `GET /api/evaluations/:id`
- `GET /api/evaluations/user/:userId`
- `PUT /api/evaluations/:id`
- `DELETE /api/evaluations/:id`
- `GET /api/evaluations/stats/:userId`
- `POST /api/evaluations/nine-box`
- `GET /api/evaluations/nine-box`
- `GET /api/evaluations/nine-box/:id`

📖 Ver: [`docs/backend/ESTAGIARIO_2_EVALUATIONS.md`](backend/ESTAGIARIO_2_EVALUATIONS.md)

---

### Estagiário 3 - Competências
- CRUD de competências
- Relatórios
- Dashboard

**Endpoints (10)**:
- `POST /api/competencies`
- `GET /api/competencies`
- `GET /api/competencies/:id`
- `PUT /api/competencies/:id`
- `DELETE /api/competencies/:id`
- `GET /api/competencies/types`
- `GET /api/reports/dashboard`
- `GET /api/reports/user/:userId`
- `GET /api/reports/department/:dept`
- `GET /api/reports/nine-box-summary`

📖 Ver: [`docs/backend/ESTAGIARIO_3_COMPETENCIES.md`](backend/ESTAGIARIO_3_COMPETENCIES.md)

---

## Sistema de Permissões

### 3 Níveis

**ADMIN**
- Cadastrar/deletar usuários
- Acesso total
- Cada admin tem seu próprio RA

**GESTOR**
- Ver e avaliar colaboradores
- Criar Nine Box
- Ver relatórios da equipe
- RA é o número que a pessoa já possui

**COLABORADOR**
- Ver próprio perfil
- Ver próprias avaliações
- Responder avaliações 180°
- RA é o número que a pessoa já possui

### Sistema de RA (Registro Acadêmico)

Cada usuário tem um **RA único**.

**Como funciona**:
- Cada colaborador e gestor do ENIAC já tem seu RA
- No cadastro, a pessoa informa o RA dela
- Sistema valida o formato (5 a 15 caracteres) e se não está duplicado
- Admin também tem RA próprio

**Características**:
- Único por usuário (constraint no banco)
- Usado para busca: `GET /api/users/ra/:ra`
- Validação: entre 5 e 15 caracteres
- Não pode ser alterado após criação
- É um dado que a pessoa já possui (como CPF)

### Middlewares

```javascript
// auth.js
authMiddleware          // Qualquer usuário autenticado
isAdminMiddleware       // Apenas admin
isGestorOrAdminMiddleware  // Gestor ou admin
```

### Resumo de Permissões por Endpoint

#### 👥 Usuários (Estagiário 1)

| Endpoint | Admin | Gestor | Colaborador |
|----------|-------|--------|-------------|
| `POST /api/users/register` | ✅ | ❌ | ❌ |
| `POST /api/users/login` | ✅ | ✅ | ✅ |
| `GET /api/users/profile` | ✅ | ✅ | ✅ |
| `PUT /api/users/profile` | ✅ | ✅ | ✅ |
| `GET /api/users` | ✅ | ✅ | ❌ |
| `GET /api/users/:id` | ✅ | ✅ (equipe) | ❌ |
| `GET /api/users/ra/:ra` | ✅ | ✅ | ✅ |
| `DELETE /api/users/:id` | ✅ | ❌ | ❌ |

#### 📊 Avaliações (Estagiário 2)

| Endpoint | Admin | Gestor | Colaborador |
|----------|-------|--------|-------------|
| `POST /api/evaluations` | ✅ | ✅ | ❌ |
| `POST /api/evaluations/comment` | ✅ | ✅ | ❌ |
| `POST /api/evaluations/nine-box` | ✅ | ✅ | ❌ |
| `GET /api/evaluations` | ✅ (todas) | ✅ (equipe) | ✅ (próprias) |
| `GET /api/evaluations/:id` | ✅ | ✅ (equipe) | ✅ (próprias) |
| `GET /api/evaluations/user/:userId` | ✅ | ✅ (equipe) | ✅ (próprias) |
| `GET /api/evaluations/stats/:userId` | ✅ | ✅ (equipe) | ✅ (próprias) |
| `GET /api/evaluations/nine-box` | ✅ (todas) | ✅ (equipe) | ✅ (próprias) |
| `PUT /api/evaluations/:id` | ✅ | ✅ (criadas) | ❌ |
| `DELETE /api/evaluations/:id` | ✅ | ✅ (criadas) | ❌ |

#### 🎯 Competências (Estagiário 3)

| Endpoint | Admin | Gestor | Colaborador |
|----------|-------|--------|-------------|
| `POST /api/competencies` | ✅ | ❌ | ❌ |
| `GET /api/competencies` | ✅ | ✅ | ✅ |
| `GET /api/competencies/:id` | ✅ | ✅ | ✅ |
| `GET /api/competencies/types` | ✅ | ✅ | ✅ |
| `PUT /api/competencies/:id` | ✅ | ❌ | ❌ |
| `DELETE /api/competencies/:id` | ✅ | ❌ | ❌ |

#### 📈 Relatórios (Estagiário 3)

| Endpoint | Admin | Gestor | Colaborador |
|----------|-------|--------|-------------|
| `GET /api/reports/dashboard` | ✅ (completo) | ✅ (equipe) | ❌ |
| `GET /api/reports/user/:userId` | ✅ | ✅ (equipe) | ✅ (próprio) |
| `GET /api/reports/team/:gestorId` | ✅ | ✅ (própria) | ❌ |
| `GET /api/reports/export/:userId` | ✅ | ✅ (equipe) | ✅ (próprio) |

---

## Arquitetura

**Padrão**: Controller → Service → Repository

**IMPORTANTE**: Este projeto usa **ES Modules** (`import/export`), não CommonJS (`require/module.exports`).

Configure `"type": "module"` no `package.json`:
```json
{
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js"
  }
}
```

```javascript
// Controller: Recebe HTTP, valida, retorna resposta
import { userService } from './user.service.js';
import { createUserSchema } from './user.validation.js';

class UserController {
  async create(req, res, next) {
    const { error, value } = createUserSchema.validate(req.body);
    if (error) return res.status(400).json({...});
    
    const user = await userService.create(value);
    return res.status(201).json({ success: true, data: user });
  }
}

export const userController = new UserController();

// Service: Lógica de negócio
import { userRepository } from './user.repository.js';
import bcrypt from 'bcrypt';

class UserService {
  async create(data) {
    // Verificar email duplicado
    // Hash senha
    const hashedPassword = await bcrypt.hash(data.senha, 10);
    // Criar usuário
    return userRepository.create({ ...data, senha: hashedPassword });
  }
}

export const userService = new UserService();

// Repository: Acesso ao banco (Prisma)
import { prisma } from '../../config/database.js';

class UserRepository {
  async create(data) {
    return prisma.user.create({ data });
  }
}

export const userRepository = new UserRepository();
```

---

## Schema Prisma

```prisma
model User {
  id           String   @id @default(uuid())
  ra           String   @unique  // Identificador único (ex: 1234567, RA2021001)
  nome         String
  email        String   @unique
  senha        String
  tipo         UserType // admin, gestor, colaborador
  foto         String?
  cargo        String?
  departamento String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  avaliacoesFeitas    Evaluation[] @relation("AvaliadorRelation")
  avaliacoesRecebidas Evaluation[] @relation("AvaliadoRelation")
  nineBoxAvaliacoes   NineBox[]

  @@index([ra])
  @@map("users")
}

enum UserType {
  admin        // Administrador (criado apenas via seed)
  gestor       // Gerente/Gestor
  colaborador  // Colaborador/Funcionário
}
```

Ver schema completo: [`docs/backend/SCHEMA.prisma`](backend/SCHEMA.prisma)

---

## Testando

### 1. Login (Postman)

```http
POST http://localhost:3000/api/users/login
Content-Type: application/json

{
  "email": "admin@empresa.com",
  "senha": "admin123"
}
```

### 2. Usar token

```http
GET http://localhost:3000/api/users/profile
Authorization: Bearer SEU_TOKEN_AQUI
```

### 3. Credenciais de teste

```
Admin:        admin@eniac.edu.br / admin123 (RA: use RA real)
Gestor:       joao@eniac.edu.br / senha123 (RA: use RA real)
Colaborador:  ana@eniac.edu.br / senha123 (RA: use RA real)
```

---

## Scripts

```bash
npm run dev              # Desenvolvimento
npm run prisma:generate  # Gerar cliente Prisma
npm run prisma:migrate   # Criar migration
npm run prisma:studio    # Visualizar banco
npm run prisma:seed      # Popular banco
```

---

## Checklist

- [ ] Configurar .env
- [ ] Rodar migrations
- [ ] Implementar módulo (Controller/Service/Repository)
- [ ] Criar validações (Joi)
- [ ] Testar no Postman
- [ ] Fazer Pull Request

---

## Documentação Detalhada

- [Estagiário 1 - Usuários](backend/ESTAGIARIO_1_USERS.md)
- [Estagiário 2 - Avaliações](backend/ESTAGIARIO_2_EVALUATIONS.md)
- [Estagiário 3 - Competências](backend/ESTAGIARIO_3_COMPETENCIES.md)
- [Schema Prisma](backend/SCHEMA.prisma)
- [Diagramas](backend/DIAGRAMAS.md)
- [FAQ](backend/FAQ.md)
