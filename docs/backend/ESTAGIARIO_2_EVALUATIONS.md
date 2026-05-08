# ESTAGIÁRIO 2 - Módulo de Avaliações e Nine Box

## ⚠️ IMPORTANTE: ES Modules

Este projeto usa **ES Modules** (`import/export`) ao invés de CommonJS (`require/module.exports`).

**Configure no package.json:**
```json
{
  "type": "module"
}
```

---

## ⚠️ SISTEMA DE AVALIAÇÕES ANÔNIMAS E BIDIRECIONAIS

**IMPORTANTE**: Este sistema implementa avaliações **anônimas** e **bidirecionais** com **limite de 24 horas** para edição/exclusão:

- ✅ **Gestor** pode avaliar colaboradores (anônimo)
- ✅ **Colaborador** pode avaliar gestores (anônimo)  
- ✅ **Admin** pode fazer qualquer tipo de avaliação
- ✅ **avaliadorId** é salvo no banco (controle interno)
- ❌ **avaliadorId** NÃO é retornado na API (mantém anonimato)
- ✅ **tipoAvaliacao** é determinado automaticamente pelo sistema
- ✅ Avaliado vê a avaliação mas não sabe quem fez
- ✅ Admin pode ver quem avaliou (para auditoria)
- ⏰ **Limite de 24 horas**: Avaliações podem ser editadas/excluídas apenas nas primeiras 24 horas após criação
- ✅ **Admin sem limite**: Admin pode editar/excluir avaliações a qualquer momento

**Tipos de Avaliação (determinados automaticamente):**
- `"gestor_para_colaborador"` - Gestor avalia colaborador
- `"colaborador_para_gestor"` - Colaborador avalia gestor  
- `"avaliacao_360"` - Admin avalia qualquer um

---

## Sua Responsabilidade

Você vai cuidar de:

1. **Avaliações tradicionais** (com estrelas 1-5) - ANÔNIMAS
2. **Avaliações por comentário** - ANÔNIMAS
3. **Sistema Nine Box** (Performance × Potential)
4. **Histórico e estatísticas** de avaliações

---

## Parte 1: Módulo de Avaliações (1h30)

### Endpoints de Avaliações

#### 1. POST /api/evaluations
Criar avaliação (gestor/colaborador/admin)

**Body:**
```json
{
  "avaliadoId": "uuid-do-usuario",
  "criterios": {
    "pontualidade": 5,
    "comunicacao": 4,
    "tecnico": 5,
    "proatividade": 4,
    "equipe": 5
  },
  "comentario": "Excelente profissional",
  "anonima": true
}
```

