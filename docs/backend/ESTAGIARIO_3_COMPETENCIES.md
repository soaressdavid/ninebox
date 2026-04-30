# 🟡 ESTAGIÁRIO 3 - Módulo de Competências e Relatórios

## 📈 Sua Responsabilidade

Você será responsável pelo sistema de **competências, relatórios e dashboard** do Portal de Gestão de Pessoas usando **JavaScript puro**.

---

## 🎯 Objetivos

1. Cadastro e gestão de competências
2. Critérios de avaliação de competências
3. Tipos de competências (Desempenho, Comportamento, Técnica, Liderança)
4. Dashboard com estatísticas gerais
5. Relatórios individuais e consolidados

---

## 📋 Endpoints que você vai criar

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

## 🔐 Rotas Protegidas

### competency.routes.js

```javascript
const express = require('express');
const { CompetencyController } = require('./competency.controller');
const { authMiddleware, isAdminMiddleware } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/validate');
const { 
  createCompetencySchema, 
  updateCompetencySchema 
} = require('./competency.validation');

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

module.exports = router;
```

### report.routes.js

```javascript
const express = require('express');
const { ReportController } = require('./report.controller');
const { authMiddleware, isGestorOrAdminMiddleware } = require('../../middlewares/auth');

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

## 📁 Estrutura de Arquivos

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

## 🔨 Exemplo de Implementação

### competency.validation.js

```javascript
const Joi = require('joi');

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

module.exports = { ReportService };
```

---

## ✅ Checklist de Implementação

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

## 🧪 Como Testar

1. **Criar competência**: POST /api/competencies
2. **Listar competências**: GET /api/competencies
3. **Ver dashboard**: GET /api/reports/dashboard
4. **Ver relatório de usuário**: GET /api/reports/user/:userId
5. **Ver tipos de competências**: GET /api/competencies/types

---

## 📝 Dicas Importantes

1. **Agregação de dados**: Use Promise.all para buscar dados em paralelo
2. **Cálculos estatísticos**: Cuidado com divisão por zero
3. **Formatação de datas**: Use toLocaleDateString para formatar
4. **Performance**: Cache dados do dashboard (opcional)
5. **Filtros**: Implemente filtros eficientes
6. **Ordenação**: Ordene por data (mais recentes primeiro)

---

**Boa sorte! 🚀**