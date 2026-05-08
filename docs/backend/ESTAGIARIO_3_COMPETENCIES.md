# ESTAGIÁRIO 3 - Módulo de Competências (Competencies)

## ⚠️ IMPORTANTE: ES Modules

Este projeto usa **ES Modules** (`import/export`) ao invés de CommonJS (`require/module.exports`).

**Configure no package.json:**
```json
{
  "type": "module"
}
```

---

## Sua Responsabilidade

Você vai cuidar de **tudo relacionado a competências**:
- Cadastro de competências (apenas admin)
- Listagem de competências (todos podem ver)
- Edição de competências (apenas admin)
- Exclusão de competências (apenas admin)
- Filtros e busca de competências

**Stack (tecnologias que você vai usar):**
- Node.js + Express (servidor web)
- Prisma (banco de dados)
- JWT (autenticação)
- Joi (validação de dados)
- JavaScript puro (sem TypeScript)

---

## O que são Competências?

Competências são **habilidades e comportamentos** que a empresa valoriza e avalia nos colaboradores. Exemplos:
- Comunicação
- Trabalho em equipe
- Liderança
- Resolução de problemas
- Pensamento crítico

Cada competência tem:
- **Nome**: Ex: "Comunicação"
- **Descrição**: Ex: "Capacidade de se expressar claramente"
- **Tipo**: `tecnica` ou `comportamental`
- **Competência de**: `gestor` ou `colaborador` (quem deve ter essa competência)
- **Critérios**: Lista de critérios de avaliação

---

## Seus Endpoints (6 no total)

### 1. POST /api/competencies
**O que faz:** Cadastra uma competência nova (só admin pode fazer isso)

**Body (dados que você envia):**
```json
{
  "nome": "Comunicação",
  "descricao": "Capacidade de se expressar claramente e ouvir ativamente",
  "tipo": "comportamental",
  "competenciaDe": "colaborador",
  "criterios": [
    "Clareza na comunicação verbal",
    "Clareza na comunicação escrita",
    "Escuta ativa",
    "Feedback construtivo"
  ]
}
```

**Regras:**
- Só admin pode cadastrar competências
- Nome deve ser único (não pode repetir)
- Tipo deve ser: `tecnica` ou `comportamental`
- Competência de deve ser: `gestor` ou `colaborador`
- Critérios devem ser um array com pelo menos 1 item

### 2. GET /api/competencies
**O que faz:** Listar todas as competências (todos podem ver)

**Aceita filtros:**
```
GET /api/competencies?tipo=tecnica&competenciaDe=gestor&page=1&limit=10
```

### 3. GET /api/competencies/:id
**O que faz:** Buscar competência por ID

**Exemplo:**
```
GET /api/competencies/uuid-da-competencia
```

### 4. GET /api/competencies/nome/:nome
**O que faz:** Buscar competência por nome

**Exemplo:**
```
GET /api/competencies/nome/Comunicação
```

### 5. PUT /api/competencies/:id
**O que faz:** Atualizar competência (só admin)

**Body:**
```json
{
  "descricao": "Nova descrição",
  "criterios": [
    "Novo critério 1",
    "Novo critério 2"
  ]
}
```

### 6. DELETE /api/competencies/:id
**O que faz:** Deletar competência (só admin)

**Exemplo:**
```
DELETE /api/competencies/uuid-da-competencia
```

---

## Sistema de Permissões

### Admin
- Pode cadastrar, editar e deletar competências
- Vê todas as competências

### Gestor
- Pode ver todas as competências
- Não pode cadastrar, editar ou deletar

### Colaborador
- Pode ver todas as competências
- Não pode cadastrar, editar ou deletar

---

## Estrutura dos Arquivos

```
src/modules/competencies/
├── competency.controller.js    # Recebe requisições HTTP
├── competency.service.js       # Lógica de negócio
├── competency.repository.js    # Queries no banco (Prisma)
├── competency.routes.js        # Define as rotas
└── competency.validation.js    # Validações com Joi
```

**Padrão de fluxo:**
```
HTTP Request → Controller → Service → Repository → Database
                    ↓
HTTP Response ← Controller ← Service ← Repository ← Database
```

---

## Schema Prisma (Banco de Dados)

```prisma
model Competency {
  id             String         @id @default(uuid())
  nome           String         @unique
  descricao      String
  tipo           TipoCompetencia
  competenciaDe  CompetenciaDe
  criterios      Json
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  @@index([nome])
  @@map("competencies")
}

enum TipoCompetencia {
  tecnica
  comportamental
}

enum CompetenciaDe {
  gestor
  colaborador
}
```

