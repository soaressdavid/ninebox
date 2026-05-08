# Changelog - Atualizações da Documentação

## 🔐 Autenticação Profissional - HttpOnly Cookies (Maio 2026)

### Mudança Importante: localStorage → HttpOnly Cookies

**Motivação:**
- localStorage é vulnerável a ataques XSS (Cross-Site Scripting)
- Tokens JWT em localStorage podem ser roubados por scripts maliciosos
- Solução profissional: HttpOnly Cookies

**O que mudou:**

#### Backend
- ✅ Adicionado `cookie-parser` nas dependências
- ✅ Login retorna token em HttpOnly Cookie (não no body)
- ✅ Novo endpoint: `POST /api/users/logout` (limpa cookie)
- ✅ Middleware `authMiddleware` lê token do cookie (não do header Authorization)
- ✅ CORS configurado com `credentials: true`

**Antes:**
```javascript
// Login retornava token no body
res.json({
  success: true,
  data: { user, token } // ❌ Token exposto
});
```

**Depois:**
```javascript
// Login retorna token em HttpOnly Cookie
res.cookie('token', token, {
  httpOnly: true,      // ✅ Não acessível via JavaScript
  secure: true,        // ✅ Apenas HTTPS
  sameSite: 'strict'   // ✅ Proteção CSRF
});

res.json({
  success: true,
  data: { user } // ✅ Apenas dados do usuário
});
```

#### Frontend
- ✅ Removido `TOKEN_KEY` do config.js
- ✅ `auth.js` usa `credentials: 'include'` em todas as requisições
- ✅ Token não é mais armazenado manualmente (cookie automático)
- ✅ Dados do usuário em `sessionStorage` (apenas info não-sensível)

