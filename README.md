# Portal de Gestão de Pessoas

Sistema de avaliação de desempenho com gestão de colaboradores, avaliações 360°/180°, Nine Box e relatórios.

## Stack

- **Frontend**: HTML + CSS + JavaScript (Vanilla)
- **Backend**: Node.js + Express + Prisma + Supabase + JWT + Joi

## Funcionalidades

- Sistema de permissões (Admin, Gestor, Colaborador)
- Cadastro e busca por RA (Registro Acadêmico - 7 dígitos)
- Avaliações de desempenho com critérios
- Sistema Nine Box (Performance × Potencial)
- Avaliações 360° e 180°
- Gestão de competências
- Dashboard e relatórios

## Arquitetura

### Backend (API REST)
```
Controller → Service → Repository → Database
    ↓         ↓          ↓           ↓
Recebe HTTP  Lógica    Prisma    Supabase
Valida Joi   Negócio   ORM       PostgreSQL
Responde     Regras    Queries   Dados
```

### Frontend (Vanilla JS)
```
HTML Pages → JS Modules → API Calls → Backend
    ↓           ↓            ↓          ↓
Interface   api.js       HTTP       Endpoints
Forms       auth.js      JWT        Responses
Styles      validators   JSON       Data
```

### Permissões (3 níveis)
- **Admin**: Acesso total, cadastra usuários
- **Gestor**: Avalia colaboradores, vê relatórios da equipe
- **Colaborador**: Vê próprio perfil e avaliações

---

## COMECE AQUI

### Você é estagiário de Backend?

1. Leia [`docs/BACKEND.md`](docs/BACKEND.md) - entenda a arquitetura geral (15 min)
2. Leia o doc do seu módulo:
   - **Estagiário 1**: [`docs/backend/ESTAGIARIO_1_USERS.md`](docs/backend/ESTAGIARIO_1_USERS.md)
   - **Estagiário 2**: [`docs/backend/ESTAGIARIO_2_EVALUATIONS.md`](docs/backend/ESTAGIARIO_2_EVALUATIONS.md)
   - **Estagiário 3**: [`docs/backend/ESTAGIARIO_3_COMPETENCIES.md`](docs/backend/ESTAGIARIO_3_COMPETENCIES.md)
3. Configure o ambiente (comandos abaixo)
4. Comece a codar

### Você é estagiário de Frontend?

1. Leia [`docs/FRONTEND.md`](docs/FRONTEND.md) - entenda a arquitetura geral (15 min)
2. Leia o doc da sua tarefa:
   - **Estagiário 1**: [`docs/frontend/ESTAGIARIO_1_INFRAESTRUTURA.md`](docs/frontend/ESTAGIARIO_1_INFRAESTRUTURA.md)
   - **Estagiário 2**: [`docs/frontend/ESTAGIARIO_2_INTEGRACAO.md`](docs/frontend/ESTAGIARIO_2_INTEGRACAO.md)
3. Configure o ambiente (comandos abaixo)
4. Comece a codar

### Quer entender o projeto todo?

Leia [`docs/COMECE_AQUI.md`](docs/COMECE_AQUI.md) - visão geral completa

---

## Setup rápido (faça isso primeiro)

### Backend
```bash
# 1. Criar pasta backend
mkdir backend
cd backend

# 2. Inicializar projeto
npm init -y
npm install express prisma @prisma/client bcryptjs jsonwebtoken joi cors dotenv

# 3. Configurar Prisma
npx prisma init

# 4. Configurar .env (pedir DATABASE_URL pro líder)
# DATABASE_URL="postgresql://..."
# JWT_SECRET="seu-jwt-secret-aqui"

# 5. Depois de configurar, rodar:
npx prisma migrate dev
npx prisma generate
npm run prisma:seed
npm run dev
```

### Frontend
```bash
# Já tem os arquivos, só rodar servidor:
npx serve .
# ou usar Live Server no VS Code
```

---

## Rodar o projeto

### Backend
```bash
cd backend
npm install
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

### Frontend
```bash
npx serve .
# ou use Live Server no VS Code
```

---

## Credenciais de teste

```
Admin:        admin@empresa.com / admin123 (RA: 1000000)
Gestor:       joao@empresa.com / senha123 (RA: 2021001)
Colaborador:  ana@empresa.com / senha123 (RA: 2022001)
```

---

## Estrutura da documentação

```
docs/
├── COMECE_AQUI.md         # Visão geral
├── BACKEND.md             # Guia completo backend
├── FRONTEND.md            # Guia completo frontend
├── GUIA_COMPLETO.md       # Tutorial do zero
│
├── backend/
│   ├── ESTAGIARIO_1_USERS.md
│   ├── ESTAGIARIO_2_EVALUATIONS.md
│   ├── ESTAGIARIO_3_COMPETENCIES.md
│   ├── SCHEMA.prisma
│   ├── DIAGRAMAS.md
│   └── FAQ.md
│
└── frontend/
    ├── ESTAGIARIO_1_INFRAESTRUTURA.md
    ├── ESTAGIARIO_2_INTEGRACAO.md
    └── FAQ.md
```

---

Qualquer dúvida, chama no daily.
