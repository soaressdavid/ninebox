# ESTAGIÁRIO 3 - Módulo de Competências e Relatórios

## ⚠️ IMPORTANTE: ES Modules

Este projeto usa **ES Modules** (`import/export`) ao invés de CommonJS (`require/module.exports`).

**Configure no package.json:**
```json
{
  "type": "module"
}
```

**Use:**
- ✅ `import express from 'express'`
- ✅ `export { CompetencyService }`
- ✅ `export default router`
- ❌ `const express = require('express')`
- ❌ `module.exports = { CompetencyService }`

---

## Sua Responsabilidade

Você vai cuidar do sistema de competências, relatórios e dashboard do Portal de Gestão de Pessoas usando JavaScript puro.

---

## Objetivos

1. Cadastro e gestão de competências
2. Critérios de avaliação de competências
3. Tipos de competências (Desempenho, Comportamento, Técnica, Liderança)
4. Dashboard com estatísticas gerais
5. Relatórios individuais e consolidados

---

## Endpoints que você vai criar

### 1. POST /api/competencies
**Criar nova competência (APENAS ADMIN)**

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "nome": "Delegar tarefas",
  "descricao": "Quanto à habilidade de delegar tarefas ao time, avalie:",
  "tipo": "lideranca",
  "competenciaDe": "gestor",
  "criterios": [
    "Delega tarefas de forma clara",
    "Acompanha o progresso",
    "Dá feedback construtivo",
    "Confia na equipe"
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nome": "Delegar tarefas",
    "descricao": "Quanto à habilidade de delegar tarefas ao time, avalie:",
    "tipo": "lideranca",
    "competenciaDe": "gestor",
    "criterios": [...],
    "createdAt": "2026-04-30T10:00:00.000Z"
  },
  "message": "Competência criada com sucesso"
}
```

**Regras de Permissão:**
- ✅ Apenas admin pode criar competências
- ❌ Gestor e colaborador NÃO podem criar

---

### 2. GET /api/competencies
**Listar competências (TODOS AUTENTICADOS)**

**Headers:**
```
Authorization: Bearer {token}
```

**Query Params:**
```
?tipo=lideranca
&competenciaDe=gestor
&page=1
&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "competencies": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

**Regras de Permissão:**
- ✅ Todos os usuários autenticados podem listar competências

---

### 3. GET /api/competencies/:id
**Buscar competência por ID (TODOS AUTENTICADOS)**

**Regras de Permissão:**
- ✅ Todos os usuários autenticados podem ver competências

---

### 4. PUT /api/competencies/:id
**Atualizar competência (APENAS ADMIN)**

**Regras de Permissão:**
- ✅ Apenas admin pode atualizar competências
- ❌ Gestor e colaborador NÃO podem atualizar

---

### 5. DELETE /api/competencies/:id
**Deletar competência (APENAS ADMIN)**

**Regras de Permissão:**
- ✅ Apenas admin pode deletar competências
- ❌ Gestor e colaborador NÃO podem deletar

---

### 6. GET /api/competencies/types
**Listar tipos de competências (TODOS AUTENTICADOS)**

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "value": "desempenho",
      "label": "Desempenho",
      "description": "Competências relacionadas ao desempenho no trabalho"
    },
    {
      "value": "comportamento",
      "label": "Comportamento",
      "description": "Competências comportamentais e atitudinais"
    },
    {
      "value": "tecnica",
      "label": "Técnica",
      "description": "Competências técnicas e conhecimentos específicos"
    },
    {
      "value": "lideranca",
      "label": "Liderança",
      "description": "Competências de liderança e gestão de pessoas"
    }
  ]
}
```

**Regras de Permissão:**
- ✅ Todos os usuários autenticados podem ver tipos

---

### 7. GET /api/reports/dashboard
**Dashboard geral do sistema (GESTOR OU ADMIN)**

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "usuarios": {
      "total": 150,
      "gestores": 25,
      "colaboradores": 125
    },
    "avaliacoes": {
      "total": 450,
      "porTipo": {
        "gestor": 100,
        "colaborador": 350
      },
      "mediaGeral": 4.3,
      "ultimaSemana": 15
    },
    "nineBox": {
      "total": 120,
      "distribuicao": {
        "Superstar": 10,
        "Estrela": 25,
        "Especialista": 30,
        "Núcleo": 35,
        "Trabalhador": 15,
        "Âncora": 3,
        "Enigma": 1,
        "Dilema": 1,
        "Questão": 0
      }
    },
    "competencias": {
      "total": 25,
      "porTipo": {
        "desempenho": 8,
        "comportamento": 7,
        "tecnica": 6,
        "lideranca": 4
      }
    }
  }
}
```

**Regras de Permissão:**
- ✅ Admin: vê dashboard completo
- ✅ Gestor: vê dashboard da sua equipe
- ❌ Colaborador: NÃO tem acesso ao dashboard