**Resposta (SEM avaliadorId):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "avaliadoId": "uuid-do-colaborador",
    "tipoAvaliacao": "gestor_para_colaborador",
    "criterios": {...},
    "media": 4.6,
    "comentario": "Excelente profissional",
    "anonima": true,
    "avaliado": {
      "nome": "Ana Costa",
      "tipo": "colaborador"
    }
    // avaliadorId OMITIDO para manter anonimato
  }
}
```

#### 2. GET /api/evaluations
Listar avaliações (com filtros)

**Query params:**
- `?page=1&limit=10`
- `?tipoAvaliacao=gestor_para_colaborador`
- `?avaliadoId=uuid`

#### 3. GET /api/evaluations/:id
Buscar avaliação por ID

#### 4. GET /api/evaluations/avaliado/:avaliadoId
Buscar avaliações de um usuário

#### 5. GET /api/evaluations/stats/avaliado/:avaliadoId
Estatísticas de avaliações de um usuário

#### 6. PUT /api/evaluations/:id
Atualizar avaliação (apenas quem criou ou admin, dentro de 24 horas)

**Regras:**
- ⏰ Apenas nas primeiras **24 horas** após criação
- ✅ Admin pode editar a qualquer momento (sem limite)
- ✅ Apenas o criador ou admin pode editar

**Body:**
```json
{
  "criterios": {
    "pontualidade": 5,
    "comunicacao": 5,
    "tecnico": 5,
    "proatividade": 5,
    "equipe": 5
  },
  "comentario": "Comentário atualizado"
}
```

#### 7. DELETE /api/evaluations/:id
Deletar avaliação (apenas quem criou ou admin, dentro de 24 horas)

**Regras:**
- ⏰ Apenas nas primeiras **24 horas** após criação
- ✅ Admin pode excluir a qualquer momento (sem limite)
- ✅ Apenas o criador ou admin pode excluir

---

## Parte 2: Módulo Nine Box (1h)

### O que é Nine Box?

Nine Box é uma matriz 3×3 que avalia colaboradores em duas dimensões:
- **Performance** (Desempenho): 1 (Baixo), 2 (Médio), 3 (Alto)
- **Potential** (Potencial): 1 (Baixo), 2 (Médio), 3 (Alto)

Cada combinação gera uma **categoria automaticamente**:

| Performance | Potential | Categoria |
|------------|-----------|-----------|
| 1 | 1 | Questão |
| 2 | 1 | Trabalhador |
| 3 | 1 | Âncora |
| 1 | 2 | Dilema |
| 2 | 2 | Núcleo |
| 3 | 2 | Especialista |
| 1 | 3 | Enigma |
| 2 | 3 | Estrela |
| 3 | 3 | Superstar |

### Endpoints Nine Box

#### 1. POST /api/evaluations/nine-box
Criar avaliação Nine Box (gestor/admin)

**Body:**
```json
{
  "pessoaId": "uuid",
  "performance": 3,
  "potential": 2,
  "comentario": "Alto desempenho, potencial médio"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "pessoaId": "uuid",
    "performance": 3,
    "potential": 2,
    "categoria": "Especialista",
    "comentario": "Alto desempenho, potencial médio"
  }
}
```

#### 2. GET /api/evaluations/nine-box
Listar avaliações Nine Box

#### 3. GET /api/evaluations/nine-box/:id
Buscar por ID

#### 4. GET /api/evaluations/nine-box/pessoa/:pessoaId
Buscar avaliações de uma pessoa

#### 5. GET /api/evaluations/nine-box/pessoa/:pessoaId/latest
Buscar última avaliação de uma pessoa

#### 6. GET /api/evaluations/nine-box/stats/distribution
Ver distribuição do grid (gestor/admin)

#### 7. PUT /api/evaluations/nine-box/:id
Atualizar avaliação (gestor/admin)

#### 8. DELETE /api/evaluations/nine-box/:id
Deletar avaliação (admin)

---

## Estrutura dos arquivos

```
src/modules/evaluations/
├── evaluation.controller.js
├── evaluation.service.js
├── evaluation.repository.js
├── evaluation.routes.js
└── evaluation.validation.js

src/modules/ninebox/
├── ninebox.controller.js
├── ninebox.service.js
├── ninebox.repository.js
├── ninebox.routes.js
└── ninebox.validation.js
```

---

## Schema Prisma

```prisma
model Evaluation {
  id            String        @id @default(uuid())
  tipoAvaliacao TipoAvaliacao
  avaliadorId   String        // Salvo internamente
  avaliadoId    String
  criterios     Json
  media         Float?
  comentario    String?
  anonima       Boolean       @default(true)
  data          DateTime      @default(now())
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  avaliador User @relation("AvaliadorRelation", fields: [avaliadorId], references: [id])
  avaliado  User @relation("AvaliadoRelation", fields: [avaliadoId], references: [id])

  @@index([avaliadoId])
  @@index([avaliadorId])
  @@map("evaluations")
}

enum TipoAvaliacao {
  gestor_para_colaborador
  colaborador_para_gestor
  avaliacao_360
}

model NineBox {
  id          String   @id @default(uuid())
  pessoaId    String
  performance Int
  potential   Int
  categoria   String
  comentario  String?
  data        DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  pessoa User @relation(fields: [pessoaId], references: [id])

  @@index([pessoaId])
  @@map("nine_box")
}
```

---

## Implementação Completa

### Para Avaliações:
Você vai implementar os seguintes arquivos:

1. **evaluation.validation.js** - Validações com Joi (define regras dos dados)
2. **evaluation.repository.js** - Queries no Prisma (acessa o banco)
3. **evaluation.service.js** - Lógica de negócio + anonimato (regras e validações)
4. **evaluation.controller.js** - Recebe HTTP (recebe requisições)
5. **evaluation.routes.js** - Define rotas (URLs e middlewares)

### Para Nine Box:
Você vai implementar os seguintes arquivos:

1. **ninebox.validation.js** - Validações com Joi (define regras dos dados)
2. **ninebox.repository.js** - Queries no Prisma (acessa o banco)
3. **ninebox.service.js** - Lógica de negócio + cálculo de categoria (regras e validações)
4. **ninebox.controller.js** - Recebe HTTP (recebe requisições)
5. **ninebox.routes.js** - Define rotas (URLs e middlewares)

**Padrão de fluxo (igual ao módulo de usuários):**
```
HTTP Request → Routes → Controller → Service → Repository → Database
                                                      ↓
