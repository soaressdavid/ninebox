# Arquitetura do Sistema

## Visão Geral

```
Frontend (HTML/CSS/JS)
         ↓
    REST API
         ↓
Backend (Node + Express)
         ↓
    Prisma ORM
         ↓
Supabase (PostgreSQL)
```

## Como funciona uma requisição

```
1. Frontend faz POST /api/users/login
2. Express roteia pra user.routes.js
3. Controller valida com Joi
4. Service processa (verifica senha, gera JWT)
5. Repository busca no banco via Prisma
6. Resposta volta pro frontend
```

## Estrutura de um módulo

```
src/modules/users/
├── user.routes.js       - Define as rotas
├── user.controller.js   - Valida e responde HTTP
├── user.service.js      - Lógica de negócio
├── user.repository.js   - Queries no banco
└── user.validation.js   - Schemas Joi
```

Padrão: **Controller → Service → Repository**

## Modelo de dados

```
User
├── id (uuid)
├── ra (string, 7 dígitos, único)
├── nome
├── email (único)
├── senha (hash bcrypt)
├── tipo (admin/gestor/colaborador)
├── foto
├── cargo
└── departamento

Evaluation
├── id
├── avaliadorId → User
├── avaliadoId → User
├── tipo
├── criterios (json)
├── media
├── comentario
└── data

NineBox
├── id
├── pessoaId → User
├── performance (1-3)
├── potential (1-3)
├── categoria
├── comentario
└── data

Competency
├── id
├── nome
├── descricao
├── tipo
├── competenciaDe
└── criterios (array)
```

## Sistema de permissões

### Admin (RA: 1000XXX)
- Cadastra/deleta usuários (inclusive outros admins)
- Gerencia competências
- Vê tudo
- Primeiro admin criado via seed, depois pode criar outros

### Gestor (RA: 2021XXX)
- Avalia colaboradores
- Cria Nine Box
- Vê relatórios da equipe
- Atualiza/deleta só o que criou

### Colaborador (RA: 2022XXX)
- Vê próprio perfil
- Vê próprias avaliações
- Responde 180°

## Sistema de RA

RA = Registro Acadêmico (7 dígitos gerados automaticamente)

```
Admins:        1000001, 1000002, 1000003...
Gestores:      2021001, 2021002, 2021003...
Colaboradores: 2022001, 2022002, 2022003...
```

Formato: `TAAAANN`
- T = Tipo (1=admin, 2=gestor/colaborador)
- AAAA = Ano atual
- NN = Sequencial (01, 02, 03...)

Regras:
- Gerado automaticamente no cadastro
- Único por usuário
- Não pode mudar depois de criado
- Validação: exatamente 7 dígitos numéricos

## Divisão de trabalho

### Estagiário 1 - Users (8 endpoints)
- Cadastro e autenticação
- Sistema de RA
- Middlewares de permissão
- CRUD de usuários

### Estagiário 2 - Evaluations (10 endpoints)
- Avaliações tradicionais
- Nine Box
- Estatísticas
- Histórico

### Estagiário 3 - Competencies + Reports (10 endpoints)
- CRUD de competências
- Dashboard
- Relatórios individuais e de equipe

## Endpoints e permissões

### Users
```
POST   /api/users/register       [ADMIN]
POST   /api/users/login          [PÚBLICO]
GET    /api/users/profile        [AUTH]
PUT    /api/users/profile        [AUTH]
GET    /api/users                [GESTOR/ADMIN]
GET    /api/users/:id            [GESTOR/ADMIN]
GET    /api/users/ra/:ra         [AUTH]
DELETE /api/users/:id            [ADMIN]
```

### Evaluations
```
POST   /api/evaluations                [GESTOR/ADMIN]
POST   /api/evaluations/comment        [GESTOR/ADMIN]
POST   /api/evaluations/nine-box       [GESTOR/ADMIN]
GET    /api/evaluations                [AUTH - filtrado]
GET    /api/evaluations/:id            [AUTH - validado]
GET    /api/evaluations/user/:userId   [AUTH - validado]
GET    /api/evaluations/stats/:userId  [AUTH - validado]
GET    /api/evaluations/nine-box       [AUTH - filtrado]
PUT    /api/evaluations/:id            [GESTOR/ADMIN - só criador]
DELETE /api/evaluations/:id            [GESTOR/ADMIN - só criador]
```

### Competencies
```
POST   /api/competencies       [ADMIN]
GET    /api/competencies       [AUTH]
GET    /api/competencies/:id   [AUTH]
PUT    /api/competencies/:id   [ADMIN]
DELETE /api/competencies/:id   [ADMIN]
GET    /api/competencies/types [AUTH]
```

### Reports
```
GET /api/reports/dashboard      [GESTOR/ADMIN]
GET /api/reports/user/:userId   [AUTH - validado]
GET /api/reports/team/:gestorId [GESTOR/ADMIN]
GET /api/reports/export/:userId [AUTH - validado]
```

Legenda:
- PÚBLICO = sem auth
- AUTH = qualquer usuário logado
- GESTOR/ADMIN = só gestor ou admin
- ADMIN = só admin
- filtrado = dados filtrados por permissão
- validado = permissão checada no service

## Segurança (2 camadas)

### 1. Middleware nas rotas
```javascript
router.post('/', isAdminMiddleware, controller.create);
router.post('/evaluations', isGestorOrAdminMiddleware, controller.create);
```

### 2. Validação no service
```javascript
if (userTipo !== 'admin' && evaluation.avaliadorId !== userId) {
  throw new AppError('Sem permissão', 403);
}
```

## Fluxo de autenticação

```
1. POST /api/users/login { email, senha }
2. Service verifica senha (bcrypt)
3. Service gera JWT com { userId, email, tipo, ra }
4. Frontend salva token no localStorage
5. Próximas requests: Header "Authorization: Bearer {token}"
6. authMiddleware valida token e adiciona req.user
```

## Setup rápido

```bash
cd backend
npm install
cp .env.example .env  # configurar DATABASE_URL e JWT_SECRET
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

Credenciais de teste:
```
Admin:        admin@empresa.com / admin123 (RA gerado automaticamente)
Gestor:       joao@empresa.com / senha123 (RA gerado automaticamente)
Colaborador:  ana@empresa.com / senha123 (RA gerado automaticamente)
```

## Próximos passos

1. Leia BACKEND.md
2. Veja a tabela de permissões completa
3. Leia o doc do seu módulo
4. Comece a codar