**Explicação dos campos:**
- `id`: Identificador único (UUID gerado automaticamente)
- `nome`: Nome da competência (único)
- `descricao`: Descrição detalhada
- `tipo`: Tipo de competência (técnica ou comportamental)
- `competenciaDe`: Para quem é a competência (gestor ou colaborador)
- `criterios`: Array de critérios de avaliação (JSON)
- `createdAt`: Data de criação (automático)
- `updatedAt`: Data de atualização (automático)

---

## Implementação Passo a Passo

### PASSO 1: Criar competency.validation.js

**O que faz:** Define as regras de validação dos dados usando Joi

Arquivo: `src/modules/competencies/competency.validation.js`

```javascript
import Joi from 'joi';

// Validação para cadastro de competência
const createSchema = Joi.object({
  nome: Joi.string()
    .min(3)
    .required()
    .messages({
      'string.min': 'Nome deve ter no mínimo 3 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
  descricao: Joi.string()
    .min(10)
    .required()
    .messages({
      'string.min': 'Descrição deve ter no mínimo 10 caracteres',
      'any.required': 'Descrição é obrigatória'
    }),
  tipo: Joi.string()
    .valid('tecnica', 'comportamental')
    .required()
    .messages({
      'any.only': 'Tipo deve ser: tecnica ou comportamental',
      'any.required': 'Tipo é obrigatório'
    }),
  competenciaDe: Joi.string()
    .valid('gestor', 'colaborador')
    .required()
    .messages({
      'any.only': 'Competência de deve ser: gestor ou colaborador',
      'any.required': 'Competência de é obrigatório'
    }),
  criterios: Joi.array()
    .items(Joi.string().min(3))
    .min(1)
    .required()
    .messages({
      'array.min': 'Deve ter pelo menos 1 critério',
      'any.required': 'Critérios são obrigatórios'
    })
});

// Validação para atualizar competência
const updateSchema = Joi.object({
  nome: Joi.string().min(3).optional(),
  descricao: Joi.string().min(10).optional(),
  tipo: Joi.string().valid('tecnica', 'comportamental').optional(),
  competenciaDe: Joi.string().valid('gestor', 'colaborador').optional(),
  criterios: Joi.array().items(Joi.string().min(3)).min(1).optional()
});

// Exporta os schemas
export {
  createSchema,
  updateSchema
};
```

---

### PASSO 2: Criar competency.repository.js

**O que faz:** Faz as queries (consultas) no banco de dados usando Prisma

Arquivo: `src/modules/competencies/competency.repository.js`

```javascript
import { prisma } from '../../config/database.js';

class CompetencyRepository {
  // Criar nova competência
  async create(data) {
    return prisma.competency.create({ data });
  }

  // Buscar competência por nome
  async findByNome(nome) {
    return prisma.competency.findUnique({ where: { nome } });
  }

  // Buscar competência por ID
  async findById(id) {
    return prisma.competency.findUnique({ where: { id } });
  }

  // Listar todas as competências com paginação e filtros
  async findAll({ page = 1, limit = 10, tipo, competenciaDe }) {
    const skip = (page - 1) * limit;
    const where = {};

    // Se passou tipo, adiciona no filtro
    if (tipo) where.tipo = tipo;
    
    // Se passou competenciaDe, adiciona no filtro
    if (competenciaDe) where.competenciaDe = competenciaDe;

    // Busca competências e conta total em paralelo
    const [competencies, total] = await Promise.all([
      prisma.competency.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nome: 'asc' }
      }),
      prisma.competency.count({ where })
    ]);

    return {
      competencies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Atualizar competência
  async update(id, data) {
    return prisma.competency.update({
      where: { id },
      data
    });
  }

  // Deletar competência
  async delete(id) {
    return prisma.competency.delete({ where: { id } });
  }

  // Verificar se nome já existe
  async nomeExists(nome) {
    const competency = await prisma.competency.findUnique({
      where: { nome },
      select: { id: true }
    });
    return !!competency;
  }
}

export { CompetencyRepository };
```

---

### PASSO 3: Criar competency.service.js

**O que faz:** Contém a lógica de negócio (regras, validações, etc)

Arquivo: `src/modules/competencies/competency.service.js`

