# ESTAGIÁRIO 1 - Módulo de Usuários (Users)

## ⚠️ IMPORTANTE: ES Modules

Este projeto usa **ES Modules** (`import/export`) ao invés de CommonJS (`require/module.exports`).

**O que isso significa?**
- Quando você importa algo, usa `import` ao invés de `require`
- Quando você exporta algo, usa `export` ao invés de `module.exports`

**Configure no package.json:**
```json
{
  "type": "module"
}
```

**Exemplos:**
```javascript
// ✅ CERTO (ES Modules)
import express from 'express';
export { UserService };
export default router;

// ❌ ERRADO (CommonJS - não use!)
const express = require('express');
module.exports = { UserService };
module.exports = router;
```

---

## Sua Responsabilidade

Você vai cuidar de **tudo relacionado a usuários**:
- Cadastro de novos usuários
- Login e autenticação
- Controle de permissões (quem pode fazer o quê)
- Busca de usuários por RA

**Stack (tecnologias que você vai usar):**
- Node.js + Express (servidor web)
- Prisma (banco de dados)
- JWT (autenticação)
- Joi (validação de dados)
- JavaScript puro (sem TypeScript)

---

## Seus Endpoints (8 no total)

### 1. POST /api/users/register
**O que faz:** Cadastra um usuário novo (só admin pode fazer isso)

**Body (dados que você envia):**
```json
{
  "ra": "2021001",
  "nome": "João Silva",
  "email": "joao@eniac.edu.br",
  "senha": "senha123",
  "tipo": "gestor",
  "cargo": "Gerente de TI",
  "departamento": "Tecnologia"
}
```

**Regras:**
- Só admin pode cadastrar usuários
- RA deve ter entre 5 e 10 caracteres alfanuméricos
- RA e email devem ser únicos (não pode repetir)
- Não pode criar admin pela API (só no seed/banco direto)

### 2. POST /api/users/login
**O que faz:** Faz login no sistema

**Body:**
```json
{
  "email": "joao@eniac.edu.br",
  "senha": "senha123"
}
```

**Retorna:** 
- Token JWT em **HttpOnly Cookie** (seguro, não acessível via JavaScript)
- Dados do usuário (sem a senha)

**⚠️ AUTENTICAÇÃO PROFISSIONAL:**
O token é retornado em um **HttpOnly Cookie** ao invés de no body da resposta. Isso protege contra ataques XSS (Cross-Site Scripting).

**Resposta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "ra": "2021001",
      "nome": "João Silva",
      "email": "joao@eniac.edu.br",
      "tipo": "gestor"
    }
  },
  "message": "Login realizado com sucesso"
}
```

**Cookie (automático):**
```
Set-Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000
```

### 3. GET /api/users/profile
**O que faz:** Ver próprio perfil (precisa estar logado)

**Headers:**
```
Cookie: token=SEU_TOKEN_AQUI
```

**NOTA:** O cookie é enviado automaticamente pelo navegador quando você usa `credentials: 'include'` no fetch.

### 3.1. POST /api/users/logout
**O que faz:** Fazer logout (limpa o cookie HttpOnly)

**Resposta:**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

### 4. PUT /api/users/profile
**O que faz:** Atualizar próprio perfil

**Body:**
```json
{
  "nome": "João Silva Santos",
  "cargo": "Gerente Sênior de TI"
}
```

### 5. GET /api/users
**O que faz:** Listar todos os usuários (gestor ou admin)

**Aceita filtros:**
```
GET /api/users?tipo=gestor&departamento=TI&page=1&limit=10
```

### 6. GET /api/users/:id
**O que faz:** Buscar usuário por ID

**Exemplo:**
```
GET /api/users/uuid-do-usuario
```

### 7. GET /api/users/ra/:ra
**O que faz:** Buscar usuário por RA

**Exemplo:**
```
GET /api/users/ra/2021001
```

### 8. DELETE /api/users/:id
**O que faz:** Deletar usuário (só admin)

**Exemplo:**
```
DELETE /api/users/uuid-do-usuario
```

---

## Sistema de Permissões

### Admin
- Pode cadastrar e deletar qualquer usuário
- Vê todos os dados do sistema
- Cada admin tem seu próprio RA
- Não pode ser criado pela API (só no seed)

### Gestor
- Pode ver e avaliar colaboradores
- Pode criar avaliações Nine Box
- Vê relatórios da sua equipe
- Não pode cadastrar ou deletar usuários

### Colaborador
- Vê apenas seu próprio perfil
- Vê suas próprias avaliações
- Pode responder avaliações 180°
- Não pode ver outros usuários

---

## Sistema de RA

**O que é RA?**
- RA é um número único que cada pessoa já tem (tipo CPF)
- Cada aluno/funcionário do ENIAC já tem um RA
- O sistema não gera RA, apenas valida

**Como funciona:**
1. Pessoa informa o RA dela no cadastro
2. Sistema valida se está no formato correto (5 a 10 caracteres alfanuméricos)
3. Sistema checa se não está duplicado no banco
4. Pronto!

**Exemplo de validação:**
```javascript
ra: Joi.string()
  .min(5)
  .max(10)
  .required()
  .messages({
    'string.min': 'RA deve ter entre 5 e 10 caracteres',
    'string.max': 'RA deve ter entre 5 e 10 caracteres',
    'any.required': 'RA é obrigatório'
  })