---

### 8. GET /api/reports/user/:userId
**Relatório completo de um usuário**

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": "uuid",
      "nome": "João Silva",
      "email": "joao@empresa.com",
      "tipo": "gestor",
      "departamento": "TI",
      "foto": "url"
    },
    "avaliacoes": {
      "total": 15,
      "mediaGeral": 4.5,
      "criterios": {
        "pontualidade": 4.8,
        "comunicacao": 4.2,
        "tecnico": 4.6,
        "proatividade": 4.3,
        "equipe": 4.7
      },
      "evolucao": [
        { "mes": "Jan/26", "media": 4.2 },
        { "mes": "Fev/26", "media": 4.5 },
        { "mes": "Mar/26", "media": 4.6 }
      ],
      "ultimas": [...]
    },
    "nineBox": {
      "ultima": {
        "performance": 3,
        "potential": 2,
        "categoria": "Especialista",
        "data": "2026-04-15"
      },
      "historico": [...]
    },
    "competencias": {
      "avaliadas": 8,
      "mediaGeral": 3.5,
      "porTipo": {
        "desempenho": 3.8,
        "comportamento": 3.4,
        "tecnica": 3.6,
        "lideranca": 3.2
      }
    }
  }
}
```

**Regras de Permissão:**
- ✅ Admin: vê relatório de qualquer usuário
- ✅ Gestor: vê relatório de sua equipe
- ✅ Colaborador: vê apenas seu próprio relatório

---

### 9. GET /api/reports/team/:gestorId
**Relatório da equipe de um gestor (GESTOR OU ADMIN)**

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "gestor": {...},
    "equipe": [
      {
        "colaborador": {...},
        "mediaAvaliacoes": 4.3,
        "totalAvaliacoes": 12,
        "ultimaAvaliacao": "2026-04-20",
        "nineBox": "Núcleo"
      }
    ],
    "estatisticas": {
      "mediaEquipe": 4.2,
      "totalColaboradores": 8,
      "distribuicaoNineBox": {...}
    }
  }
}
```

**Regras de Permissão:**
- ✅ Admin: vê relatório de qualquer equipe
- ✅ Gestor: vê apenas relatório de sua própria equipe
- ❌ Colaborador: NÃO tem acesso

---

### 10. GET /api/reports/export/:userId
**Exportar relatório em PDF/Excel** (Opcional - Avançado)

**Regras de Permissão:**
- ✅ Admin: exporta relatório de qualquer usuário
- ✅ Gestor: exporta relatório de sua equipe
- ✅ Colaborador: exporta apenas seu próprio relatório

---

## Rotas Protegidas

### competency.routes.js

```javascript
import express from 'express';
import { CompetencyController } from './competency.controller.js';
import { authMiddleware, isAdminMiddleware } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { 
  createCompetencySchema, 
  updateCompetencySchema 
} from './competency.validation.js';

const router = express.Router();
const competencyController = new CompetencyController();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Listar tipos de competências (todos autenticados)
router.get(
  '/types',
  (req, res, next) => competencyController.getTypes(req, res, next)
);

// Listar competências (todos autenticados)
router.get(
  '/',
  (req, res, next) => competencyController.findAll(req, res, next)
);

// Buscar competência por ID (todos autenticados)
router.get(
  '/:id',
  (req, res, next) => competencyController.findById(req, res, next)
);

// Criar competência (APENAS ADMIN)
router.post(
  '/',
  isAdminMiddleware,
  validate(createCompetencySchema),
  (req, res, next) => competencyController.create(req, res, next)
);

// Atualizar competência (APENAS ADMIN)
router.put(
  '/:id',
  isAdminMiddleware,
  validate(updateCompetencySchema),
  (req, res, next) => competencyController.update(req, res, next)
);

// Deletar competência (APENAS ADMIN)
router.delete(
  '/:id',
  isAdminMiddleware,
  (req, res, next) => competencyController.delete(req, res, next)
);

export default router;
```

### report.routes.js

```javascript
import express from 'express';
import { ReportController } from './report.controller.js';
import { authMiddleware, isGestorOrAdminMiddleware } from '../../middlewares/auth.js';

const router = express.Router();
const reportController = new ReportController();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Dashboard geral (GESTOR OU ADMIN)
router.get(
  '/dashboard',
  isGestorOrAdminMiddleware,
  (req, res, next) => reportController.getDashboard(req, res, next)
);

// Relatório de usuário (validação de permissão no service)
router.get(
  '/user/:userId',
  (req, res, next) => reportController.getUserReport(req, res, next)
);

// Relatório de equipe (validação de permissão no service)
router.get(
  '/team/:gestorId',
  isGestorOrAdminMiddleware,
  (req, res, next) => reportController.getTeamReport(req, res, next)
);

// Exportar relatório (validação de permissão no service)
router.get(
  '/export/:userId',
  (req, res, next) => reportController.exportReport(req, res, next)
);

module.exports = router;
```

