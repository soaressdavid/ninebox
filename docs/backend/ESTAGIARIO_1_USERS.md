# 🔵 ESTAGIÁRIO 1 - Módulo de Usuários (Users)

## 👤 Sua Responsabilidade

Você será responsável por todo o sistema de **autenticação e gestão de usuários** do Portal de Gestão de Pessoas usando **JavaScript puro** (sem TypeScript).

---

## 🎯 Objetivos

1. Sistema de cadastro e login com JWT
2. Sistema de permissões (Admin, Gestor, Colaborador)
3. Sistema de RA (Registro Acadêmico - 7 dígitos)
4. Gestão de perfis de usuários
5. Busca por RA
6. Upload de fotos de perfil (opcional)

---

## 📋 Endpoints que você vai criar

### 1. POST /api/users/register
**Cadastrar novo usuário (APENAS ADMIN)**

**Request Body:**
```json
{
  "ra": "2021001",
  "nome": "João Silva",
  "email": "joao@empresa.com",
  "senha": "senha123",
  "tipo": "gestor",
  "cargo": "Gerente de TI",
  "departamento": "Tecnologia"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "ra": "2021001",
    "nome": "João Silva",
    "email": "joao@empresa.com",
    "tipo": "gestor",
    "cargo": "Gerente de TI",
    "departamento": "Tecnologia",
    "createdAt": "2026-04-30T10:00:00.000Z"
  },
  "message": "Usuário criado com sucesso"
}
```

**Regras**:
- ✅ Apenas admin pode cadastrar
- ✅ RA deve ter 7 dígitos
- ✅ RA deve ser único
- ✅ Email deve ser único
- ❌ Não pode criar admin pela API

---

### 2. POST /api/users/login
**Fazer login**

**Request Body:**
```json
{
  "email": "joao@empresa.com",
  "senha": "senha123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "ra": "2021001",
      "nome": "João Silva",
      "email": "joao@empresa.com",
      "tipo": "gestor"
    }
  },
  "message": "Login realizado com sucesso"
}
```

---

### 3. GET /api/users/profile
**Buscar perfil do usuário logado**

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "ra": "2021001",
    "nome": "João Silva",
    "email": "joao@empresa.com",
    "tipo": "gestor",
    "cargo": "Gerente de TI",
    "departamento": "Tecnologia",
    "foto": null
  }
}
```

---

### 4. GET /api/users
**Listar usuários (GESTOR OU ADMIN)**

**Headers:**
```
Authorization: Bearer {token}
```

**Query Params (opcionais):**
- `tipo`: gestor, colaborador
- `departamento`: Tecnologia, RH, etc
- `search`: busca por nome ou email

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "ra": "2021001",
      "nome": "João Silva",
      "email": "joao@empresa.com",
      "tipo": "gestor",
      "cargo": "Gerente de TI",
      "departamento": "Tecnologia"
    }
  ]
}
```

---

### 5. GET /api/users/ra/:ra
**Buscar usuário por RA**

**Headers:**
```
Authorization: Bearer {token}
```

**Exemplo:**
```
GET /api/users/ra/2021001
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "ra": "2021001",
    "nome": "João Silva",
    "email": "joao@empresa.com",
    "tipo": "gestor",
    "cargo": "Gerente de TI",
    "departamento": "Tecnologia"
  }
}
```

---

### 6. DELETE /api/users/:id
**Deletar usuário (APENAS ADMIN)**

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Usuário deletado com sucesso"
}
```

---

## 🔐 Sistema de Permissões

### Tipos de Usuário

**🔴 ADMIN** (RA: 1000000)
- Cadastrar/deletar usuários
- Acesso total ao sistema
- Criado apenas via seed

**🟡 GESTOR** (RA: 2021XXX)
- Ver e avaliar colaboradores
- Criar avaliações Nine Box
- Ver relatórios da equipe

**🟢 COLABORADOR** (RA: 2022XXX)
- Ver próprio perfil
- Ver próprias avaliações
- Responder avaliações 180°

### Middlewares que você vai criar

```javascript
// src/middlewares/auth.js

// 1. authMiddleware - Verifica se está autenticado
function authMiddleware(req, res, next) {
  // Verificar token JWT
  // Adicionar req.user com dados do usuário
}