```

**IMPORTANTE:**
- Use RAs reais das pessoas
- Não invente números
- Pergunte o RA da pessoa antes de cadastrar
- Admin também tem RA

---

## Estrutura dos Arquivos

```
src/modules/users/
├── user.controller.js    # Recebe requisições HTTP
├── user.service.js       # Lógica de negócio
├── user.repository.js    # Queries no banco (Prisma)
├── user.routes.js        # Define as rotas
└── user.validation.js    # Validações com Joi
```

**Padrão de fluxo:**
```
HTTP Request → Controller → Service → Repository → Database
                    ↓
HTTP Response ← Controller ← Service ← Repository ← Database
```

**O que cada arquivo faz:**
- **Controller**: Recebe a requisição HTTP, chama o service, retorna a resposta
- **Service**: Contém a lógica de negócio (validações, regras)
- **Repository**: Faz as queries no banco de dados
- **Routes**: Define quais URLs chamam quais controllers
- **Validation**: Define regras de validação dos dados

---

## Schema Prisma (Banco de Dados)

```prisma
model User {
  id           String   @id @default(uuid())
  ra           String   @unique
  nome         String
  email        String   @unique
  senha        String
  tipo         UserType
  foto         String?
  cargo        String?
  departamento String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  avaliacoesFeitas    Evaluation[] @relation("AvaliadorRelation")
  avaliacoesRecebidas Evaluation[] @relation("AvaliadoRelation")
  nineBoxAvaliacoes   NineBox[]

  @@index([ra])
  @@index([email])
  @@map("users")
}

enum UserType {
  admin
  gestor
  colaborador
}
```

**Explicação dos campos:**
- `id`: Identificador único (UUID gerado automaticamente)
- `ra`: Registro Acadêmico (único)
- `nome`: Nome completo
- `email`: Email (único)
- `senha`: Senha criptografada com bcrypt
- `tipo`: Tipo de usuário (admin, gestor ou colaborador)
- `foto`: URL da foto (opcional)
- `cargo`: Cargo/função (opcional)
- `departamento`: Departamento (opcional)
- `createdAt`: Data de criação (automático)
- `updatedAt`: Data de atualização (automático)

---

## Implementação Passo a Passo

### PASSO 1: Criar user.validation.js

**O que faz:** Define as regras de validação dos dados usando Joi

Arquivo: `src/modules/users/user.validation.js`

```javascript
import Joi from 'joi';

