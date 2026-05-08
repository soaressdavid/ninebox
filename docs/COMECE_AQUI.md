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
Frontend (HTML/CSS/JS)  ←→  Backend (Node.js API)  ←→  Banco (PostgreSQL)
     ↓                           ↓                        ↓
- Páginas HTML            - Endpoints REST           - Tabelas
- JavaScript modules      - Auth HttpOnly Cookie    - Relacionamentos
- Validações             - Permissões               - Dados
```

### Backend: Arquitetura em camadas

**Padrão**: Controller → Service → Repository

```
HTTP Request
    ↓
Controller (recebe, valida, responde)
    ↓
Service (lógica de negócio, regras)
    ↓
Repository (acesso ao banco via Prisma)
    ↓
Database (Supabase PostgreSQL)
```

**Exemplo prático**:
```javascript
// 1. Controller recebe POST /api/users/login
// 2. Valida email/senha com Joi
// 3. Chama Service.login(email, senha)
// 4. Service verifica senha, gera JWT
// 5. Repository busca usuário no banco
// 6. Controller retorna token em HttpOnly Cookie + dados do usuário
```

### Frontend: Módulos JavaScript (ES Modules)

```
Páginas HTML
    ↓
JavaScript Modules (import/export):
├── api.js (chamadas HTTP)
├── auth.js (login/logout/permissões)
├── validators.js (validação de formulários)
├── components/ (loading, toast, navbar)
└── pages/ (lógica específica de cada página)
```

**Exemplo de uso:**
```javascript
// Importar módulos
import { usersApi } from '../js/api.js';
import { showToast } from '../js/components/toast.js';

// Exportar funções
export function minhaFuncao() { ... }
```

### Sistema de Permissões (3 níveis)

```
ADMIN
├── Cadastrar/deletar usuários
├── Ver tudo
└── Acesso total

GESTOR
├── Avaliar colaboradores
├── Ver relatórios da equipe
└── Criar Nine Box

COLABORADOR
├── Ver próprio perfil
├── Ver próprias avaliações
└── Responder avaliações 180°
```

### Sistema de RA (Registro Acadêmico)

- **O que é**: Identificador único alfanumérico (como CPF)
- **Como funciona**: Cada pessoa já tem seu RA
- **No cadastro**: Pessoa informa o RA dela (5 a 10 caracteres)
- **Sistema valida**: 5-10 caracteres alfanuméricos + não duplicado
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

- [`backend/FAQ.md`](backend/FAQ.md) - Perguntas frequentes backend
- [`frontend/FAQ.md`](frontend/FAQ.md) - Perguntas frequentes frontend
- [`backend/SCHEMA.prisma`](backend/SCHEMA.prisma) - Schema do banco
- [`backend/DIAGRAMAS.md`](backend/DIAGRAMAS.md) - Diagramas visuais
- [`ATUALIZACOES.md`](ATUALIZACOES.md) - Registro de atualizações

---

## Funcionalidades Implementadas

### Sistema de Validações
- ✅ RA: 5-10 caracteres alfanuméricos
- ✅ Email: .edu.br obrigatório
- ✅ Senha: mínimo 6 caracteres
- ✅ Nome: mínimo 3 caracteres

### Sistema de Autenticação
- ✅ **HttpOnly Cookies** para tokens JWT (segurança profissional)
- ✅ Proteção contra XSS e CSRF
- ✅ Logout seguro (limpa cookie no servidor)
- ✅ Sessões automáticas (cookie enviado automaticamente)

### Sistema de Avaliações
- ✅ Avaliações 180° e 360° anônimas
- ✅ Limite de 24 horas para edição/exclusão (admin sem limite)
- ✅ Sistema de visibilidade por tipo de usuário
- ✅ Exportação CSV com UTF-8 BOM

### Sistema de Dados
- ✅ Mock Mode com 33 usuários, 8 avaliações, 16 Nine Box
- ✅ Persistência em localStorage
- ✅ ES Modules (import/export)
- ✅ Dark mode

**Importante**: RA é como CPF - cada pessoa já tem o seu (5 a 10 caracteres alfanuméricos). No cadastro, a pessoa informa o RA dela. Email institucional (.edu.br) é obrigatório.

---

## Resumo rápido

**Backend**: Leia [`BACKEND.md`](BACKEND.md) → Leia doc do seu módulo → Configure ambiente → Code

**Frontend**: Leia [`FRONTEND.md`](FRONTEND.md) → Leia doc da sua tarefa → Configure ambiente → Code

Qualquer dúvida, chama no daily.
