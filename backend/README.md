# Backend - Portal de Gestão de Pessoas

Backend do sistema de gestão de pessoas com avaliações anônimas e bidirecionais.

## 🚀 Tecnologias

- **Node.js** + **Express** - Framework web
- **PostgreSQL** - Banco de dados
- **Prisma ORM** - ORM para PostgreSQL
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas

## 📋 Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL 14+ instalado e rodando
- npm ou yarn

## ⚙️ Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Exemplo de configuração local
DATABASE_URL="postgresql://postgres:senha@localhost:5432/gestao_pessoas?schema=public"
JWT_SECRET="sua_chave_secreta_aqui"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5500"
```

### 3. Configurar banco de dados

```bash
# Gerar cliente Prisma
npx prisma generate

# Criar migration inicial
npx prisma migrate dev --name init

# Popular banco com dados de teste
npm run prisma:seed
```

## 🎯 Scripts disponíveis

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start

# Prisma
npm run prisma:generate  # Gerar cliente Prisma
npm run prisma:migrate   # Criar migration
npm run prisma:seed      # Popular banco com dados de teste
npm run prisma:studio    # Abrir Prisma Studio (visualizar dados)
npm run prisma:reset     # Resetar banco (CUIDADO - apaga tudo)
```

## 👤 Credenciais de Teste

Após rodar o seed, você terá os seguintes usuários:

**Admin:**
- RA: `1000000`
- Email: `admin@empresa.com`
- Senha: `admin123`

**Gestor 1:**
- RA: `2021001`
- Email: `joao@empresa.com`
- Senha: `senha123`

**Gestor 2:**
- RA: `2021002`
- Email: `maria@empresa.com`
- Senha: `senha123`

**Colaborador 1:**
- RA: `2022001`
- Email: `ana@empresa.com`
- Senha: `senha123`

**Colaborador 2:**
- RA: `2022002`
- Email: `carlos@empresa.com`
- Senha: `senha123`

**Colaborador 3:**
- RA: `2022003`
- Email: `beatriz@empresa.com`
- Senha: `senha123`

## 📁 Estrutura do Projeto

```
backend/
├── prisma/
│   ├── schema.prisma    # Schema do banco de dados
│   └── seed.js          # Dados iniciais
├── src/
│   ├── config/          # Configurações
│   ├── middlewares/     # Middlewares (auth, error, etc)
│   ├── modules/         # Módulos da aplicação
│   │   ├── users/       # Módulo de usuários
│   │   ├── evaluations/ # Módulo de avaliações
│   │   ├── competencies/# Módulo de competências
│   │   └── reports/     # Módulo de relatórios
│   ├── utils/           # Utilitários
│   └── server.js        # Entrada da aplicação
├── .env                 # Variáveis de ambiente (não commitado)
├── .env.example         # Exemplo de variáveis
└── package.json         # Dependências e scripts
```

## 🔒 Segurança

- Senhas são hasheadas com bcrypt (10 rounds)
- Autenticação via JWT
- Tokens expiram em 7 dias (configurável)
- CORS configurado para aceitar apenas frontend autorizado
- Validação de dados em todas as rotas

## 📚 Documentação

Para documentação completa da API e arquitetura, consulte:

- `docs/BACKEND.md` - Guia completo do backend
- `docs/backend/ESTAGIARIO_1_USERS.md` - Módulo de usuários
- `docs/backend/ESTAGIARIO_2_EVALUATIONS.md` - Módulo de avaliações
- `docs/backend/ESTAGIARIO_3_COMPETENCIES.md` - Módulo de competências

## 🐛 Troubleshooting

### Erro ao conectar no banco

Verifique se:
1. PostgreSQL está rodando
2. Credenciais no `.env` estão corretas
3. Banco de dados existe (crie com `createdb gestao_pessoas`)

### Erro no seed

```bash
# Resetar banco e tentar novamente
npm run prisma:reset
```

### Erro "Prisma Client not generated"

```bash
# Gerar cliente Prisma
npx prisma generate
```

## 📝 Licença

MIT