// Validação para cadastro de usuário
const registerSchema = Joi.object({
  ra: Joi.string()
    .min(5)
    .max(10)
    .required()
    .messages({
      'string.min': 'RA deve ter entre 5 e 10 caracteres',
      'string.max': 'RA deve ter entre 5 e 10 caracteres',
      'any.required': 'RA é obrigatório'
    }),
  nome: Joi.string()
    .min(3)
    .required()
    .messages({
      'string.min': 'Nome deve ter no mínimo 3 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email inválido',
      'any.required': 'Email é obrigatório'
    }),
  senha: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Senha deve ter no mínimo 6 caracteres',
      'any.required': 'Senha é obrigatória'
    }),
  tipo: Joi.string()
    .valid('admin', 'gestor', 'colaborador')
    .required()
    .messages({
      'any.only': 'Tipo deve ser: admin, gestor ou colaborador',
      'any.required': 'Tipo é obrigatório'
    }),
  cargo: Joi.string().optional(),
  departamento: Joi.string().optional(),
  foto: Joi.string().uri().optional()
});

// Validação para login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  senha: Joi.string().required()
});

// Validação para atualizar perfil
const updateProfileSchema = Joi.object({
  nome: Joi.string().min(3).optional(),
  cargo: Joi.string().optional(),
  departamento: Joi.string().optional(),
  foto: Joi.string().uri().optional()
});

// Exporta os schemas
export {
  registerSchema,
  loginSchema,
  updateProfileSchema
};
```

**Explicação linha por linha:**
- `import Joi from 'joi'`: Importa a biblioteca Joi para validação
- `Joi.object({})`: Cria um schema de validação
- `Joi.string()`: Define que o campo é uma string
- `.min(5)`: Mínimo 5 caracteres
- `.max(15)`: Máximo 15 caracteres
- `.required()`: Campo obrigatório
- `.optional()`: Campo opcional
- `.email()`: Valida formato de email
- `.valid('admin', 'gestor', 'colaborador')`: Só aceita esses valores
- `.messages({})`: Mensagens de erro personalizadas
- `export {}`: Exporta os schemas para usar em outros arquivos


### PASSO 2: Criar user.repository.js

**O que faz:** Faz as queries (consultas) no banco de dados usando Prisma

Arquivo: `src/modules/users/user.repository.js`

```javascript
import { prisma } from '../../config/database.js';

class UserRepository {
  // Criar novo usuário
  async create(data) {
    return prisma.user.create({ data });
  }

  // Buscar usuário por email
  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  // Buscar usuário por RA
  async findByRA(ra) {
    return prisma.user.findUnique({ where: { ra } });
  }

  // Buscar usuário por ID
  async findById(id) {
    return prisma.user.findUnique({ where: { id } });
  }

  // Listar todos os usuários com paginação e filtros
  async findAll({ page = 1, limit = 10, tipo, departamento }) {
    const skip = (page - 1) * limit; // Quantos registros pular
    const where = {}; // Objeto de filtros

    // Se passou tipo, adiciona no filtro
    if (tipo) where.tipo = tipo;
    
    // Se passou departamento, adiciona no filtro
    if (departamento) where.departamento = departamento;

    // Busca usuários e conta total em paralelo
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          ra: true,
          nome: true,
          email: true,
          tipo: true,
          cargo: true,
          departamento: true,
          foto: true,
          createdAt: true
          // Não retorna a senha!
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Atualizar usuário
  async update(id, data) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        ra: true,
        nome: true,
        email: true,
        tipo: true,
        cargo: true,
        departamento: true,
        foto: true
        // Não retorna a senha!
      }
    });
  }

  // Deletar usuário
  async delete(id) {
    return prisma.user.delete({ where: { id } });
  }

  // Verificar se email já existe
  async emailExists(email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });
    return !!user; // Retorna true se encontrou, false se não
  }

  // Verificar se RA já existe
  async raExists(ra) {
    const user = await prisma.user.findUnique({
      where: { ra },
      select: { id: true }
    });
    return !!user; // Retorna true se encontrou, false se não
  }
}