### Validações no Service

**IMPORTANTE**: Além dos middlewares nas rotas, você deve validar permissões no service para relatórios:

```javascript
// report.service.js

/**
 * Gerar dashboard geral
 */
async getDashboard(userId, userTipo) {
  // Admin vê dashboard completo
  if (userTipo === 'admin') {
    return this.generateFullDashboard();
  }

  // Gestor vê dashboard da sua equipe
  if (userTipo === 'gestor') {
    return this.generateTeamDashboard(userId);
  }

  // Colaborador não tem acesso
  throw new AppError('Você não tem permissão para acessar o dashboard', 403);
}

/**
 * Gerar relatório de usuário
 */
async getUserReport(userId, requestUserId, requestUserTipo) {
  // Admin pode ver relatório de qualquer usuário
  if (requestUserTipo === 'admin') {
    return this.generateUserReport(userId);
  }

  // Gestor pode ver relatório de sua equipe
  if (requestUserTipo === 'gestor') {
    const isTeamMember = await this.userRepository.isTeamMember(requestUserId, userId);
    if (!isTeamMember && userId !== requestUserId) {
      throw new AppError('Você não tem permissão para ver este relatório', 403);
    }
    return this.generateUserReport(userId);
  }

  // Colaborador só pode ver seu próprio relatório
  if (userId !== requestUserId) {
    throw new AppError('Você não tem permissão para ver este relatório', 403);
  }

  return this.generateUserReport(userId);
}

/**
 * Gerar relatório de equipe
 */
async getTeamReport(gestorId, requestUserId, requestUserTipo) {
  // Admin pode ver relatório de qualquer equipe
  if (requestUserTipo === 'admin') {
    return this.generateTeamReport(gestorId);
  }

  // Gestor só pode ver relatório de sua própria equipe
  if (requestUserTipo === 'gestor' && gestorId !== requestUserId) {
    throw new AppError('Você não tem permissão para ver este relatório', 403);
  }

  return this.generateTeamReport(gestorId);
}

/**
 * Exportar relatório
 */
async exportReport(userId, requestUserId, requestUserTipo) {
  // Mesmas regras de getUserReport
  // Admin: qualquer usuário
  // Gestor: sua equipe
  // Colaborador: apenas próprio

  if (requestUserTipo === 'admin') {
    return this.generateExport(userId);
  }

  if (requestUserTipo === 'gestor') {
    const isTeamMember = await this.userRepository.isTeamMember(requestUserId, userId);
    if (!isTeamMember && userId !== requestUserId) {
      throw new AppError('Você não tem permissão para exportar este relatório', 403);
    }
    return this.generateExport(userId);
  }

  if (userId !== requestUserId) {
    throw new AppError('Você não tem permissão para exportar este relatório', 403);
  }

  return this.generateExport(userId);
}
```

---

## Estrutura de Arquivos

```
src/modules/competencies/
├── competency.controller.js    # Recebe requisições HTTP
├── competency.service.js       # Lógica de negócio
├── competency.repository.js    # Acesso ao banco (Prisma)
├── competency.routes.js        # Definição das rotas
└── competency.validation.js    # Validações com Joi

src/modules/reports/
├── report.controller.js
├── report.service.js
└── report.routes.js
```

---

## Exemplo de Implementação

### competency.validation.js

```javascript
import Joi from 'joi';

const createCompetencySchema = Joi.object({
  nome: Joi.string().min(3).required()
    .messages({
      'string.min': 'Nome deve ter no mínimo 3 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
  descricao: Joi.string().min(10).required()
    .messages({
      'string.min': 'Descrição deve ter no mínimo 10 caracteres'
    }),
  tipo: Joi.string()
    .valid('desempenho', 'comportamento', 'tecnica', 'lideranca')
    .required()
    .messages({
      'any.only': 'Tipo deve ser: desempenho, comportamento, tecnica ou lideranca'
    }),
  competenciaDe: Joi.string()
    .valid('gestor', 'colaborador', 'todos')
    .required(),
  criterios: Joi.array()
    .items(Joi.string().min(5))
    .min(2)
    .max(6)
    .required()
    .messages({
      'array.min': 'Deve ter no mínimo 2 critérios',
      'array.max': 'Deve ter no máximo 6 critérios'
    })
});

const updateCompetencySchema = Joi.object({
  nome: Joi.string().min(3).optional(),
  descricao: Joi.string().min(10).optional(),
  tipo: Joi.string()
    .valid('desempenho', 'comportamento', 'tecnica', 'lideranca')
    .optional(),
  competenciaDe: Joi.string()
    .valid('gestor', 'colaborador', 'todos')
    .optional(),
  criterios: Joi.array()
    .items(Joi.string().min(5))
    .min(2)
    .max(6)
    .optional()
});

module.exports = {
  createCompetencySchema,
  updateCompetencySchema
};
```