HTTP Response ← Routes ← Controller ← Service ← Repository ← Database
```

---

## Explicações Detalhadas de Código

### Como funciona o sistema de anonimato?

**1. Ao criar avaliação:**
```javascript
// No service, salvamos o avaliadorId no banco
async create(data, avaliadorId, avaliadorTipo) {
  // Determina tipo automaticamente
  const tipoAvaliacao = this.determineTipoAvaliacao(avaliadorTipo, avaliadoTipo);
  
  // Salva NO BANCO com avaliadorId
  const evaluation = await this.evaluationRepository.create({
    ...data,
    avaliadorId,  // ← Salvo no banco
    tipoAvaliacao,
    anonima: true
  });
  
  // Remove avaliadorId antes de retornar
  return this.sanitizeEvaluation(evaluation);
}
```

**2. Função de sanitização (remove dados sensíveis):**
```javascript
sanitizeEvaluation(evaluation) {
  // Cria cópia do objeto
  const sanitized = { ...evaluation };
  
  // Remove avaliadorId (mantém anonimato)
  delete sanitized.avaliadorId;
  
  // Remove relação avaliador
  delete sanitized.avaliador;
  
  return sanitized;
}
```

**Explicação:**
- `avaliadorId` é salvo no banco (para auditoria)
- Mas é removido antes de retornar na API
- Assim o avaliado não sabe quem avaliou
- Admin pode ver no banco direto (para auditoria)

### Como funciona o limite de 24 horas?

**1. Verificação ao editar/excluir:**
```javascript
async update(id, userId, userTipo, data) {
  // Busca avaliação
  const evaluation = await this.evaluationRepository.findById(id);
  
  if (!evaluation) {
    throw new AppError('Avaliação não encontrada', 404);
  }
  
  // Verifica se é o criador ou admin
  if (evaluation.avaliadorId !== userId && userTipo !== 'admin') {
    throw new AppError('Sem permissão para editar esta avaliação', 403);
  }
  
  // ⏰ VERIFICA LIMITE DE 24 HORAS (exceto admin)
  if (userTipo !== 'admin') {
    const dataAvaliacao = new Date(evaluation.data);
    const agora = new Date();
    const diferencaHoras = (agora - dataAvaliacao) / (1000 * 60 * 60);
    
    if (diferencaHoras > 24) {
      throw new AppError('Prazo de 24 horas para edição expirado', 403);
    }
  }
  
  // Atualiza avaliação
  const updated = await this.evaluationRepository.update(id, data);
  return this.sanitizeEvaluation(updated);
}
```

**2. Cálculo da diferença de horas:**
```javascript
// Data da avaliação: 2024-05-01 10:00:00
// Data atual: 2024-05-02 15:00:00

const dataAvaliacao = new Date('2024-05-01T10:00:00');
const agora = new Date('2024-05-02T15:00:00');

// Diferença em milissegundos
const diferencaMs = agora - dataAvaliacao;
// 29 horas = 104.400.000 ms

// Converte para horas
const diferencaHoras = diferencaMs / (1000 * 60 * 60);
// 104.400.000 / 3.600.000 = 29 horas

// Verifica se passou de 24 horas
if (diferencaHoras > 24) {
  // Prazo expirado!
}
```

**Explicação:**
- Calcula diferença entre data atual e data da avaliação
- Converte milissegundos para horas
- Se passou de 24 horas, bloqueia edição/exclusão
- Admin não tem limite (pode editar/excluir sempre)

### Como determinar tipoAvaliacao automaticamente?

```javascript
determineTipoAvaliacao(avaliadorTipo, avaliadoTipo) {
  // Admin pode avaliar qualquer um (360°)
  if (avaliadorTipo === 'admin') {
    return 'avaliacao_360';
  }
  
  // Gestor avaliando colaborador
  if (avaliadorTipo === 'gestor' && avaliadoTipo === 'colaborador') {
    return 'gestor_para_colaborador';
  }
  
  // Colaborador avaliando gestor (180°)
  if (avaliadorTipo === 'colaborador' && avaliadoTipo === 'gestor') {
    return 'colaborador_para_gestor';
  }
  
  // Caso não se encaixe em nenhum
  throw new AppError('Tipo de avaliação inválido', 400);
}
```

**Explicação:**
- Sistema decide automaticamente o tipo
- Baseado em quem está avaliando quem
- Usuário não precisa informar o tipo

### Como calcular a média dos critérios?

```javascript
calculateMedia(criterios) {
  // Pega todos os valores do objeto
  const valores = Object.values(criterios);
  
  // Soma todos os valores
  const soma = valores.reduce((acc, val) => acc + val, 0);
  
  // Divide pela quantidade
  const media = soma / valores.length;
  
  // Arredonda para 1 casa decimal
  return parseFloat(media.toFixed(1));
}
```

**Exemplo:**
```javascript
const criterios = {
  pontualidade: 5,
  comunicacao: 4,
  tecnico: 5,
  proatividade: 4,
  equipe: 5
};