export { UserRepository };
```

**Explicação dos conceitos:**

**O que é `prisma`?**
- É um ORM (Object-Relational Mapping)
- Traduz código JavaScript em SQL
- Facilita trabalhar com banco de dados

**O que é `async/await`?**
- `async`: Marca uma função como assíncrona
- `await`: Espera uma operação terminar antes de continuar
- Usado para operações que demoram (banco de dados, APIs, etc)

**O que é `Promise.all()`?**
- Executa várias operações ao mesmo tempo
- Espera todas terminarem
- Mais rápido que fazer uma por vez

**O que é `select`?**
- Define quais campos retornar do banco
- Usado para não retornar a senha

**O que é `where`?**
- Define filtros para a busca
- Exemplo: `where: { email: 'joao@eniac.edu.br' }`

**O que é paginação?**
- Dividir resultados em páginas
- `skip`: Quantos registros pular
- `take`: Quantos registros pegar
- Exemplo: Página 2 com 10 por página = pula 10, pega 10

---

### PASSO 3: Criar user.service.js

**O que faz:** Contém a lógica de negócio (regras, validações, etc)

Arquivo: `src/modules/users/user.service.js`

```javascript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../../utils/errors.js';

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  // Cadastrar novo usuário
  async register(data) {
    // 1. Verifica se email já existe
    const emailExists = await this.userRepository.emailExists(data.email);
    if (emailExists) {
      throw new AppError('Email já cadastrado', 400);
    }

    // 2. Verifica se RA já existe
    const raExists = await this.userRepository.raExists(data.ra);
    if (raExists) {
      throw new AppError('RA já cadastrado', 400);
    }

    // 3. Criptografa a senha
    const hashedPassword = await bcrypt.hash(data.senha, 10);

    // 4. Cria o usuário no banco
    const user = await this.userRepository.create({
      ...data,
      senha: hashedPassword
    });

    // 5. Remove a senha antes de retornar
    delete user.senha;

    return user;
  }

  // Fazer login
  async login(email, senha) {
    // 1. Busca usuário por email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Email ou senha inválidos', 401);
    }

    // 2. Verifica se a senha está correta
    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (!isPasswordValid) {
      throw new AppError('Email ou senha inválidos', 401);
    }

    // 3. Gera token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        tipo: user.tipo,
        ra: user.ra
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 4. Remove senha antes de retornar
    delete user.senha;

    // Retorna user e token (token será colocado em cookie pelo controller)
    return { user, token };
  }

  // Ver perfil
  async getProfile(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    delete user.senha;
    return user;
  }

  // Atualizar perfil
  async updateProfile(userId, data) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const updated = await this.userRepository.update(userId, data);
    return updated;
  }

  // Listar usuários
  async findAll(filters, userTipo) {
    // Colaborador não pode listar usuários
    if (userTipo === 'colaborador') {
      throw new AppError('Sem permissão para listar usuários', 403);
    }

    return this.userRepository.findAll(filters);
  }

  // Buscar usuário por ID
  async findById(id, requestUserId, requestUserTipo) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Colaborador só pode ver próprio perfil
    if (requestUserTipo === 'colaborador' && id !== requestUserId) {
      throw new AppError('Sem permissão para ver este usuário', 403);
    }

    delete user.senha;
    return user;
  }

  // Buscar usuário por RA
  async findByRA(ra) {
    const user = await this.userRepository.findByRA(ra);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    delete user.senha;
    return user;
  }

  // Deletar usuário
  async delete(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Não pode deletar admin
    if (user.tipo === 'admin') {
      throw new AppError('Não é possível deletar admin', 400);
    }

    await this.userRepository.delete(id);
    return { message: 'Usuário deletado com sucesso' };
  }
}