### report.service.js (Exemplo)

```javascript
class ReportService {
  constructor(userRepository, evaluationRepository, competencyRepository) {
    this.userRepository = userRepository;
    this.evaluationRepository = evaluationRepository;
    this.competencyRepository = competencyRepository;
  }

  /**
   * Gerar dashboard geral
   */
  async getDashboard() {
    // Buscar dados de todas as entidades
    const [users, evaluations, nineBoxes, competencies] = await Promise.all([
      this.userRepository.findAll({}),
      this.evaluationRepository.findAll({}),
      this.evaluationRepository.findAllNineBox(),
      this.competencyRepository.findAll({})
    ]);

    // Processar usuários
    const usuarios = {
      total: users.users.length,
      gestores: users.users.filter(u => u.tipo === 'gestor').length,
      colaboradores: users.users.filter(u => u.tipo === 'colaborador').length
    };

    // Processar avaliações
    const avaliacoes = {
      total: evaluations.evaluations.length,
      porTipo: {
        gestor: evaluations.evaluations.filter(e => e.tipo === 'gestor').length,
        colaborador: evaluations.evaluations.filter(e => e.tipo === 'colaborador').length
      },
      mediaGeral: this.calculateAverageRating(evaluations.evaluations),
      ultimaSemana: this.countLastWeek(evaluations.evaluations)
    };

    // Processar Nine Box
    const nineBox = {
      total: nineBoxes.length,
      distribuicao: this.countByCategory(nineBoxes)
    };

    // Processar competências
    const competenciasData = {
      total: competencies.competencies.length,
      porTipo: this.countByType(competencies.competencies)
    };

    return {
      usuarios,
      avaliacoes,
      nineBox,
      competencias: competenciasData
    };
  }

  /**
   * Gerar relatório de usuário
   */
  async getUserReport(userId) {
    // Buscar usuário
    const usuario = await this.userRepository.findById(userId);
    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Buscar avaliações do usuário
    const avaliacoes = await this.evaluationRepository.findByUserId(userId);

    // Buscar Nine Box do usuário
    const nineBoxes = await this.evaluationRepository.findNineBoxByUserId(userId);

    // Processar dados
    const avaliacoesData = this.processEvaluations(avaliacoes);
    const nineBoxData = this.processNineBox(nineBoxes);

    return {
      usuario,
      avaliacoes: avaliacoesData,
      nineBox: nineBoxData
    };
  }

  /**
   * Calcular média geral de avaliações
   */
  calculateAverageRating(evaluations) {
    const medias = evaluations
      .map(e => e.media)
      .filter(m => m !== null && m !== undefined);

    if (medias.length === 0) return 0;

    const soma = medias.reduce((a, b) => a + b, 0);
    return parseFloat((soma / medias.length).toFixed(1));
  }

  /**
   * Contar avaliações da última semana
   */
  countLastWeek(evaluations) {
    const umaSemanaAtras = new Date();
    umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);

    return evaluations.filter(e => 
      new Date(e.data) >= umaSemanaAtras
    ).length;
  }

  /**
   * Contar por categoria Nine Box
   */
  countByCategory(nineBoxes) {
    const categorias = {
      'Superstar': 0,
      'Estrela': 0,
      'Especialista': 0,
      'Núcleo': 0,
      'Trabalhador': 0,
      'Âncora': 0,
      'Enigma': 0,
      'Dilema': 0,
      'Questão': 0
    };

    nineBoxes.forEach(nb => {
      if (categorias[nb.categoria] !== undefined) {
        categorias[nb.categoria]++;
      }
    });

    return categorias;
  }

  /**
   * Contar por tipo
   */
  countByType(items) {
    const tipos = {};

    items.forEach(item => {
      if (!tipos[item.tipo]) {
        tipos[item.tipo] = 0;
      }
      tipos[item.tipo]++;
    });

    return tipos;
  }

  /**
   * Processar avaliações para relatório
   */
  processEvaluations(avaliacoes) {
    if (avaliacoes.length === 0) {
      return {
        total: 0,
        mediaGeral: 0,
        criterios: {},
        evolucao: [],
        ultimas: []
      };
    }

    // Calcular médias
    const medias = avaliacoes.map(a => a.media).filter(m => m !== null);
    const mediaGeral = medias.reduce((a, b) => a + b, 0) / medias.length;

    // Calcular média por critério
    const criterios = this.calculateCriteriaAverages(avaliacoes);

    // Calcular evolução
    const evolucao = this.calculateEvolution(avaliacoes);

    // Pegar últimas 5 avaliações
    const ultimas = avaliacoes
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, 5);

    return {
      total: avaliacoes.length,
      mediaGeral: parseFloat(mediaGeral.toFixed(1)),
      criterios,
      evolucao,
      ultimas
    };
  }

  /**
   * Calcular médias por critério
   */
  calculateCriteriaAverages(avaliacoes) {
    const criterios = {
      pontualidade: [],
      comunicacao: [],
      tecnico: [],
      proatividade: [],
      equipe: []
    };

    avaliacoes.forEach(av => {
      if (av.criterios) {
        Object.keys(criterios).forEach(key => {
          if (av.criterios[key]) {
            criterios[key].push(av.criterios[key]);
          }
        });
      }
    });

    // Calcular média de cada critério
    Object.keys(criterios).forEach(key => {
      const valores = criterios[key];
      if (valores.length > 0) {
        const media = valores.reduce((a, b) => a + b, 0) / valores.length;
        criterios[key] = parseFloat(media.toFixed(1));
      } else {
        criterios[key] = 0;
      }
    });

    return criterios;
  }

  /**
   * Calcular evolução ao longo do tempo
   */
  calculateEvolution(avaliacoes) {
    const porMes = {};

    avaliacoes.forEach(av => {
      const mes = new Date(av.data).toLocaleDateString('pt-BR', {
        month: 'short',
        year: '2-digit'
      });

      if (!porMes[mes]) {
        porMes[mes] = [];
      }

      if (av.media) {
        porMes[mes].push(av.media);
      }
    });

    return Object.keys(porMes).map(mes => ({
      mes,
      media: parseFloat(
        (porMes[mes].reduce((a, b) => a + b, 0) / porMes[mes].length).toFixed(1)
      )
    }));
  }

  /**
   * Processar Nine Box para relatório
   */
  processNineBox(nineBoxes) {
    if (nineBoxes.length === 0) {
      return {
        ultima: null,
        historico: []
      };
    }

    // Ordenar por data (mais recente primeiro)
    const ordenados = nineBoxes.sort((a, b) => 
      new Date(b.data) - new Date(a.data)
    );

    return {
      ultima: ordenados[0],
      historico: ordenados
    };
  }
}

export { ReportService };
```