**Antes:**
```javascript
// ❌ Token em localStorage (vulnerável)
localStorage.setItem('token', token);

fetch('/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Depois:**
```javascript
// ✅ Cookie enviado automaticamente
fetch('/api/users/profile', {
  credentials: 'include' // Cookie enviado automaticamente
});
```

### Documentos Atualizados
- ✅ `docs/SETUP_COMPLETO.md` - **NOVO** - Guia completo de setup
- ✅ `docs/COMECE_AQUI.md` - Adicionada seção sobre autenticação profissional
- ✅ `docs/backend/ESTAGIARIO_1_USERS.md` - Atualizado com HttpOnly Cookies
- ✅ `docs/frontend/ESTAGIARIO_1_INFRAESTRUTURA.md` - Atualizado com HttpOnly Cookies
- ✅ `docsmeus/GUIA_COMPLETO.md` - Atualizado (apenas para você)

### Comparação de Segurança

| Método | Segurança XSS | Segurança CSRF | Profissional |
|--------|---------------|----------------|--------------|
| localStorage | ❌ Vulnerável | ✅ Protegido | ⚠️ Básico |
| sessionStorage | ❌ Vulnerável | ✅ Protegido | ⚠️ Médio |
| **HttpOnly Cookie** | ✅ **Protegido** | ✅ **Protegido** | ✅ **Recomendado** |

### Durante Desenvolvimento com MOCK

**IMPORTANTE**: Enquanto o backend não estiver pronto:
- Use `sessionStorage` temporariamente para simular autenticação
- Quando backend estiver pronto, migre para HttpOnly Cookies
- Código já está preparado para a migração

### Benefícios

1. **Segurança**: Token não acessível via JavaScript (protege contra XSS)
2. **Automático**: Cookie enviado automaticamente em cada requisição
3. **Profissional**: Padrão usado por grandes empresas
4. **Simples**: Menos código no frontend (sem gerenciamento manual de token)

---

## Correção Importante - RA do ENIAC

### Sistema de RA Corrigido

**O que é RA:**
- Registro Acadêmico do ENIAC (7 dígitos)
- Cada colaborador e gestor já tem seu RA
- É como um CPF - um número único que a pessoa já possui
- Admin também tem RA próprio

**Como funciona no sistema:**
- No cadastro, a pessoa informa o RA dela
- Sistema valida se tem 7 dígitos
- Sistema verifica se não está duplicado no banco
- Sistema NÃO gera RA automaticamente

**Não há integração com banco do ENIAC** - o RA é apenas um dado que a pessoa informa.

### Documentos Atualizados
- ✅ `docs/backend/ESTAGIARIO_1_USERS.md` - Explicação correta sobre RA
- ✅ `docs/frontend/ESTAGIARIO_1_INFRAESTRUTURA.md` - Sistema de RA atualizado
- ✅ `docs/frontend/ESTAGIARIO_2_INTEGRACAO.md` - Validação de RA corrigida
- ✅ `GUIA_COMPLETO.md` - Seed e exemplos atualizados
- ✅ `docs/BACKEND.md` - Sistema de RA corrigido
- ✅ `docs/backend/FAQ.md` - Perguntas sobre RA atualizadas
- ✅ `docs/backend/DIAGRAMAS.md` - Diagramas atualizados

---

## Atualização Completa - 30/04/2026

### Todas as atualizações foram concluídas!

Documentação completamente atualizada e consistente com o sistema de RA e permissões de 3 níveis.

**ÚLTIMA ATUALIZAÇÃO**: Adicionadas regras de permissão detalhadas e exemplos de código de rotas protegidas em todos os módulos do backend.

### Backend

#### Schema Prisma Atualizado
- ✅ Adicionado campo `ra` (String, unique, 7 dígitos)
- ✅ Adicionado índice em `ra` para busca rápida
- ✅ Adicionado tipo `admin` no enum `UserType`
- ✅ Enum agora: `admin`, `gestor`, `colaborador`

#### Sistema de RA (Registro Acadêmico)
- ✅ Cada pessoa já tem seu RA (como CPF)
- ✅ No cadastro, pessoa informa o RA dela
- ✅ Sistema valida se tem 7 dígitos
- ✅ Sistema verifica se não está duplicado
- ✅ Admin também tem RA próprio
- ✅ Único por usuário (constraint no banco)

#### Sistema de Permissões
- ✅ 3 níveis: Admin, Gestor, Colaborador
- ✅ Apenas admin pode cadastrar usuários
- ✅ Admin criado apenas via seed (não pela API)
- ✅ Middlewares: `isAdminMiddleware`, `isGestorOrAdminMiddleware`

#### Endpoints Atualizados

**Módulo de Usuários (Estagiário 1)**:
- ✅ `POST /api/users/register` - Requer campo `ra` e apenas admin
- ✅ `GET /api/users/ra/:ra` - NOVO endpoint para busca por RA
- ✅ `DELETE /api/users/:id` - Apenas admin

**Módulo de Avaliações (Estagiário 2)**:
- ✅ Todos os endpoints documentados com regras de permissão
- ✅ Adicionada seção "Rotas Protegidas" com exemplos de código
- ✅ Middlewares: `isGestorOrAdminMiddleware` em POST/PUT/DELETE
- ✅ Validações no service para update/delete (apenas criador ou admin)
- ✅ Filtros por permissão em GET (admin vê tudo, gestor vê equipe, colaborador vê próprio)

**Módulo de Competências e Relatórios (Estagiário 3)**:
- ✅ Todos os endpoints documentados com regras de permissão
- ✅ Adicionada seção "Rotas Protegidas" com exemplos de código
- ✅ Competências: POST/PUT/DELETE apenas admin (`isAdminMiddleware`)
- ✅ Competências: GET todos autenticados
- ✅ Dashboard: apenas gestor ou admin (`isGestorOrAdminMiddleware`)
- ✅ Relatórios: validações no service (admin vê tudo, gestor vê equipe, colaborador vê próprio)

#### Seed Atualizado
- ✅ Cria admin com RA 1000000
- ✅ Cria gestores com RA 2021001, 2021002
- ✅ Cria colaboradores com RA 2022001, 2022002, 2022003
- ✅ Credenciais de teste atualizadas

---

### Frontend

#### Autenticação
- ✅ Método `isAdmin()` adicionado
- ✅ Método `isGestorOrAdmin()` adicionado
- ✅ Método `requireAdmin()` para proteger páginas

#### Validações
- ✅ Validador `ra` adicionado (7 dígitos numéricos)
- ✅ Mensagem de erro para RA inválido

#### Páginas
- ✅ Campo RA adicionado no formulário de cadastro
- ✅ Validação de RA no cadastro
- ✅ Verificação de permissão admin antes de cadastrar
- ✅ Nova página: `pages/buscar-ra.html` (a ser criada)
- ✅ Novo script: `js/pages/buscar-ra.js` (a ser criado)

---

### Documentação

#### Arquivos Principais
- ✅ `docs/BACKEND.md` - Guia completo consolidado
- ✅ `docs/FRONTEND.md` - Guia completo consolidado
- ✅ `docs/COMECE_AQUI.md` - Ponto de entrada
- ✅ `docs/INDICE.md` - Índice completo

#### Arquivos Atualizados
- ✅ `docs/backend/SCHEMA.prisma` - Schema completo com RA e admin
- ✅ `docs/backend/ESTAGIARIO_1_USERS.md` - Atualizado com RA e permissões
- ✅ `docs/backend/ESTAGIARIO_2_EVALUATIONS.md` - Atualizado com permissões e rotas protegidas
- ✅ `docs/backend/ESTAGIARIO_3_COMPETENCIES.md` - Atualizado com permissões e rotas protegidas
- ✅ `docs/BACKEND.md` - Guia completo consolidado
- ✅ `docs/FRONTEND.md` - Guia completo consolidado
- ✅ `docs/ATUALIZACOES.md` - Registro de todas as mudanças
- ✅ `README.md` - Atualizado com nova estrutura

#### Arquivos Removidos (consolidados)
- ❌ `docs/backend/README.md` → consolidado em `BACKEND.md`
- ❌ `docs/backend/SETUP.md` → consolidado em `BACKEND.md`
- ❌ `docs/backend/ARQUITETURA.md` → consolidado em `BACKEND.md`
- ❌ `docs/backend/PERMISSOES.md` → consolidado em `BACKEND.md`
- ❌ `docs/frontend/README.md` → consolidado em `FRONTEND.md`
- ❌ `docs/frontend/COMECE_AQUI.md` → consolidado em `FRONTEND.md`

---

## Checklist de Implementação

### Backend

#### Módulo de Usuários (Estagiário 1)
- [ ] Atualizar `prisma/schema.prisma` com campo `ra` e tipo `admin`
- [ ] Rodar migration: `npx prisma migrate dev --name add-ra-and-admin`
- [ ] Atualizar `user.validation.js` com validação de RA
- [ ] Atualizar `user.repository.js` com métodos `findByRA` e `raExists`
- [ ] Atualizar `user.service.js` com validação de permissões
- [ ] Atualizar `user.controller.js` com método `getUserByRA`
- [ ] Criar middlewares `isAdminMiddleware` e `isGestorOrAdminMiddleware`
- [ ] Atualizar `user.routes.js` protegendo rotas
- [ ] Atualizar `prisma/seed.js` criando admin
- [ ] Rodar seed: `npm run prisma:seed`
- [ ] Testar todos os endpoints

#### Módulo de Avaliações (Estagiário 2)
- [ ] Atualizar `evaluation.routes.js` com middlewares de permissão
- [ ] Adicionar `isGestorOrAdminMiddleware` em POST/PUT/DELETE
- [ ] Implementar validações no `evaluation.service.js`:
  - [ ] Método `update()` - validar se é criador ou admin
  - [ ] Método `delete()` - validar se é criador ou admin
  - [ ] Método `findById()` - validar permissão de visualização
  - [ ] Método `findAll()` - filtrar por permissão
- [ ] Testar todos os endpoints com diferentes tipos de usuário

#### Módulo de Competências e Relatórios (Estagiário 3)
- [ ] Atualizar `competency.routes.js` com middlewares de permissão
- [ ] Adicionar `isAdminMiddleware` em POST/PUT/DELETE de competências
- [ ] Atualizar `report.routes.js` com middlewares de permissão
- [ ] Adicionar `isGestorOrAdminMiddleware` em dashboard
- [ ] Implementar validações no `report.service.js`:
  - [ ] Método `getDashboard()` - validar gestor ou admin
  - [ ] Método `getUserReport()` - validar permissão de visualização
  - [ ] Método `getTeamReport()` - validar se é gestor da equipe
  - [ ] Método `exportReport()` - validar permissão de exportação
- [ ] Testar todos os endpoints com diferentes tipos de usuário

### Frontend
- [ ] Atualizar `js/auth.js` com métodos `isAdmin()` e `requireAdmin()`
- [ ] Adicionar campo RA em `pages/cadastrar.html`
- [ ] Atualizar `js/validators.js` com validador de RA
- [ ] Atualizar `js/pages/cadastrar.js` com validação de RA
- [ ] Criar `pages/buscar-ra.html`
- [ ] Criar `js/pages/buscar-ra.js`
- [ ] Adicionar link "Buscar RA" na navbar
- [ ] Proteger página de cadastro (apenas admin)
- [ ] Testar fluxo completo

---

## Credenciais de Teste Atualizadas

**IMPORTANTE**: Use RAs reais das pessoas. Os exemplos abaixo são fictícios.

```
Admin:
  RA: 1234567 (use RA real)
  Email: admin@eniac.edu.br
  Senha: admin123

Gestor 1:
  RA: 2021001 (use RA real)
  Email: joao@eniac.edu.br
  Senha: senha123

Gestor 2:
  RA: 2021002 (use RA real)
  Email: maria@eniac.edu.br
  Senha: senha123

Colaborador 1:
  RA: 2022001 (use RA real)
  Email: ana@eniac.edu.br
  Senha: senha123

Colaborador 2:
  RA: 2022002 (use RA real)
  Email: carlos@eniac.edu.br
  Senha: senha123

Colaborador 3:
  RA: 2022003 (use RA real)
  Email: beatriz@eniac.edu.br
  Senha: senha123
```

---

## Próximos Passos

1. **Backend**: Implementar as mudanças seguindo o checklist
2. **Frontend**: Implementar as mudanças seguindo o checklist
3. **Testar**: Validar todo o fluxo de permissões
4. **Documentar**: Atualizar README com exemplos de uso

---

**Documentação atualizada e consistente!**