// valores = [5, 4, 5, 4, 5]
// soma = 23
// media = 23 / 5 = 4.6
```

**Explicação:**
- `Object.values()`: Pega só os valores do objeto
- `reduce()`: Soma todos os valores
- `toFixed(1)`: Arredonda para 1 casa decimal
- `parseFloat()`: Converte string para número

### Como funciona o Nine Box?

**1. Cálculo da categoria:**
```javascript
calculateCategory(performance, potential) {
  // Performance: 1 (baixo), 2 (médio), 3 (alto)
  // Potential: 1 (baixo), 2 (médio), 3 (alto)
  
  // Matriz 3x3 = 9 categorias
  const matrix = {
    '3-3': 'Superstar',      // Alto desempenho + Alto potencial
    '3-2': 'Estrela',        // Alto desempenho + Médio potencial
    '3-1': 'Especialista',   // Alto desempenho + Baixo potencial
    '2-3': 'Núcleo',         // Médio desempenho + Alto potencial
    '2-2': 'Trabalhador',    // Médio desempenho + Médio potencial
    '2-1': 'Âncora',         // Médio desempenho + Baixo potencial
    '1-3': 'Enigma',         // Baixo desempenho + Alto potencial
    '1-2': 'Dilema',         // Baixo desempenho + Médio potencial
    '1-1': 'Questão'         // Baixo desempenho + Baixo potencial
  };
  
  // Cria chave "performance-potential"
  const key = `${performance}-${potential}`;
  
  // Retorna categoria correspondente
  return matrix[key];
}
```

**Exemplo:**
```javascript
// Performance = 3 (alto), Potential = 2 (médio)
const categoria = calculateCategory(3, 2);
// Resultado: "Estrela"
```

**Explicação:**
- Matriz 3x3 = 9 possíveis combinações
- Cada combinação tem um nome
- Sistema calcula automaticamente

**2. Visualização da matriz:**
```
              POTENCIAL
              1    2    3
         ┌─────┬─────┬─────┐
       3 │ Esp │ Est │ Sup │
         ├─────┼─────┼─────┤
PERF   2 │ Ânc │ Tra │ Núc │
       1 ├─────┼─────┼─────┤
         │ Que │ Dil │ Eni │
         └─────┴─────┴─────┘