export { UserService };
```

**Explicação dos conceitos:**

**O que é bcrypt?**
- Biblioteca para criptografar senhas
- `bcrypt.hash(senha, 10)`: Criptografa a senha
- `bcrypt.compare(senha, hash)`: Compara senha com hash
- Nunca salve senhas em texto puro!

**O que é JWT (JSON Web Token)?**
- Token de autenticação
- Contém informações do usuário
- Usado para verificar se usuário está logado
- `jwt.sign()`: Cria o token
- `jwt.verify()`: Verifica se token é válido

**O que é `throw new AppError()`?**
- Lança um erro personalizado
- Para a execução da função
- Vai para o middleware de erro

**O que é status code?**
- 200: OK
- 201: Criado
- 400: Erro do cliente (dados inválidos)
- 401: Não autenticado
- 403: Sem permissão
- 404: Não encontrado
- 500: Erro do servidor

**O que é `...data` (spread operator)?**
- Copia todas as propriedades de um objeto
- Exemplo: `{ ...data, senha: hashedPassword }`
- Pega tudo de `data` e adiciona/substitui `senha`

---

### PASSO 4: Criar user.controller.js

**O que faz:** Recebe requisições HTTP e retorna respostas

Arquivo: `src/modules/users/user.controller.js`

```javascript
import { UserRepository } from './user.repository.js';
import { UserService } from './user.service.js';

// Cria instâncias
const userRepository = new UserRepository();
const userService = new UserService(userRepository);

class UserController {
  // POST /api/users/register
  async register(req, res, next) {
    try {
      const user = await userService.register(req.body);
      return res.status(201).json({
        success: true,
        data: user,
        message: 'Usuário cadastrado com sucesso'
      });
    } catch (error) {
      next(error); // Passa erro para middleware de erro
    }
  }

