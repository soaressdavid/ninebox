# Comece Aqui

## Você é estagiário de Backend ou Frontend?

### Backend

**PASSO 1**: Leia [`BACKEND.md`](BACKEND.md) - arquitetura geral (15 min)

**PASSO 2**: Leia o doc do seu módulo:
- **Estagiário 1**: [`backend/ESTAGIARIO_1_USERS.md`](backend/ESTAGIARIO_1_USERS.md)
- **Estagiário 2**: [`backend/ESTAGIARIO_2_EVALUATIONS.md`](backend/ESTAGIARIO_2_EVALUATIONS.md)
- **Estagiário 3**: [`backend/ESTAGIARIO_3_COMPETENCIES.md`](backend/ESTAGIARIO_3_COMPETENCIES.md)

**PASSO 3**: Configure o ambiente (comandos no README.md)

**PASSO 4**: Comece a codar seguindo seu doc

---

### Frontend

**PASSO 1**: Leia [`FRONTEND.md`](FRONTEND.md) - arquitetura geral (15 min)

**PASSO 2**: Leia o doc da sua tarefa:
- **Estagiário 1**: [`frontend/ESTAGIARIO_1_INFRAESTRUTURA.md`](frontend/ESTAGIARIO_1_INFRAESTRUTURA.md)
- **Estagiário 2**: [`frontend/ESTAGIARIO_2_INTEGRACAO.md`](frontend/ESTAGIARIO_2_INTEGRACAO.md)

**PASSO 3**: Configure o ambiente (comandos no README.md)

**PASSO 4**: Comece a codar seguindo seu doc

---

---

## Como funciona a arquitetura

### Visão geral do sistema

```
Frontend (HTML/CSS/JS)  ←→  Backend (Node.js API)  ←→  Banco (Supabase)
     ↓                           ↓                        ↓
- Páginas HTML            - Endpoints REST           - Tabelas
- JavaScript modules      - Autenticação JWT         - Relacionamentos
- Validações             - Avaliações anônimas      - Dados
```

### Backend: Arquitetura em camadas

**Padrão**: Controller → Service → Repository

```
HTTP Request
    ↓
Controller (recebe, valida, responde)
    ↓
Service (lógica de negócio, anonimato, regras)
    ↓
Repository (acesso ao banco via Prisma)
    ↓
Database (Supabase PostgreSQL)
```

**Exemplo prático - Avaliação anônima**:
```javascript
// 1. Controller recebe POST /api/evaluations
// 2. Valida dados com Joi
// 3. Service.create(data, avaliadorId, avaliadorTipo)
// 4. Service determina tipo automaticamente
// 5. Repository salva com avaliadorId (interno)
// 6. Response remove avaliadorId (anonimato)
```

### Frontend: Módulos JavaScript

```
Páginas HTML
    ↓
JavaScript Modules:
├── api.js (chamadas HTTP)
├── auth.js (login/logout/permissões)
├── validators.js (validação de formulários)
├── components/ (loading, toast, navbar)
└── pages/ (lógica específica de cada página)
```

### Sistema de Permissões (3 níveis)

```
ADMIN
├── Cadastrar/deletar usuários
├── Ver tudo (incluindo quem avaliou quem)
└── Acesso total

GESTOR
├── Avaliar colaboradores (anônimo)
├── Ver relatórios da equipe
└── Criar Nine Box

COLABORADOR
├── Avaliar gestores (anônimo)
├── Ver próprio perfil
└── Ver próprias avaliações
```

### Sistema de RA (Registro Acadêmico)

- **O que é**: Identificador único de 5 a 10 caracteres (como CPF)
- **Como funciona**: Cada pessoa já tem seu RA
- **No cadastro**: Pessoa informa o RA dela
- **Sistema valida**: 5 a 10 caracteres + não duplicado
- **Usado para**: Buscar usuários, identificação única

---

## O que tem em cada doc principal

### BACKEND.md
- Setup completo (Node, Prisma, Supabase)
- Arquitetura detalhada (Controller → Service → Repository)
- Sistema de permissões e middlewares
- Sistema de RA e validações
- Exemplos de código completos
- Como testar no Postman

### FRONTEND.md
- Setup completo
- Módulos principais (api.js, auth.js, validators.js)
- Sistema de autenticação e proteção de rotas
- Integração com API
- Exemplos de código completos
- Como testar no navegador

---

## Divisão de trabalho

### Backend (3 pessoas)

| Estagiário | Módulo | Arquivo |
|------------|--------|---------|
| 1 | Usuários (autenticação, RA) | [`backend/ESTAGIARIO_1_USERS.md`](backend/ESTAGIARIO_1_USERS.md) |
| 2 | Avaliações (Nine Box) | [`backend/ESTAGIARIO_2_EVALUATIONS.md`](backend/ESTAGIARIO_2_EVALUATIONS.md) |
| 3 | Competências (relatórios) | [`backend/ESTAGIARIO_3_COMPETENCIES.md`](backend/ESTAGIARIO_3_COMPETENCIES.md) |

### Frontend (2 pessoas)

| Estagiário | Tarefa | Arquivo |
|------------|--------|---------|
| 1 | Infraestrutura (API, auth, loading) | [`frontend/ESTAGIARIO_1_INFRAESTRUTURA.md`](frontend/ESTAGIARIO_1_INFRAESTRUTURA.md) |
| 2 | Integração (CRUD, validações) | [`frontend/ESTAGIARIO_2_INTEGRACAO.md`](frontend/ESTAGIARIO_2_INTEGRACAO.md) |

## Docs de apoio (opcional)

- [`GUIA_COMPLETO.md`](../GUIA_COMPLETO.md) - Tutorial completo pra fazer do zero
- [`backend/FAQ.md`](backend/FAQ.md) - Perguntas frequentes backend
- [`frontend/FAQ.md`](frontend/FAQ.md) - Perguntas frequentes frontend
- [`backend/SCHEMA.prisma`](backend/SCHEMA.prisma) - Schema do banco
- [`backend/DIAGRAMAS.md`](backend/DIAGRAMAS.md) - Diagramas visuais
- [`ATUALIZACOES.md`](ATUALIZACOES.md) - Registro de atualizações

**Importante**: RA é como CPF - cada pessoa já tem o seu. No cadastro, a pessoa informa o RA dela.

---

## Resumo rápido

**Backend**: Leia [`BACKEND.md`](BACKEND.md) → Leia doc do seu módulo → Configure ambiente → Code

**Frontend**: Leia [`FRONTEND.md`](FRONTEND.md) → Leia doc da sua tarefa → Rode servidor → Code

Qualquer dúvida, chama no daily.