---

## Checklist de Implementação

- [ ] Criar model Competency no schema.prisma
- [ ] Rodar migrations: `npx prisma migrate dev`
- [ ] Criar competency.validation.js
- [ ] Implementar competency.repository.js
- [ ] Implementar competency.service.js
- [ ] Implementar competency.controller.js
- [ ] Criar competency.routes.js
- [ ] Implementar report.service.js
- [ ] Implementar report.controller.js
- [ ] Criar report.routes.js
- [ ] Testar todos os endpoints
- [ ] Documentar no README

---

## Como Testar

1. **Criar competência**: POST /api/competencies
2. **Listar competências**: GET /api/competencies
3. **Ver dashboard**: GET /api/reports/dashboard
4. **Ver relatório de usuário**: GET /api/reports/user/:userId
5. **Ver tipos de competências**: GET /api/competencies/types

---

## Dicas Importantes

1. **Agregação de dados**: Use Promise.all para buscar dados em paralelo
2. **Cálculos estatísticos**: Cuidado com divisão por zero
3. **Formatação de datas**: Use toLocaleDateString para formatar
4. **Performance**: Cache dados do dashboard (opcional)
5. **Filtros**: Implemente filtros eficientes
6. **Ordenação**: Ordene por data (mais recentes primeiro)

---

Qualquer dúvida, chama.


---

## Parte 2: Módulo de Relatórios (Reports) - 1h

### O que são Relatórios?

O módulo de relatórios agrega dados de todos os outros módulos (Usuários, Avaliações, Nine Box, Competências) e gera:
- Dashboard geral com estatísticas
- Relatório individual de usuário
- Relatório de avaliações
- Relatório Nine Box
- Relatório de competências
- Exportação de dados

---

### Estrutura do Módulo Reports

```
src/modules/reports/
├── reports.service.js
├── reports.controller.js
└── reports.routes.js
```

**Nota**: Reports não precisa de Repository nem Validation, pois usa os repositories dos outros módulos.

---

### TAREFA 1: Criar pasta reports

```bash
mkdir -p src/modules/reports
```

---

### TAREFA 2: Criar reports.service.js

Arquivo: `src/modules/reports/reports.service.js`