Legenda:
Sup = Superstar
Est = Estrela
Esp = Especialista
Núc = Núcleo
Tra = Trabalhador
Ânc = Âncora
Eni = Enigma
Dil = Dilema
Que = Questão
```

### Como funciona a paginação?

```javascript
async findAll({ page = 1, limit = 10 }) {
  // Calcula quantos registros pular
  const skip = (page - 1) * limit;
  
  // Exemplo: Página 2, limite 10
  // skip = (2 - 1) * 10 = 10
  // Pula os primeiros 10, pega os próximos 10
  
  const [evaluations, total] = await Promise.all([
    prisma.evaluation.findMany({
      skip,      // Pula X registros
      take: limit, // Pega Y registros
      orderBy: { createdAt: 'desc' }
    }),
    prisma.evaluation.count() // Conta total
  ]);
  
  return {
    evaluations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}
```

**Exemplo:**
```
Total de registros: 45
Limite por página: 10

Página 1: registros 1-10   (skip=0, take=10)
Página 2: registros 11-20  (skip=10, take=10)
Página 3: registros 21-30  (skip=20, take=10)
Página 4: registros 31-40  (skip=30, take=10)
Página 5: registros 41-45  (skip=40, take=10)

Total de páginas: Math.ceil(45 / 10) = 5
```

### Como funciona Promise.all()?

```javascript
// ❌ LENTO (sequencial - um depois do outro)
const users = await prisma.user.findMany();
const evaluations = await prisma.evaluation.findMany();
const nineBoxes = await prisma.nineBox.findMany();
// Tempo total: 300ms + 200ms + 150ms = 650ms

// ✅ RÁPIDO (paralelo - todos ao mesmo tempo)
const [users, evaluations, nineBoxes] = await Promise.all([
  prisma.user.findMany(),
  prisma.evaluation.findMany(),
  prisma.nineBox.findMany()
]);
// Tempo total: max(300ms, 200ms, 150ms) = 300ms
```

**Explicação:**
- `Promise.all()` executa tudo ao mesmo tempo
- Espera todas as operações terminarem
- Muito mais rápido que fazer uma por vez
- Retorna array com os resultados na mesma ordem

---

## Checklist

### Avaliações
- [ ] Criar model Evaluation no schema.prisma
- [ ] Rodar migration
- [ ] Criar evaluation.validation.js
- [ ] Criar evaluation.repository.js
- [ ] Criar evaluation.service.js (com sanitização)
- [ ] Criar evaluation.controller.js
- [ ] Criar evaluation.routes.js
- [ ] Adicionar rota em app.js
- [ ] Testar no Postman

### Nine Box
- [ ] Criar model NineBox no schema.prisma
- [ ] Rodar migration
- [ ] Criar ninebox.validation.js
- [ ] Criar ninebox.repository.js
- [ ] Criar ninebox.service.js (com cálculo de categoria)
- [ ] Criar ninebox.controller.js
- [ ] Criar ninebox.routes.js
- [ ] Adicionar rota em app.js
- [ ] Testar no Postman

---

## Como testar

### Avaliações

**1. Gestor avalia colaborador (anônimo)**
```http
POST http://localhost:3000/api/evaluations
Authorization: Bearer SEU_TOKEN_GESTOR
Content-Type: application/json

{
  "avaliadoId": "uuid-do-colaborador",
  "criterios": {
    "pontualidade": 5,
    "comunicacao": 4,
    "tecnico": 5,
    "proatividade": 4,
    "equipe": 5
  },
  "comentario": "Excelente colaborador"
}
```

**2. Colaborador avalia gestor (anônimo)**
```http
POST http://localhost:3000/api/evaluations
Authorization: Bearer SEU_TOKEN_COLABORADOR
Content-Type: application/json

{
  "avaliadoId": "uuid-do-gestor",
  "criterios": {
    "pontualidade": 5,
    "comunicacao": 4,
    "tecnico": 5,
    "proatividade": 4,
    "equipe": 5
  },
  "comentario": "Gestor muito acessível"
}
```

**3. Listar avaliações**
```http
GET http://localhost:3000/api/evaluations
Authorization: Bearer SEU_TOKEN
```

### Nine Box

**1. Criar avaliação Nine Box**
```http
POST http://localhost:3000/api/evaluations/nine-box
Authorization: Bearer SEU_TOKEN_GESTOR
Content-Type: application/json

{
  "pessoaId": "uuid-da-pessoa",
  "performance": 3,
  "potential": 3,
  "comentario": "Excelente desempenho e alto potencial"
}
```

**2. Ver distribuição do grid**
```http
GET http://localhost:3000/api/evaluations/nine-box/stats/distribution
Authorization: Bearer SEU_TOKEN_GESTOR
```

---

## Sistema de Avaliações Anônimas - Como Funciona

### Para usuário comum (gestor/colaborador):
- ✅ Cria avaliação normalmente
- ✅ Vê avaliações que recebeu
- ❌ **NÃO vê** quem o avaliou
- ❌ **NÃO vê** o `avaliadorId` nas respostas da API

### Para admin:
- ✅ Vê todas as avaliações
- ✅ **VÊ** quem avaliou quem (auditoria)
- ✅ Pode fazer avaliações não-anônimas

### Regras de permissão:
1. **Gestor** pode avaliar colaboradores (anônimo)
2. **Colaborador** pode avaliar gestores (anônimo)
3. **Admin** pode avaliar qualquer um
4. **Mesmo tipo** não pode avaliar entre si (gestor x gestor, colaborador x colaborador)
5. **Ninguém** pode se autoavaliar (exceto admin)
6. ⏰ **Edição/exclusão**: Apenas nas primeiras 24 horas (admin sem limite)

---

## Resumo

Agora você tem os módulos de avaliações e Nine Box completos! Eles permitem:

### Avaliações:
- ✅ Avaliações bidirecionais (gestor ↔ colaborador)
- ✅ Sistema anônimo (avaliadorId oculto)
- ✅ Tipos determinados automaticamente
- ✅ Admin pode ver tudo (auditoria)
- ✅ Controle de permissões rigoroso
- ✅ CRUD completo de avaliações
- ✅ Estatísticas por avaliado

### Nine Box:
- ✅ Criar avaliações Nine Box (gestor/admin)
- ✅ Cálculo automático de categoria
- ✅ Listar avaliações com filtros
- ✅ Ver histórico por pessoa
- ✅ Ver distribuição do grid
- ✅ Controle de permissões

---

Qualquer dúvida, chama! 🚀