// 2. isAdminMiddleware - Verifica se é admin
function isAdminMiddleware(req, res, next) {
  if (req.user?.tipo !== 'admin') {
    throw new AppError('Acesso negado. Apenas administradores.', 403);
  }
  next();
}

// 3. isGestorOrAdminMiddleware - Verifica se é gestor ou admin
function isGestorOrAdminMiddleware(req, res, next) {
  if (!['admin', 'gestor'].includes(req.user?.tipo)) {
    throw new AppError('Acesso negado.', 403);
  }
  next();
}
```

---

## 🆔 Sistema de RA

### O que é RA?
- **Registro Acadêmico**: identificador único de 7 dígitos
- Usado para buscar usuários
- Não pode ser alterado após criação

### Formato

| Tipo | Formato | Exemplo |
|------|---------|---------|
| Admin | `1000000` | 1000000 (fixo) |
| Gestor | `2021XXX` | 2021001, 2021002 |
| Colaborador | `2022XXX` | 2022001, 2022002 |

### Validação (Joi)

```javascript
// user.validation.js
const createUserSchema = Joi.object({
  ra: Joi.string()
    .pattern(/^[0-9]{7}$/)
    .required()
    .messages({
      'string.pattern.base': 'RA deve ter 7 dígitos',
      'any.required': 'RA é obrigatório'
    }),
  nome: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  senha: Joi.string().min(6).required(),
  tipo: Joi.string()
    .valid('admin', 'gestor', 'colaborador')
    .required(),
  cargo: Joi.string().optional(),
  departamento: Joi.string().optional()
});
```

---

## 📁 Estrutura de Arquivos

```
src/modules/users/
├── user.controller.js    # Recebe requisições HTTP
├── user.service.js       # Lógica de negócio
├── user.repository.js    # Acesso ao banco (Prisma)
├── user.routes.js        # Definição das rotas
└── user.validation.js    # Validações com Joi
```

---

## 🔨 Implementação

### 1. Schema Prisma

```prisma
model User {
  id           String   @id @default(uuid())
  ra           String   @unique  // NOVO
  nome         String
  email        String   @unique
  senha        String
  tipo         UserType
  foto         String?
  cargo        String?
  departamento String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([ra])
  @@map("users")
}

enum UserType {
  admin        // NOVO
  gestor
  colaborador
}
```

### 2. Repository (user.repository.js)

```javascript
class UserRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async create(data) {
    return this.prisma.user.create({ data });
  }

  async findByEmail(email) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByRA(ra) {
    return this.prisma.user.findUnique({
      where: { ra },
      select: {
        id: true,
        ra: true,
        nome: true,
        email: true,
        tipo: true,
        foto: true,
        cargo: true,
        departamento: true,
        createdAt: true
      }
    });
  }

  async raExists(ra) {
    const user = await this.prisma.user.findUnique({
      where: { ra },
      select: { id: true }
    });
    return !!user;
  }

  async findAll(filters = {}) {
    return this.prisma.user.findMany({
      where: filters,
      select: {
        id: true,
        ra: true,
        nome: true,
        email: true,
        tipo: true,
        foto: true,
        cargo: true,
        departamento: true,
        createdAt: true
      }
    });
  }

  async deleteById(id) {
    return this.prisma.user.delete({ where: { id } });
  }
}
```

### 3. Service (user.service.js)

```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AppError } = require('../../utils/errors');

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async create(data, requestUserTipo) {
    // APENAS ADMIN PODE CADASTRAR
    if (requestUserTipo !== 'admin') {
      throw new AppError('Apenas administradores podem cadastrar usuários', 403);
    }

    // Verificar se RA já existe
    const raExists = await this.userRepository.raExists(data.ra);
    if (raExists) {
      throw new AppError('RA já cadastrado', 400);
    }

    // Verificar se email já existe
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email já cadastrado', 400);
    }

    // Não permitir criar admin pela API
    if (data.tipo === 'admin') {
      throw new AppError('Não é possível criar administradores pela API', 400);
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.senha, 10);

    // Criar usuário
    const user = await this.userRepository.create({
      ...data,
      senha: hashedPassword
    });

    // Remover senha do retorno
    const { senha, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(email, senha) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Email ou senha inválidos', 401);
    }

    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (!isPasswordValid) {
      throw new AppError('Email ou senha inválidos', 401);
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        tipo: user.tipo
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Remover senha do retorno
    const { senha: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword
    };
  }

  async getUserByRA(ra) {
    const user = await this.userRepository.findByRA(ra);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }
    return user;
  }

  async deleteUser(id, requestUserTipo) {
    // APENAS ADMIN PODE DELETAR
    if (requestUserTipo !== 'admin') {
      throw new AppError('Apenas administradores podem deletar usuários', 403);
    }

    await this.userRepository.deleteById(id);
  }
}
```

### 4. Rotas (user.routes.js)

```javascript
const { Router } = require('express');
const { authMiddleware, isAdminMiddleware, isGestorOrAdminMiddleware } = require('../../middlewares/auth');