```javascript
import { AppError } from '../../utils/errors.js';
import { UserRepository } from '../users/user.repository.js';
import { EvaluationRepository } from '../evaluations/evaluation.repository.js';
import { NineBoxRepository } from '../ninebox/ninebox.repository.js';
import { CompetencyRepository } from '../competencies/competency.repository.js';

class ReportsService {
  constructor() {
    this.userRepository = new UserRepository();
    this.evaluationRepository = new EvaluationRepository();
    this.nineBoxRepository = new NineBoxRepository();
    this.competencyRepository = new CompetencyRepository();
  }

  async getDashboardStats(userTipo) {
    // Colaborador não pode ver dashboard geral
    if (userTipo === 'colaborador') {
      throw new AppError('Sem permissão para ver dashboard geral', 403);
    }

    // Busca dados de todas as entidades
    const [users, evaluations, nineBoxes, competencies] = await Promise.all([
      this.userRepository.findAll({ page: 1, limit: 1000 }),
      this.evaluationRepository.findAll({ page: 1, limit: 1000 }),
      this.nineBoxRepository.findAll({ page: 1, limit: 1000 }),
      this.competencyRepository.findAll({ page: 1, limit: 1000 })
    ]);

    // Estatísticas de usuários
    const userStats = {
      total: users.pagination.total,
      porTipo: users.users.reduce((acc, user) => {
        acc[user.tipo] = (acc[user.tipo] || 0) + 1;
        return acc;
      }, {})
    };

    // Estatísticas de avaliações
    const evaluationStats = {
      total: evaluations.pagination.total,
      porTipo: evaluations.evaluations.reduce((acc, ev) => {
        acc[ev.tipo] = (acc[ev.tipo] || 0) + 1;
        return acc;
      }, {}),
      mediaGeral: evaluations.evaluations.length > 0
        ? evaluations.evaluations.reduce((sum, ev) => sum + (ev.media || 0), 0) / evaluations.evaluations.length
        : 0
    };

    // Estatísticas de Nine Box
    const nineBoxStats = await this.nineBoxRepository.getGridDistribution();

    // Estatísticas de competências
    const competencyStats = await this.competencyRepository.getStatsByTipo();

    return {
      usuarios: userStats,
      avaliacoes: evaluationStats,
      nineBox: nineBoxStats,
      competencias: competencyStats,
      timestamp: new Date().toISOString()
    };
  }

  async getUserReport(userId, requestUserId, requestUserTipo) {
    // Colaborador só pode ver seu próprio relatório
    if (requestUserTipo === 'colaborador' && userId !== requestUserId) {
      throw new AppError('Sem permissão para ver este relatório', 403);
    }

    // Busca dados do usuário
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Busca avaliações recebidas
    const evaluationsReceived = await this.evaluationRepository.findByAvaliado(userId, { page: 1, limit: 1000 });

    // Busca avaliações feitas
    const evaluationsMade = await this.evaluationRepository.findByAvaliador(userId, { page: 1, limit: 1000 });

    // Busca avaliações Nine Box
    const nineBoxes = await this.nineBoxRepository.findByPessoa(userId);

    // Calcula estatísticas de avaliações recebidas
    const receivedStats = {
      total: evaluationsReceived.evaluations.length,
      mediaGeral: evaluationsReceived.evaluations.length > 0
        ? evaluationsReceived.evaluations.reduce((sum, ev) => sum + (ev.media || 0), 0) / evaluationsReceived.evaluations.length
        : 0,
      porTipo: evaluationsReceived.evaluations.reduce((acc, ev) => {
        acc[ev.tipo] = (acc[ev.tipo] || 0) + 1;
        return acc;
      }, {})
    };

    // Última avaliação Nine Box
    const latestNineBox = nineBoxes.length > 0 ? nineBoxes[0] : null;

    // Remove senha do usuário
    delete user.senha;

    return {
      usuario: user,
      avaliacoesRecebidas: {
        ...receivedStats,
        lista: evaluationsReceived.evaluations
      },
      avaliacoesFeitas: {
        total: evaluationsMade.evaluations.length,
        lista: evaluationsMade.evaluations
      },
      nineBox: {
        total: nineBoxes.length,
        ultima: latestNineBox,
        historico: nineBoxes
      },
      timestamp: new Date().toISOString()
    };
  }

  async getEvaluationsReport(filters, userTipo) {
    // Colaborador não pode ver relatório geral
    if (userTipo === 'colaborador') {
      throw new AppError('Sem permissão para ver relatório geral de avaliações', 403);
    }

    const evaluations = await this.evaluationRepository.findAll({
      page: 1,
      limit: 1000,
      ...filters
    });

    // Agrupa por avaliado
    const byAvaliado = evaluations.evaluations.reduce((acc, ev) => {
      const key = ev.avaliadoId;
      if (!acc[key]) {
        acc[key] = {
          avaliado: ev.avaliado,
          avaliacoes: [],
          mediaGeral: 0
        };
      }
      acc[key].avaliacoes.push(ev);
      return acc;
    }, {});

    // Calcula média por avaliado
    Object.values(byAvaliado).forEach(item => {
      const total = item.avaliacoes.reduce((sum, ev) => sum + (ev.media || 0), 0);
      item.mediaGeral = item.avaliacoes.length > 0 ? total / item.avaliacoes.length : 0;
    });

    // Agrupa por tipo
    const byTipo = evaluations.evaluations.reduce((acc, ev) => {
      if (!acc[ev.tipo]) {
        acc[ev.tipo] = {
          total: 0,
          mediaGeral: 0,
          avaliacoes: []
        };
      }
      acc[ev.tipo].total++;
      acc[ev.tipo].avaliacoes.push(ev);
      return acc;
    }, {});

    // Calcula média por tipo
    Object.values(byTipo).forEach(item => {
      const total = item.avaliacoes.reduce((sum, ev) => sum + (ev.media || 0), 0);
      item.mediaGeral = item.avaliacoes.length > 0 ? total / item.avaliacoes.length : 0;
    });

    return {
      total: evaluations.pagination.total,
      porAvaliado: Object.values(byAvaliado),
      porTipo: byTipo,
      avaliacoes: evaluations.evaluations,
      timestamp: new Date().toISOString()
    };
  }

  async getNineBoxReport(userTipo) {
    // Colaborador não pode ver relatório geral
    if (userTipo === 'colaborador') {
      throw new AppError('Sem permissão para ver relatório geral de Nine Box', 403);
    }

    const distribution = await this.nineBoxRepository.getGridDistribution();
    const allNineBoxes = await this.nineBoxRepository.findAll({ page: 1, limit: 1000 });

    // Agrupa por pessoa (última avaliação)
    const byPessoa = {};
    allNineBoxes.nineBoxes.forEach(nb => {
      if (!byPessoa[nb.pessoaId] || new Date(nb.createdAt) > new Date(byPessoa[nb.pessoaId].createdAt)) {
        byPessoa[nb.pessoaId] = nb;
      }
    });

    return {
      distribuicao: distribution,
      porPessoa: Object.values(byPessoa),
      timestamp: new Date().toISOString()
    };
  }

  async getCompetenciesReport(userTipo) {
    // Colaborador não pode ver relatório geral
    if (userTipo === 'colaborador') {
      throw new AppError('Sem permissão para ver relatório geral de competências', 403);
    }

    const stats = await this.competencyRepository.getStatsByTipo();
    const competencies = await this.competencyRepository.findAll({ page: 1, limit: 1000 });

    // Agrupa por tipo
    const byTipo = competencies.competencies.reduce((acc, comp) => {
      if (!acc[comp.tipo]) {
        acc[comp.tipo] = [];
      }
      acc[comp.tipo].push(comp);
      return acc;
    }, {});

    // Agrupa por competenciaDe
    const byCompetenciaDe = competencies.competencies.reduce((acc, comp) => {
      if (!acc[comp.competenciaDe]) {
        acc[comp.competenciaDe] = [];
      }
      acc[comp.competenciaDe].push(comp);
      return acc;
    }, {});

    return {
      total: competencies.pagination.total,
      estatisticas: stats,
      porTipo: byTipo,
      porCompetenciaDe: byCompetenciaDe,
      competencias: competencies.competencies,
      timestamp: new Date().toISOString()
    };
  }

  async exportData(userTipo) {
    // Apenas admin pode exportar todos os dados
    if (userTipo !== 'admin') {
      throw new AppError('Sem permissão para exportar dados', 403);
    }

    const [users, evaluations, nineBoxes, competencies] = await Promise.all([
      this.userRepository.findAll({ page: 1, limit: 10000 }),
      this.evaluationRepository.findAll({ page: 1, limit: 10000 }),
      this.nineBoxRepository.findAll({ page: 1, limit: 10000 }),
      this.competencyRepository.findAll({ page: 1, limit: 10000 })
    ]);

    // Remove senhas dos usuários
    users.users.forEach(user => delete user.senha);

    return {
      exportDate: new Date().toISOString(),
      data: {
        usuarios: users.users,
        avaliacoes: evaluations.evaluations,
        nineBox: nineBoxes.nineBoxes,
        competencias: competencies.competencies
      }
    };
  }
}

export { ReportsService };
```