```javascript
import { AppError } from '../../utils/errors.js';

class CompetencyService {
  constructor(competencyRepository) {
    this.competencyRepository = competencyRepository;
  }

  // Cadastrar nova competência
  async create(data) {
    // Verifica se nome já existe
    const nomeExists = await this.competencyRepository.nomeExists(data.nome);
    if (nomeExists) {
      throw new AppError('Competência com este nome já existe', 400);
    }

    // Cria a competência no banco
    const competency = await this.competencyRepository.create(data);
    return competency;
  }

  // Listar competências
  async findAll(filters) {
    return this.competencyRepository.findAll(filters);
  }

  // Buscar competência por ID
  async findById(id) {
    const competency = await this.competencyRepository.findById(id);
    if (!competency) {
      throw new AppError('Competência não encontrada', 404);
    }
    return competency;
  }

  // Buscar competência por nome
  async findByNome(nome) {
    const competency = await this.competencyRepository.findByNome(nome);
    if (!competency) {
      throw new AppError('Competência não encontrada', 404);
    }
    return competency;
  }

  // Atualizar competência
  async update(id, data) {
    const competency = await this.competencyRepository.findById(id);
    if (!competency) {
      throw new AppError('Competência não encontrada', 404);
    }

    // Se está alterando o nome, verifica se já existe
    if (data.nome && data.nome !== competency.nome) {
      const nomeExists = await this.competencyRepository.nomeExists(data.nome);
      if (nomeExists) {
        throw new AppError('Competência com este nome já existe', 400);
      }
    }

    const updated = await this.competencyRepository.update(id, data);
    return updated;
  }

  // Deletar competência
  async delete(id) {
    const competency = await this.competencyRepository.findById(id);
    if (!competency) {
      throw new AppError('Competência não encontrada', 404);
    }

    await this.competencyRepository.delete(id);
    return { message: 'Competência deletada com sucesso' };
  }
}

export { CompetencyService };
```

---

### PASSO 4: Criar competency.controller.js

**O que faz:** Recebe requisições HTTP e retorna respostas

Arquivo: `src/modules/competencies/competency.controller.js`

```javascript
import { CompetencyRepository } from './competency.repository.js';
import { CompetencyService } from './competency.service.js';

// Cria instâncias
const competencyRepository = new CompetencyRepository();
const competencyService = new CompetencyService(competencyRepository);

class CompetencyController {
  // POST /api/competencies
  async create(req, res, next) {
    try {
      const competency = await competencyService.create(req.body);
      return res.status(201).json({
        success: true,
        data: competency,
        message: 'Competência cadastrada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/competencies
  async findAll(req, res, next) {
    try {
      const { page, limit, tipo, competenciaDe } = req.query;
      const result = await competencyService.findAll({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        tipo,
        competenciaDe
      });
      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/competencies/:id
  async findById(req, res, next) {
    try {
      const competency = await competencyService.findById(req.params.id);
      return res.json({
        success: true,
        data: competency
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/competencies/nome/:nome
  async findByNome(req, res, next) {
    try {
      const competency = await competencyService.findByNome(req.params.nome);
      return res.json({
        success: true,
        data: competency
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/competencies/:id
  async update(req, res, next) {
    try {
      const competency = await competencyService.update(req.params.id, req.body);
      return res.json({
        success: true,
        data: competency,
        message: 'Competência atualizada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/competencies/:id
  async delete(req, res, next) {
    try {
      const result = await competencyService.delete(req.params.id);
      return res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

export { CompetencyController };
```

---

### PASSO 5: Criar competency.routes.js

**O que faz:** Define as rotas (URLs) e quais middlewares usar

Arquivo: `src/modules/competencies/competency.routes.js`

```javascript
import express from 'express';
import { CompetencyController } from './competency.controller.js';
import { authMiddleware, isAdminMiddleware } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { createSchema, updateSchema } from './competency.validation.js';

const router = express.Router();
const competencyController = new CompetencyController();

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

// Rotas públicas (todos podem ver)
router.get('/', (req, res, next) => competencyController.findAll(req, res, next));
router.get('/nome/:nome', (req, res, next) => competencyController.findByNome(req, res, next));
router.get('/:id', (req, res, next) => competencyController.findById(req, res, next));

// Rotas de admin (apenas admin pode criar/editar/deletar)
router.post('/', isAdminMiddleware, validate(createSchema), (req, res, next) => competencyController.create(req, res, next));
router.put('/:id', isAdminMiddleware, validate(updateSchema), (req, res, next) => competencyController.update(req, res, next));
router.delete('/:id', isAdminMiddleware, (req, res, next) => competencyController.delete(req, res, next));

export default router;
```

---

### PASSO 6: Adicionar rotas no app.js

Arquivo: `src/app.js` (adicionar esta linha)

```javascript
import competencyRoutes from './modules/competencies/competency.routes.js';

// ... outras configurações ...

app.use('/api/competencies', competencyRoutes);
```