  // POST /api/users/login
  async login(req, res, next) {
    try {
      const { email, senha } = req.body;
      const result = await userService.login(email, senha);
      
      // ⚠️ AUTENTICAÇÃO PROFISSIONAL: Token em HttpOnly Cookie
      res.cookie('token', result.token, {
        httpOnly: true,      // Não acessível via JavaScript (protege contra XSS)
        secure: process.env.NODE_ENV === 'production', // Apenas HTTPS em produção
        sameSite: 'strict',  // Proteção CSRF
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 dias
      });
      
      // Retorna apenas dados do usuário (token está no cookie)
      return res.json({
        success: true,
        data: { user: result.user },
        message: 'Login realizado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/users/logout
  async logout(req, res, next) {
    try {
      // Limpa o cookie HttpOnly
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      return res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/users/profile
  async getProfile(req, res, next) {
    try {
      const user = await userService.getProfile(req.user.userId);
      return res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/users/profile
  async updateProfile(req, res, next) {
    try {
      const user = await userService.updateProfile(req.user.userId, req.body);
      return res.json({
        success: true,
        data: user,
        message: 'Perfil atualizado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/users
  async findAll(req, res, next) {
    try {
      const { page, limit, tipo, departamento } = req.query;
      const result = await userService.findAll(
        { 
          page: parseInt(page) || 1, 
          limit: parseInt(limit) || 10, 
          tipo,
          departamento
        },
        req.user.tipo
      );
      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/users/:id
  async findById(req, res, next) {
    try {
      const user = await userService.findById(
        req.params.id,
        req.user.userId,
        req.user.tipo
      );
      return res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/users/ra/:ra
  async findByRA(req, res, next) {
    try {
      const user = await userService.findByRA(req.params.ra);
      return res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/users/:id
  async delete(req, res, next) {
    try {
      const result = await userService.delete(req.params.id);
      return res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

export { UserController };
```

**Explicação dos conceitos:**

**O que é `req` (request)?**
- Objeto com dados da requisição HTTP
- `req.body`: Dados enviados no body (POST/PUT)
- `req.params`: Parâmetros da URL (/users/:id)
- `req.query`: Query params (?page=1&limit=10)
- `req.user`: Dados do usuário logado (adicionado pelo middleware)

**O que é `res` (response)?**
- Objeto para enviar resposta HTTP
- `res.json()`: Envia resposta em JSON
- `res.status(201)`: Define status code
- `res.send()`: Envia resposta em texto

**O que é `next`?**
- Função para passar para próximo middleware
- `next(error)`: Passa erro para middleware de erro

**O que é `try/catch`?**
- Trata erros
- `try`: Tenta executar o código
- `catch`: Se der erro, executa isso
- Evita que aplicação quebre

**Por que usar `parseInt()`?**
- Query params vêm como string
- `parseInt()` converte para número
- Exemplo: "10" → 10

---

### PASSO 5: Criar middlewares de autenticação

**O que faz:** Verifica se usuário está logado e tem permissão

Arquivo: `src/middlewares/auth.js`

```javascript
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors.js';

// ⚠️ AUTENTICAÇÃO PROFISSIONAL: Lê token do HttpOnly Cookie
const authMiddleware = (req, res, next) => {
  try {
    // 1. Pega o token do cookie (não do header Authorization)
    const token = req.cookies.token;

    if (!token) {
      throw new AppError('Token não fornecido', 401);
    }

    // 2. Verifica se token é válido
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        throw new AppError('Token inválido ou expirado', 401);
      }

      // 3. Adiciona dados do usuário no req
      req.user = decoded;
      return next();
    });
  } catch (error) {
    next(error);
  }
};

// Middleware para verificar se é admin
const isAdminMiddleware = (req, res, next) => {
  if (req.user.tipo !== 'admin') {
    return next(new AppError('Acesso negado. Apenas administradores', 403));
  }
  next();
};

// Middleware para verificar se é gestor ou admin
const isGestorOrAdminMiddleware = (req, res, next) => {
  if (req.user.tipo !== 'admin' && req.user.tipo !== 'gestor') {
    return next(new AppError('Acesso negado. Apenas gestores ou administradores', 403));
  }
  next();
};

export {
  authMiddleware,
  isAdminMiddleware,
  isGestorOrAdminMiddleware
};
```

**Explicação dos conceitos:**

**O que é middleware?**
- Função que executa entre a requisição e a resposta
- Pode modificar `req` e `res`
- Pode parar a requisição ou passar para próximo

**Como funciona o fluxo?**
```
Request → authMiddleware → isAdminMiddleware → Controller → Response
```

**O que é `req.cookies.token`?**
- Cookie HTTP que contém o token JWT
- Enviado automaticamente pelo navegador
- Formato: `token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Por que usar HttpOnly Cookie?**
- ✅ Não acessível via JavaScript (protege contra XSS)
- ✅ Enviado automaticamente em cada requisição
- ✅ Pode ter expiração automática
- ✅ Mais seguro que localStorage/sessionStorage

**O que é `jwt.verify()`?**
- Verifica se token é válido
- Decodifica o token
- Retorna os dados que foram colocados no `jwt.sign()`

---

### PASSO 6: Criar user.routes.js

**O que faz:** Define as rotas (URLs) e quais middlewares usar

Arquivo: `src/modules/users/user.routes.js`

```javascript
import express from 'express';
import { UserController } from './user.controller.js';
import { authMiddleware, isAdminMiddleware, isGestorOrAdminMiddleware } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { registerSchema, loginSchema, updateProfileSchema } from './user.validation.js';

const router = express.Router();
const userController = new UserController();

// Rotas públicas (não precisa estar logado)
router.post('/login', validate(loginSchema), (req, res, next) => userController.login(req, res, next));
router.post('/logout', (req, res, next) => userController.logout(req, res, next)); // Logout não precisa de auth (apenas limpa cookie)

// Rotas protegidas (precisa estar logado)
router.use(authMiddleware);

router.get('/profile', (req, res, next) => userController.getProfile(req, res, next));
router.put('/profile', validate(updateProfileSchema), (req, res, next) => userController.updateProfile(req, res, next));

router.get('/ra/:ra', (req, res, next) => userController.findByRA(req, res, next));

// Rotas de gestor/admin
router.get('/', isGestorOrAdminMiddleware, (req, res, next) => userController.findAll(req, res, next));
router.get('/:id', isGestorOrAdminMiddleware, (req, res, next) => userController.findById(req, res, next));

// Rotas de admin
router.post('/register', isAdminMiddleware, validate(registerSchema), (req, res, next) => userController.register(req, res, next));
router.delete('/:id', isAdminMiddleware, (req, res, next) => userController.delete(req, res, next));

export default router;
```

**Explicação dos conceitos:**

**O que é `express.Router()`?**
- Cria um roteador
- Agrupa rotas relacionadas
- Facilita organização

**O que é `router.use(authMiddleware)`?**
- Aplica middleware em todas as rotas abaixo
- Todas as rotas depois disso precisam de autenticação

**Ordem dos middlewares importa?**
- SIM! Executam na ordem que você coloca
- Exemplo: `validate` → `authMiddleware` → `isAdminMiddleware` → `controller`

**O que é `validate(schema)`?**
- Middleware que valida os dados
- Usa os schemas do Joi
- Se dados inválidos, retorna erro 400

**Por que `(req, res, next) => controller.method()`?**
- Arrow function para chamar o método do controller
- Passa req, res e next para o controller

---

### PASSO 7: Adicionar rotas no app.js

Arquivo: `src/app.js` (adicionar esta linha)

```javascript
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // IMPORTANTE: Para ler cookies
import userRoutes from './modules/users/user.routes.js';

const app = express();

// ⚠️ IMPORTANTE: Configurar cookie-parser ANTES das rotas
app.use(cookieParser());

// ⚠️ IMPORTANTE: CORS com credentials para aceitar cookies
app.use(cors({
  origin: 'http://localhost:5500', // URL do frontend
  credentials: true // Permite envio de cookies
}));

app.use(express.json());

app.use('/api/users', userRoutes);

export default app;
```

**O que isso faz?**
- Registra todas as rotas de usuários
- Prefixo `/api/users` para todas as rotas
- Exemplo: `POST /api/users/login`, `GET /api/users/profile`
- **cookieParser**: Permite ler cookies do req.cookies
- **credentials: true**: Permite navegador enviar/receber cookies

---

## Como Testar no Postman

### 1. Popular o banco de dados

Primeiro, rode o seed para criar usuários de teste:

```bash
npm run prisma:seed
```

### 2. Login como admin

```http
POST http://localhost:3000/api/users/login
Content-Type: application/json

{
  "email": "admin@eniac.edu.br",
  "senha": "admin123"
}
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "ra": "1234567",
      "nome": "Admin Sistema",
      "email": "admin@eniac.edu.br",
      "tipo": "admin"
    }
  },
  "message": "Login realizado com sucesso"
}
```

**Cookie (automático - visível em Headers → Set-Cookie):**
```
Set-Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; SameSite=Strict; Max-Age=2592000
```

**IMPORTANTE:** 
- O token está no cookie HttpOnly (não no body da resposta)
- Postman salva o cookie automaticamente
- Nas próximas requisições, o cookie é enviado automaticamente

### 3. Ver próprio perfil

```http
GET http://localhost:3000/api/users/profile
```

**NOTA:** Não precisa adicionar header Authorization! O cookie é enviado automaticamente pelo Postman.

### 4. Fazer logout

```http
POST http://localhost:3000/api/users/logout
```

**Resposta:**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

O cookie é limpo automaticamente.

### 5. Cadastrar novo usuário (como admin)

```http
POST http://localhost:3000/api/users/register
Content-Type: application/json

{
  "ra": "2021003",
  "nome": "Pedro Santos",
  "email": "pedro@eniac.edu.br",
  "senha": "senha123",
  "tipo": "gestor",
  "cargo": "Gerente de Vendas",
  "departamento": "Comercial"
}
```

**NOTA:** Cookie é enviado automaticamente (você está autenticado como admin).

### 6. Listar usuários

```http
GET http://localhost:3000/api/users
```

**Com filtros:**
```http
GET http://localhost:3000/api/users?tipo=gestor&departamento=TI&page=1&limit=10
```

### 7. Buscar por RA

```http
GET http://localhost:3000/api/users/ra/2021003
```

### 8. Atualizar perfil

```http
PUT http://localhost:3000/api/users/profile
Content-Type: application/json

{
  "nome": "Pedro Santos Silva",
  "cargo": "Gerente Sênior de Vendas"
}
```

### 9. Deletar usuário (como admin)

```http
DELETE http://localhost:3000/api/users/uuid-do-usuario
```

### 10. Testar permissões (deve dar erro)

**Tentar cadastrar como gestor:**
```http
# 1. Fazer logout do admin
POST http://localhost:3000/api/users/logout

# 2. Login como gestor
POST http://localhost:3000/api/users/login
Content-Type: application/json

{
  "email": "joao@eniac.edu.br",
  "senha": "senha123"
}

# 3. Tentar cadastrar (vai dar erro 403)
POST http://localhost:3000/api/users/register
Content-Type: application/json

{
  "ra": "2022004",
  "nome": "Teste",
  "email": "teste@eniac.edu.br",
  "senha": "senha123",
  "tipo": "colaborador"
}
```

**Resposta esperada:**
```json
{
  "success": false,
  "message": "Acesso negado. Apenas administradores"
}
```

---

## Credenciais de Teste

Depois de rodar o seed, você terá:

```
Admin:
  RA: 1234567
  Email: admin@eniac.edu.br
  Senha: admin123

Gestor:
  RA: 2021001
  Email: joao@eniac.edu.br
  Senha: senha123

Colaborador:
  RA: 2022001
  Email: ana@eniac.edu.br
  Senha: senha123
```

**LEMBRE-SE:** Use RAs reais das pessoas quando for usar em produção!

---

## Checklist de Implementação

- [ ] Criar `src/modules/users/user.validation.js`
- [ ] Criar `src/modules/users/user.repository.js`
- [ ] Criar `src/modules/users/user.service.js`
- [ ] Criar `src/modules/users/user.controller.js`
- [ ] Criar `src/middlewares/auth.js`
- [ ] Criar `src/modules/users/user.routes.js`
- [ ] Adicionar rotas no `src/app.js`
- [ ] Atualizar `prisma/schema.prisma` (adicionar campo `ra`)
- [ ] Rodar migration: `npx prisma migrate dev --name add-ra`
- [ ] Atualizar `prisma/seed.js` (adicionar RAs)
- [ ] Rodar seed: `npm run prisma:seed`
- [ ] Testar todos os endpoints no Postman
- [ ] Testar permissões (admin, gestor, colaborador)

---

## Erros Comuns e Como Resolver

### Erro: "Token não fornecido"
**Causa:** Esqueceu de adicionar o header Authorization
**Solução:** Adicione `Authorization: Bearer SEU_TOKEN`

### Erro: "Token inválido"
**Causa:** Token expirou ou está errado
**Solução:** Faça login novamente para pegar novo token

### Erro: "Email já cadastrado"
**Causa:** Tentou cadastrar com email que já existe
**Solução:** Use outro email

### Erro: "RA já cadastrado"
**Causa:** Tentou cadastrar com RA que já existe
**Solução:** Use outro RA

### Erro: "Acesso negado"
**Causa:** Usuário não tem permissão para essa ação
**Solução:** Faça login com usuário que tem permissão (admin ou gestor)

### Erro: "Usuário não encontrado"
**Causa:** ID ou RA não existe no banco
**Solução:** Verifique se o ID/RA está correto

---

## Próximos Passos

Agora que você terminou o módulo de usuários, os próximos estagiários vão implementar:

- **Estagiário 2**: Módulo de Avaliações e Nine Box
- **Estagiário 3**: Módulo de Competências e Relatórios

Todos seguem o mesmo padrão:
1. Validation (Joi)
2. Repository (Prisma)
3. Service (Lógica)
4. Controller (HTTP)
5. Routes (URLs)

---

Qualquer dúvida, chama! 🚀