---

### TAREFA 3: Criar reports.controller.js

Arquivo: `src/modules/reports/reports.controller.js`

```javascript
import { ReportsService } from './reports.service.js';

const reportsService = new ReportsService();

class ReportsController {
  async getDashboardStats(req, res, next) {
    try {
      const stats = await reportsService.getDashboardStats(req.user.tipo);
      return res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserReport(req, res, next) {
    try {
      const report = await reportsService.getUserReport(
        req.params.userId,
        req.user.userId,
        req.user.tipo
      );
      return res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyReport(req, res, next) {
    try {
      const report = await reportsService.getUserReport(
        req.user.userId,
        req.user.userId,
        req.user.tipo
      );
      return res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async getEvaluationsReport(req, res, next) {
    try {
      const { tipo, avaliadoId, avaliadorId } = req.query;
      const report = await reportsService.getEvaluationsReport(
        { tipo, avaliadoId, avaliadorId },
        req.user.tipo
      );
      return res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async getNineBoxReport(req, res, next) {
    try {
      const report = await reportsService.getNineBoxReport(req.user.tipo);
      return res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async getCompetenciesReport(req, res, next) {
    try {
      const report = await reportsService.getCompetenciesReport(req.user.tipo);
      return res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async exportData(req, res, next) {
    try {
      const data = await reportsService.exportData(req.user.tipo);
      
      // Define headers para download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=export-${Date.now()}.json`);
      
      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
}