---

## Como Testar no Postman

### 1. Login como admin

```http
POST http://localhost:3000/api/users/login
Content-Type: application/json

{
  "email": "admin@eniac.edu.br",
  "senha": "admin123"
}
```

**IMPORTANTE:** Copie o token da resposta!

### 2. Cadastrar competência (como admin)

```http
POST http://localhost:3000/api/competencies
Authorization: Bearer SEU_TOKEN_ADMIN
Content-Type: application/json

{
  "nome": "Comunicação",
  "descricao": "Capacidade de se expressar claramente e ouvir ativamente",
  "tipo": "comportamental",
  "competenciaDe": "colaborador",
  "criterios": [
    "Clareza na comunicação verbal",
    "Clareza na comunicação escrita",
    "Escuta ativa",
    "Feedback construtivo"
  ]
}
```

### 3. Listar competências

```http
GET http://localhost:3000/api/competencies
Authorization: Bearer SEU_TOKEN
```

**Com filtros:**
```http
GET http://localhost:3000/api/competencies?tipo=tecnica&competenciaDe=gestor&page=1&limit=10
Authorization: Bearer SEU_TOKEN
```

### 4. Buscar por nome

```http
GET http://localhost:3000/api/competencies/nome/Comunicação
Authorization: Bearer SEU_TOKEN
```

### 5. Atualizar competência (como admin)

```http
PUT http://localhost:3000/api/competencies/uuid-da-competencia
Authorization: Bearer SEU_TOKEN_ADMIN
Content-Type: application/json

{
  "descricao": "Nova descrição atualizada",
  "criterios": [
    "Critério atualizado 1",
    "Critério atualizado 2"
  ]
}
```

### 6. Deletar competência (como admin)

```http
DELETE http://localhost:3000/api/competencies/uuid-da-competencia
Authorization: Bearer SEU_TOKEN_ADMIN
```

### 7. Testar permissões (deve dar erro)

**Tentar cadastrar como gestor:**
```http
# 1. Login como gestor
POST http://localhost:3000/api/users/login
{
  "email": "joao@eniac.edu.br",
  "senha": "senha123"
}

# 2. Tentar cadastrar (vai dar erro 403)
POST http://localhost:3000/api/competencies
Authorization: Bearer TOKEN_DO_GESTOR
{
  "nome": "Teste",
  "descricao": "Descrição de teste",
  "tipo": "tecnica",
  "competenciaDe": "colaborador",
  "criterios": ["Critério 1"]
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

## Exemplos de Competências

### Competências Técnicas (Colaborador):
```json
{
  "nome": "Programação Backend",
  "descricao": "Desenvolvimento de APIs e serviços backend",
  "tipo": "tecnica",
  "competenciaDe": "colaborador",
  "criterios": [
    "Conhecimento em Node.js",
    "Conhecimento em bancos de dados",
    "Conhecimento em APIs REST",
    "Boas práticas de código"
  ]
}
```

### Competências Comportamentais (Gestor):
```json
{
  "nome": "Liderança",
  "descricao": "Capacidade de liderar e motivar equipes",
  "tipo": "comportamental",
  "competenciaDe": "gestor",
  "criterios": [
    "Inspirar e motivar a equipe",
    "Tomar decisões estratégicas",
    "Resolver conflitos",
    "Desenvolver talentos"
  ]
}
```

---

## Checklist de Implementação

- [ ] Criar model Competency no schema.prisma
- [ ] Rodar migration: `npx prisma migrate dev --name create_competencies`
- [ ] Criar `src/modules/competencies/competency.validation.js`
- [ ] Criar `src/modules/competencies/competency.repository.js`
- [ ] Criar `src/modules/competencies/competency.service.js`
- [ ] Criar `src/modules/competencies/competency.controller.js`
- [ ] Criar `src/modules/competencies/competency.routes.js`
- [ ] Adicionar rota em `src/app.js`
- [ ] Testar no Postman (todos os endpoints)
- [ ] Testar permissões (admin vs gestor vs colaborador)

---

## Resumo

Agora você tem o módulo de competências completo! Ele permite:

- ✅ CRUD completo de competências (apenas admin)
- ✅ Listagem com filtros (todos podem ver)
- ✅ Validação de nome único
- ✅ Tipos: técnica ou comportamental
- ✅ Competência de: gestor ou colaborador
- ✅ Critérios de avaliação personalizados
- ✅ Controle de permissões rigoroso
- ✅ Paginação e filtros

---

Qualquer dúvida, chama! 🚀