const router = Router();

// Injeção de dependências
const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// Rotas públicas
router.post('/login', (req, res, next) => userController.login(req, res, next));

// Rotas protegidas (requerem autenticação)
router.use(authMiddleware);

// Rotas para todos autenticados
router.get('/profile', (req, res, next) => userController.getProfile(req, res, next));
router.get('/ra/:ra', (req, res, next) => userController.getUserByRA(req, res, next));

// Rotas apenas para gestores e admins
router.get('/', isGestorOrAdminMiddleware, (req, res, next) => 
  userController.listUsers(req, res, next)
);

// Rotas apenas para admins
router.post('/register', isAdminMiddleware, (req, res, next) => 
  userController.create(req, res, next)
);
router.delete('/:id', isAdminMiddleware, (req, res, next) => 
  userController.deleteUser(req, res, next)
);

module.exports = { userRoutes: router };
```

---

## ✅ Checklist de Implementação

- [ ] Atualizar schema.prisma (adicionar campo `ra` e tipo `admin`)
- [ ] Rodar migration: `npx prisma migrate dev --name add-ra-and-admin`
- [ ] Criar user.validation.js com validações Joi (incluir validação de RA)
- [ ] Implementar user.repository.js (incluir `findByRA` e `raExists`)
- [ ] Implementar user.service.js (validar permissões admin)
- [ ] Implementar user.controller.js (incluir `getUserByRA`)
- [ ] Criar middlewares: `isAdminMiddleware`, `isGestorOrAdminMiddleware`
- [ ] Criar user.routes.js (proteger rotas com middlewares)
- [ ] Atualizar seed.js (criar admin com RA 1000000)
- [ ] Rodar seed: `npm run prisma:seed`
- [ ] Testar todos os endpoints no Postman
- [ ] Documentar no README

---

## 🧪 Como Testar

### 1. Popular banco com dados de teste
```bash
npm run prisma:seed
```

### 2. Testar no Postman

**Login como Admin:**
```http
POST http://localhost:3000/api/users/login
Content-Type: application/json

{
  "email": "admin@empresa.com",
  "senha": "admin123"
}
```

**Copiar o token da resposta**

**Cadastrar novo gestor (como admin):**
```http
POST http://localhost:3000/api/users/register
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json

{
  "ra": "2021003",
  "nome": "Pedro Santos",
  "email": "pedro@empresa.com",
  "senha": "senha123",
  "tipo": "gestor",
  "cargo": "Gerente de Vendas",
  "departamento": "Comercial"
}
```

**Buscar por RA:**
```http
GET http://localhost:3000/api/users/ra/2021003
Authorization: Bearer SEU_TOKEN_AQUI
```

**Listar usuários:**
```http
GET http://localhost:3000/api/users
Authorization: Bearer SEU_TOKEN_AQUI
```

**Tentar cadastrar como gestor (deve dar erro):**
```http
# 1. Login como gestor
POST http://localhost:3000/api/users/login
{
  "email": "joao@empresa.com",
  "senha": "senha123"
}

# 2. Tentar cadastrar (deve retornar 403)
POST http://localhost:3000/api/users/register
Authorization: Bearer TOKEN_DO_GESTOR
{
  "ra": "2022004",
  "nome": "Teste",
  "email": "teste@empresa.com",
  "senha": "senha123",
  "tipo": "colaborador"
}
```

---

## 📞 Credenciais de Teste

```
Admin:
  RA: 1000000
  Email: admin@empresa.com
  Senha: admin123

Gestor:
  RA: 2021001
  Email: joao@empresa.com
  Senha: senha123

Colaborador:
  RA: 2022001
  Email: ana@empresa.com
  Senha: senha123
```

---

**Boa sorte! 🚀**