export { ReportsController };
```

---

### TAREFA 4: Criar reports.routes.js

Arquivo: `src/modules/reports/reports.routes.js`

```javascript
import express from 'express';
import { ReportsController } from './reports.controller.js';
import { authMiddleware, isGestorOrAdminMiddleware, isAdminMiddleware } from '../../middlewares/auth.js';

const router = express.Router();
const reportsController = new ReportsController();

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

// Rotas públicas (autenticadas) - qualquer usuário pode ver seu próprio relatório
router.get('/me', (req, res, next) => reportsController.getMyReport(req, res, next));

// Rotas de gestor/admin
router.get('/dashboard', isGestorOrAdminMiddleware, (req, res, next) => reportsController.getDashboardStats(req, res, next));
router.get('/user/:userId', isGestorOrAdminMiddleware, (req, res, next) => reportsController.getUserReport(req, res, next));
router.get('/evaluations', isGestorOrAdminMiddleware, (req, res, next) => reportsController.getEvaluationsReport(req, res, next));
router.get('/ninebox', isGestorOrAdminMiddleware, (req, res, next) => reportsController.getNineBoxReport(req, res, next));
router.get('/competencies', isGestorOrAdminMiddleware, (req, res, next) => reportsController.getCompetenciesReport(req, res, next));

// Rotas de admin
router.get('/export', isAdminMiddleware, (req, res, next) => reportsController.exportData(req, res, next));

export default router;
```

---

### TAREFA 5: Adicionar rota no app.js

Arquivo: `src/app.js` (adicionar linha)

```javascript
import reportsRoutes from './modules/reports/reports.routes.js';

// ... outras rotas ...

app.use('/api/reports', reportsRoutes);
```

---

### TAREFA 6: Testar Reports no Postman

**1. Dashboard geral (gestor/admin)**
```
GET http://localhost:3000/api/reports/dashboard
Authorization: Bearer SEU_TOKEN_GESTOR
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "usuarios": {
      "total": 10,
      "porTipo": {
        "admin": 1,
        "gestor": 3,
        "colaborador": 6
      }
    },
    "avaliacoes": {
      "total": 25,
      "porTipo": {
        "gestor": 15,
        "colaborador": 10
      },
      "mediaGeral": 4.2
    },
    "nineBox": {
      "total": 8,
      "porCategoria": {
        "Superstar": 2,
        "Estrela": 3,
        "Núcleo": 3
      }
    },
    "competencias": {
      "total": 12,
      "porTipo": {...},
      "porCompetenciaDe": {...}
    },
    "timestamp": "2026-05-04T..."
  }
}
```

**2. Relatório de um usuário específico**
```
GET http://localhost:3000/api/reports/user/uuid-do-usuario
Authorization: Bearer SEU_TOKEN_GESTOR
```

**3. Relatório da equipe de um gestor**
```
GET http://localhost:3000/api/reports/team/uuid-do-gestor
Authorization: Bearer SEU_TOKEN_GESTOR
```

**4. Exportar relatório de um usuário**
```
GET http://localhost:3000/api/reports/export/uuid-do-usuario
Authorization: Bearer SEU_TOKEN_GESTOR
```

---

## Resumo Final - Estagiário 3

Você implementou **2 módulos completos**:

### ✅ Módulo de Competências
- CRUD completo de competências
- Validações com Joi
- Controle de permissões
- Busca por tipo e competenciaDe
- Estatísticas
- **8 endpoints**

### ✅ Módulo de Relatórios
- Dashboard geral com estatísticas
- Relatório individual de usuário
- Meu relatório (qualquer usuário)
- Relatório de avaliações
- Relatório Nine Box
- Relatório de competências
- Exportação completa de dados (admin)
- **7 endpoints**

**Total: 15 endpoints implementados**

---

## Checklist Final - Backend Completo

Agora que todos os 3 estagiários terminaram, o backend está completo com:

### ✅ Estagiário 1 - Usuários
- 8 endpoints
- Autenticação JWT
- Sistema de RA
- Permissões (Admin/Gestor/Colaborador)

### ✅ Estagiário 2 - Avaliações e Nine Box
- 17 endpoints
- Avaliações tradicionais
- Nine Box com 9 categorias

### ✅ Estagiário 3 - Competências e Relatórios
- 15 endpoints
- Gestão de competências
- Relatórios completos

**TOTAL: 40 endpoints implementados**

Backend pronto para integração com frontend e deploy! 🚀
