# ESTAGIÁRIO FRONTEND 2 - Integração Completa das Páginas com o Backend

## Missão

Você vai pegar a base criada pelo Estagiário 1 e reescrever o frontend legado para ficar 100% alinhado com o backend.

Seu trabalho cobre:

1. Atualização de terminologia (FASE 2)
2. Integração completa com API (FASE 4)
3. CRUD de usuários
4. Dashboard com dados reais
5. Sistema de avaliações anônimas e bidirecionais (FASE 5)
6. Remoção do uso de `localStorage` como banco de dados

---

## Terminologia obrigatória

O sistema usa os seguintes termos. Nunca use os termos antigos.

| ❌ Antigo       | ✅ Correto      |
|----------------|----------------|
| `estagiario`   | `colaborador`  |
| `professor`    | `gestor`       |
| `disciplina`   | `cargo` ou `departamento` |

Isso vale para variáveis, labels, comentários, payloads, filtros e qualquer texto visível ao usuário.

---

## Dependências deste trabalho

Antes de começar, o projeto precisa já ter:

- `js/config.js`
- `js/api.js`
- `js/auth.js`
- `js/validators.js`
- `js/components/loading.js`
- `js/components/toast.js`
- `pages/login.html`
- `js/pages/login.js`

Se esses módulos ainda não existirem, pare e alinhe com o Estagiário 1.

---

## Escopo por fase

### FASE 2: Atualizar Terminologia

Você deve trocar no frontend inteiro:

- `estagiario` → `colaborador`
- `professor` → `gestor`
- `disciplina` → `cargo` ou `departamento`

Também deve:

- adicionar campo `RA` obrigatório nos formulários de cadastro
- revisar labels, textos e badges
- revisar filtros, payloads e renderização
- atualizar a validação de email para aceitar qualquer domínio válido

### FASE 4: Integração com API

Você deve:

- substituir arrays de `localStorage` por chamadas à API
- implementar CRUD completo de usuários
- integrar perfil, dashboard, avaliações, competências e relatórios
- adicionar loading e tratamento de erro em todas as telas

### FASE 5: Avaliações anônimas e bidirecionais

Você deve alinhar as telas de avaliação para o backend atual:

- avaliações bidirecionais (gestor avalia colaborador e vice-versa)
- anonimato preservado (`avaliadorId` nunca exibido para usuário comum)
- tipos corretos de avaliação
- uso dos endpoints reais

---

## Incompatibilidades que você precisa eliminar

### Dados locais como fonte de verdade

Não pode mais existir lógica de negócio baseada em:

- `localStorage.contatos`
- `localStorage.avaliacoes`
- `localStorage.nineBoxAvaliacoes`
- qualquer array mock persistido como fonte oficial

`localStorage` fica restrito a sessão mínima de autenticação (token + usuário).

### Terminologia antiga

Não pode sobrar no comportamento do frontend:

- `tipo: "professor"`
- `tipo: "estagiario"`
- campos `disciplina` para representar papel/cargo

### Fluxos sem permissão

Cada tela precisa validar acesso:

- `admin`: cadastro e exclusão de usuários
- `gestor`/`admin`: dashboard estratégico, equipe, Nine Box
- `colaborador`: perfil próprio, avaliações próprias, fluxo de avaliação permitido

---

## Contrato oficial do backend

### Usuários

- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/users/profile`
- `PUT /api/users/profile`
- `GET /api/users`
- `GET /api/users/:id`
- `GET /api/users/ra/:ra`
- `DELETE /api/users/:id`

### Avaliações

- `POST /api/evaluations`
- `POST /api/evaluations/comment`
- `GET /api/evaluations`
- `GET /api/evaluations/:id`
- `GET /api/evaluations/user/:userId`
- `GET /api/evaluations/stats/:userId`
- `PUT /api/evaluations/:id`
- `DELETE /api/evaluations/:id`
- `POST /api/evaluations/nine-box`
- `GET /api/evaluations/nine-box`
- `GET /api/evaluations/nine-box/:id`

### Competências e relatórios

- `GET /api/competencies`
- `GET /api/competencies/:id`
- `GET /api/competencies/types`
- `POST /api/competencies`
- `PUT /api/competencies/:id`
- `DELETE /api/competencies/:id`
- `GET /api/reports/dashboard`
- `GET /api/reports/user/:userId`
- `GET /api/reports/team/:gestorId`
- `GET /api/reports/export/:userId`

---

## Estrutura de páginas que você vai reescrever

```text
pages/
├── cadastrar.html
├── consultar.html
├── avaliacoes.html
├── avaliacao-180.html      ✨ Nova: Avaliação 180° (gestor → colaborador)
├── avaliacao-360.html      ✨ Nova: Avaliação 360° (admin → qualquer)
├── nine-box.html
├── competencias.html
├── relatorios.html
├── sobre.html
└── perfil.html

css/
├── style.css               (global)
├── avaliacoes.css
├── avaliacao-180.css       ✨ Nova: Estilos específicos para 180°
├── responder-180.css       ✨ Nova: Estilos para responder 180°
├── nine-box.css
└── competencias.css

js/pages/
├── cadastrar.js
├── consultar.js
├── avaliacoes.js
├── dashboard.js
├── nine-box.js
├── competencias.js
└── perfil.js
```

---

## Regras funcionais por área

## 1. Cadastro de usuários

### Regras

- apenas `admin` pode cadastrar
- RA é obrigatório
- tipos permitidos:
  - `gestor`
  - `colaborador`
- o formulário precisa refletir o tipo escolhido

### Mapeamento de campos

Campos comuns para todos:

- `ra` (obrigatório, 5 a 10 caracteres)
- `nome` (obrigatório, mínimo 3 caracteres)
- `email` (obrigatório, formato válido)
- `senha` (obrigatório, mínimo 6 caracteres)
- `tipo` (obrigatório: `gestor` ou `colaborador`)
- `foto` (opcional)

Para `gestor`:

- `departamento` (obrigatório)
- `cargo` (opcional)

Para `colaborador`:

- `cargo` (obrigatório)
- `departamento` (opcional)

### Validações mínimas

- nome obrigatório
- email válido (qualquer domínio)
- senha com mínimo de 6 caracteres
- RA com 5 a 10 caracteres
- tipo obrigatório

### Observação importante

O backend é a fonte de verdade para validação final. O frontend valida antes para melhorar UX, mas não substitui a regra da API.

---

## 2. Consulta de usuários

### A tela deve permitir

- listar usuários pela API
- filtrar por `tipo` (`gestor`, `colaborador`)
- filtrar por `departamento`
- buscar por `RA`
- exibir ações conforme permissão

### Comportamento esperado

- `admin` vê todos e pode excluir
- `gestor` vê dados permitidos da equipe
- `colaborador` não acessa listagem administrativa

Use:

```javascript
api.getUsers(filters)
api.getUserByRA(ra)
api.deleteUser(id)
```

---

## 3. Perfil

### A tela de perfil deve usar API

- carregar via `api.getProfile()`
- salvar via `api.updateProfile(data)`

### O que não fazer

- não renderizar perfil a partir de objeto salvo manualmente em `localStorage`
- não manter cópia paralela do perfil como fonte principal

---

## 4. Dashboard e relatórios

### Dashboard

Deve usar:

```javascript
api.getDashboard()
```

### Regras

- `admin` e `gestor` acessam dashboard estratégico
- `colaborador` não acessa dashboard geral

Se necessário, exiba:

- totais por tipo de usuário
- distribuição de avaliações
- indicadores da equipe
- resumo Nine Box

Sempre com loading, estado vazio e erro.

---

## 5. Avaliações anônimas e bidirecionais

### O sistema correto é este

O backend determina o tipo de avaliação automaticamente com base nos tipos dos usuários envolvidos:

| Avaliador     | Avaliado      | Tipo gerado automaticamente    |
|---------------|---------------|-------------------------------|
| `gestor`      | `colaborador` | `gestor_para_colaborador`     |
| `colaborador` | `gestor`      | `colaborador_para_gestor`     |
| `admin`       | qualquer      | `avaliacao_360`               |

### Regras de permissão

- `gestor` pode avaliar `colaborador` (anônimo)
- `colaborador` pode avaliar `gestor` (anônimo)
- `admin` pode operar qualquer fluxo permitido pela API
- `gestor` **não pode** avaliar outro `gestor` (exceto admin)
- `colaborador` **não pode** avaliar outro `colaborador` (exceto admin)
- ninguém pode se autoavaliar (exceto admin)

### Anonimato

- `avaliadorId` é salvo no banco para controle interno
- `avaliadorId` **nunca** é exibido para usuário comum
- apenas `admin` vê quem avaliou quem (auditoria)
- a interface deve deixar claro quando a avaliação é anônima

### Payload mínimo de criação

```json
{
  "avaliadoId": "uuid",
  "comentario": "Texto opcional",
  "anonima": true
}
```

Se a API exigir critérios/notas, envie exatamente no formato definido pelo backend:

```json
{
  "avaliadoId": "uuid",
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

### O que a tela precisa garantir

- impedir autoavaliação indevida quando a API não permitir
- listar avaliações via API
- exibir dados sanitizados sem tentar "descobrir" o avaliador
- mostrar mensagens adequadas de sucesso e falha
- não pedir `tipoAvaliacao` manualmente quando puder ser derivado do contexto

---

## 6. Nine Box

### Regras

- somente `gestor` e `admin` podem criar
- `colaborador` pode no máximo ver o que a API permitir

### Categorias Nine Box

| Performance | Potential | Categoria      |
|-------------|-----------|----------------|
| 3           | 3         | Superstar      |
| 3           | 2         | Especialista   |
| 3           | 1         | Âncora         |
| 2           | 3         | Estrela        |
| 2           | 2         | Núcleo         |
| 2           | 1         | Trabalhador    |
| 1           | 3         | Enigma         |
| 1           | 2         | Dilema         |
| 1           | 1         | Questão        |

### A tela deve usar

```javascript
api.createNineBox(data)
api.getNineBox(filters)
```

Não use cálculos locais como fonte final do grid se a API já trouxer a classificação.

---

## 7. Competências

### Regras

- leitura para todos os usuários autenticados
- criação/edição/exclusão apenas para `admin`

### Tipos de competência

- `desempenho`
- `comportamento`
- `tecnica`
- `lideranca`

### A tela deve usar

```javascript
api.getCompetencies()
api.getCompetencyTypes()
api.createCompetency(data)
api.updateCompetency(id, data)
api.deleteCompetency(id)
```

---

## 8. Página Sobre

### Objetivo

Página informativa sobre o sistema, acessível a todos os usuários autenticados.

### Conteúdo obrigatório

A página deve conter:

1. **Hero Section**
   - Ícone do sistema
   - Título: "Portal de Gestão de Pessoas"
   - Descrição breve do sistema

2. **O que é o sistema**
   - Explicação sobre o propósito
   - Foco em avaliações anônimas e bidirecionais
   - Cultura de feedback contínuo

3. **Principais Funcionalidades**
   - Cards com ícones para cada funcionalidade:
     - Gestão de Usuários
     - Avaliações Anônimas
     - Nine Box Grid
     - Competências
     - Relatórios
     - Avaliação 180° e 360°

4. **Tecnologias Utilizadas**
   - Badges com as tecnologias:
     - Node.js + Express
     - PostgreSQL + Prisma ORM
     - JavaScript ES6+
     - HTML5 + CSS3
     - JWT Authentication
     - Bcrypt Encryption

5. **Equipe de Desenvolvimento**
   - Cards da equipe (pode usar avatares genéricos):
     - Estagiário Backend 1 (Módulo de Usuários)
     - Estagiário Backend 2 (Módulo de Avaliações)
     - Estagiário Backend 3 (Competências e Relatórios)
     - Estagiário Frontend 1 (Infraestrutura Frontend)
     - Estagiário Frontend 2 (Integração com Backend)

6. **Contato e Suporte**
   - Informações de contato
   - E-mail de suporte

7. **Versão do Sistema**
   - Número da versão
   - Data de lançamento
   - Instituição (ENIAC)

### Regras de implementação

- Página acessível a todos os usuários autenticados
- Não requer permissões especiais
- Deve usar `requireAuth()` para proteger
- Design limpo e profissional
- Responsiva para mobile
- Suporte a dark mode

### Estrutura HTML

```html
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <!-- Meta tags e links CSS -->
</head>
<body>
  <header><!-- Header padrão --></header>
  <nav class="navbar"><!-- Navbar padrão --></nav>
  
  <main class="wrapper sobre-wrapper">
    <div class="sobre-container">
      <!-- Hero -->
      <div class="sobre-hero">...</div>
      
      <!-- Seções -->
      <div class="sobre-section"><!-- O que é --></div>
      <div class="sobre-section"><!-- Funcionalidades --></div>
      <div class="sobre-section"><!-- Tecnologias --></div>
      <div class="sobre-section"><!-- Equipe --></div>
      <div class="sobre-section"><!-- Contato --></div>
      <div class="sobre-section"><!-- Versão --></div>
    </div>
  </main>

  <script type="module">
    import { requireAuth } from '../js/auth.js';
    import '../js/navbar.js';
    requireAuth();
  </script>
</body>
</html>
```

### CSS específico

A página usa apenas o `style.css` global com estilos inline específicos para:
- `.sobre-wrapper` - Container principal
- `.sobre-hero` - Seção hero com gradiente
- `.sobre-section` - Cards de seção
- `.sobre-features` - Grid de funcionalidades
- `.sobre-feature` - Card de funcionalidade
- `.sobre-tech` - Badges de tecnologia
- `.sobre-team` - Grid da equipe
- `.sobre-contact` - Card de contato

---

## 9. Implementações Detalhadas por Página

### 9.1. Cadastrar (pages/cadastrar.html)

**Estrutura:**
- Toggle de tipo (Gestor / Colaborador)
- Formulário com campos dinâmicos baseado no tipo
- Validação inline
- Proteção: apenas admin

**Campos do formulário:**
```javascript
// Campos comuns
- RA (input text, 5-10 caracteres)
- Nome completo (input text)
- E-mail institucional (input email)
- Senha (input password, min 6 caracteres)
- Cargo (input text)
- Departamento (input text)

// Toggle tipo: gestor | colaborador
```

**Lógica JavaScript:**
```javascript
import { requireRole } from '../js/auth.js';
import { usersApi } from '../js/api.js';
import { validateCadastroForm } from '../js/validators.js';

requireRole('admin'); // Apenas admin pode cadastrar

window.setTipoCad = function(tipo) {
  document.getElementById('cad-tipo').value = tipo;
  // Atualizar UI do toggle
};

window.cadastrarUsuario = async function() {
  const dados = {
    ra: document.getElementById('cad-ra').value.trim(),
    nome: document.getElementById('cad-nome').value.trim(),
    email: document.getElementById('cad-email').value.trim(),
    senha: document.getElementById('cad-senha').value,
    tipo: document.getElementById('cad-tipo').value,
    cargo: document.getElementById('cad-cargo').value.trim(),
    departamento: document.getElementById('cad-departamento').value.trim()
  };

  if (!validateCadastroForm(dados)) return;

  try {
    await usersApi.register(dados);
    showToast('Usuário cadastrado com sucesso!', 'success');
    // Limpar formulário
  } catch (error) {
    // Erro já tratado pelo api.js
  }
};
```

---

### 9.2. Consultar (pages/consultar.html)

**Estrutura:**
- Filtros (Todos / Gestores / Colaboradores)
- Busca por nome
- Busca por RA
- Lista de usuários com paginação
- Modal de detalhes
- Proteção: gestor ou admin

**Funcionalidades:**
```javascript
import { requireRole, isAdmin } from '../js/auth.js';
import { usersApi } from '../js/api.js';

requireRole('gestorOrAdmin');

let paginaAtual = 1;
let filtroAtual = 'todos';

async function carregarUsuarios(page = 1) {
  const params = { page, limit: 10 };
  if (filtroAtual !== 'todos') params.tipo = filtroAtual;
  
  const busca = document.getElementById('busca-nome').value.trim();
  if (busca) params.search = busca;

  const res = await usersApi.list(params);
  renderLista(res.data.users);
  renderPaginacao(res.data.pagination);
}

window.filtrar = function(tipo) {
  filtroAtual = tipo;
  carregarUsuarios(1);
};

window.buscarPorRA = async function() {
  const ra = document.getElementById('busca-ra').value.trim();
  if (!ra) return;
  const res = await usersApi.getByRA(ra);
  renderLista([res.data]);
};

window.deletarUsuario = async function(id, nome) {
  if (!isAdmin()) return;
  if (!confirm(`Deletar "${nome}"?`)) return;
  await usersApi.delete(id);
  carregarUsuarios(paginaAtual);
};
```

---

### 9.3. Avaliações (pages/avaliacoes.html)

**Estrutura em 3 etapas:**

**Etapa 1: Seleção do tipo**
- Card "Avaliação de Gestor" (colaborador avalia gestor)
- Card "Avaliação de Colaborador" (gestor avalia colaborador)
- Card "Ver Histórico"

**Etapa 2: Formulário de avaliação**
- Select de quem avaliar (filtrado por permissão)
- Critérios com estrelas (1-5):
  - Pontualidade
  - Comunicação
  - Desempenho Técnico
  - Proatividade
  - Trabalho em Equipe
- Média geral calculada
- Comentário opcional
- Histórico lateral com filtros

**Etapa 3: Histórico completo**
- Lista todas as avaliações
- Filtros: Todos / Recebidas / Feitas por mim

**Lógica de permissões:**
```javascript
import { getUser, isGestor, isColaborador } from '../js/auth.js';

// Gestor: só pode avaliar colaborador
if (isGestor()) {
  document.getElementById('card-gestor').style.display = 'none';
}

// Colaborador: só pode avaliar gestor
if (isColaborador()) {
  document.getElementById('card-colaborador').style.display = 'none';
}

// Carregar lista de quem pode ser avaliado
async function carregarAvaliaveis() {
  let tipo;
  if (isGestor()) tipo = 'colaborador';
  else if (isColaborador()) tipo = 'gestor';
  
  const res = await usersApi.list({ tipo, limit: 100 });
  const users = res.data.users.filter(u => u.id !== getUser().id);
  // Renderizar no select
}

// Enviar avaliação
window.enviarAvaliacao = async function() {
  const payload = {
    avaliadoId: document.getElementById('avaliado').value,
    criterios: {
      pontualidade: notas.pontualidade,
      comunicacao: notas.comunicacao,
      tecnico: notas.tecnico,
      proatividade: notas.proatividade,
      equipe: notas.equipe
    },
    comentario: document.getElementById('comentario').value.trim() || null,
    anonima: true
  };

  await evaluationsApi.create(payload);
  showToast('Avaliação enviada com sucesso!', 'success');
};
```

**CSS específico:** `avaliacoes.css`

---

### 9.4. Nine Box (pages/nine-box.html)

**Estrutura:**
- Painel lateral (apenas gestor/admin):
  - Select de pessoa
  - Botões de Performance (Baixo/Médio/Alto)
  - Botões de Potential (Baixo/Médio/Alto)
  - Preview da categoria
  - Comentário opcional
  - Botão salvar
- Grid 3x3 com categorias:
  - Cada célula mostra pessoas posicionadas
  - Cores diferentes por categoria
  - Filtros: Todos / Gestores / Colaboradores
- Modal de detalhes ao clicar em pessoa

**Categorias e cores:**
```javascript
const CATEGORIAS = {
  '3-3': { nome: 'Superstar', icon: '🚀', cor: '#bbf7d0' },
  '2-3': { nome: 'Estrela', icon: '⭐', cor: '#bfdbfe' },
  '1-3': { nome: 'Enigma', icon: '🔮', cor: '#fed7aa' },
  '3-2': { nome: 'Especialista', icon: '🎯', cor: '#e9d5ff' },
  '2-2': { nome: 'Núcleo', icon: '💎', cor: '#e2e8f0' },
  '1-2': { nome: 'Dilema', icon: '🤔', cor: '#fef3c7' },
  '3-1': { nome: 'Âncora', icon: '⚓', cor: '#a7f3d0' },
  '2-1': { nome: 'Trabalhador', icon: '⚙️', cor: '#fce7f3' },
  '1-1': { nome: 'Questão', icon: '❓', cor: '#fecaca' }
};
```

**Lógica:**
```javascript
import { isGestorOrAdmin } from '../js/auth.js';
import { nineBoxApi, usersApi } from '../js/api.js';

// Ocultar painel para colaboradores
if (!isGestorOrAdmin()) {
  document.getElementById('nb-panel').style.display = 'none';
}

let nbPerf = null;
let nbPot = null;

window.selectAxis = function(axis, val) {
  if (axis === 'perf') nbPerf = val;
  else nbPot = val;
  atualizarPreview();
};

window.salvarNB = async function() {
  const payload = {
    pessoaId: document.getElementById('nb-pessoa').value,
    performance: nbPerf,
    potential: nbPot,
    comentario: document.getElementById('nb-comentario').value.trim() || null
  };

  await nineBoxApi.create(payload);
  showToast('Posição salva no Nine Box!', 'success');
  carregarGrid();
};

async function carregarGrid() {
  const res = await nineBoxApi.list({ limit: 200 });
  renderGrid(res.data.nineBoxes);
}
```

**CSS específico:** `nine-box.css`

---

### 9.5. Competências (pages/competencias.html)

**Estrutura:**
- Tela de lista (todos podem ver)
- Tela de formulário (apenas admin pode criar/editar)

**Lista:**
- Cards de competências com:
  - Nome
  - Descrição
  - Badges (tipo, competência de)
  - Critérios listados
  - Botões editar/deletar (apenas admin)

**Formulário:**
- Nome da competência
- Competência de (Gestor / Colaborador / Todos)
- Tipo (Desempenho / Comportamento / Técnica / Liderança)
- Descrição
- 4 critérios de avaliação
- Escala de notas (1-4)

**Lógica:**
```javascript
import { requireAuth, isAdmin } from '../js/auth.js';
import { competenciesApi } from '../js/api.js';

requireAuth();

// Exibir botão "Nova" apenas para admin
if (isAdmin()) {
  document.getElementById('btn-nova-comp').style.display = 'flex';
}

let editandoId = null;

window.abrirFormulario = function(id = null) {
  editandoId = id;
  document.getElementById('tela-lista').style.display = 'none';
  document.getElementById('tela-form').style.display = 'block';
  
  if (id) {
    // Carregar dados da competência para edição
    const comp = todasCompetencias.find(c => c.id === id);
    preencherFormulario(comp);
  }
};

window.salvarCompetencia = async function() {
  const dados = {
    nome: document.getElementById('comp-nome').value.trim(),
    descricao: document.getElementById('comp-descricao').value.trim(),
    competenciaDe: document.getElementById('comp-de').value,
    tipo: document.getElementById('comp-tipo').value,
    criterios: Array.from(document.querySelectorAll('#comp-criterios-grid textarea'))
      .map(t => t.value.trim()).filter(Boolean)
  };

  if (editandoId) {
    await competenciesApi.update(editandoId, dados);
  } else {
    await competenciesApi.create(dados);
  }
  
  fecharFormulario();
  carregarCompetencias();
};
```

**CSS específico:** `competencias.css`

---

### 9.6. Perfil (perfil.html)

**Estrutura:**
- Sidebar:
  - Foto (clicável para trocar)
  - Nome
  - Badge de tipo
  - Stats (RA, avaliações recebidas, média geral)
- Main com tabs:
  - Tab "Dados": editar nome, cargo, departamento
  - Tab "Avaliações recebidas": lista de avaliações
  - Tab "Senha": alterar senha

**Lógica:**
```javascript
import { requireAuth, getUser, setUser } from './js/auth.js';
import { usersApi, reportsApi } from './js/api.js';

requireAuth();

const user = getUser();

async function carregarPerfil() {
  const res = await usersApi.getProfile();
  renderPerfil(res.data);
}

window.salvarPerfil = async function() {
  const dados = {
    nome: document.getElementById('pf-nome').value.trim(),
    cargo: document.getElementById('pf-cargo').value.trim(),
    departamento: document.getElementById('pf-departamento').value.trim()
  };

  await usersApi.updateProfile(dados);
  setUser({ ...user, ...dados });
  showToast('Perfil atualizado!', 'success');
};

window.salvarSenha = async function() {
  const nova = document.getElementById('pf-senha-nova').value;
  const confirmar = document.getElementById('pf-senha-confirmar').value;

  if (nova !== confirmar) {
    showToast('As senhas não coincidem.', 'error');
    return;
  }

  await usersApi.updateProfile({ senha: nova });
  showToast('Senha alterada com sucesso!', 'success');
};

async function carregarAvaliacoes() {
  const res = await reportsApi.user(user.id);
  renderAvaliacoes(res.data.avaliacoesRecebidas.lista);
}
```

---

### 9.7. Relatórios (pages/relatorios.html)

**Estrutura com tabs (baseado em permissão):**

**Tab "Dashboard" (gestor/admin):**
- Cards de stats:
  - Total de usuários
  - Total de gestores
  - Total de colaboradores
  - Total de avaliações
  - Média geral
  - Total Nine Box
- Grid de distribuição Nine Box (3x3)

**Tab "Por Usuário" (gestor/admin):**
- Select de usuário
- Botão "Ver Relatório"
- Exibe:
  - Dados do usuário
  - Stats (avaliações recebidas, média, avaliações feitas)
  - Posição Nine Box
  - Lista de avaliações recebidas
  - Botão exportar

**Tab "Meu Relatório" (todos):**
- Mesmo formato do relatório por usuário
- Carrega automaticamente o usuário logado

**Lógica:**
```javascript
import { requireAuth, getUser, isGestorOrAdmin } from '../js/auth.js';
import { usersApi, reportsApi } from '../js/api.js';

requireAuth();

const user = getUser();

// Montar tabs conforme permissão
const tabs = [];
if (isGestorOrAdmin()) {
  tabs.push({ id: 'dashboard', label: 'Dashboard' });
  tabs.push({ id: 'usuario', label: 'Por Usuário' });
}
tabs.push({ id: 'meu', label: 'Meu Relatório' });

async function carregarDashboard() {
  const res = await reportsApi.dashboard();
  renderDashboard(res.data);
}

window.carregarRelatorioUsuario = async function() {
  const userId = document.getElementById('sel-usuario').value;
  const res = await reportsApi.user(userId);
  renderRelatorioUsuario(res.data);
};

async function carregarMeuRelatorio() {
  const res = await reportsApi.user(user.id);
  renderRelatorioUsuario(res.data, true);
}

window.exportarRelatorio = async function(userId) {
  const res = await reportsApi.export(userId);
  // Criar blob e download
  const blob = new Blob([JSON.stringify(res.data, null, 2)], 
    { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `relatorio-${userId}-${Date.now()}.json`;
  a.click();
};
```

---

### 9.8. Avaliação 180° (pages/avaliacao-180.html)

**Objetivo:**
Sistema de avaliação 180° onde gestores avaliam colaboradores de forma estruturada, vinculando avaliados e competências específicas.

**Estrutura em 2 telas:**

**Tela 1: Lista de Avaliações 180°**
- Header com título e botão "Nova Avaliação" (apenas gestor/admin)
- Cards de avaliações existentes com:
  - Ícone de avaliação 180°
  - Nome do avaliado
  - Tipo e data
  - Badges (180°, Média, Anônima)
- Estado vazio quando não há avaliações

**Tela 2: Formulário de Criação/Edição**
- **Resumo da avaliação:**
  - Nome da avaliação
  - Empresa
  - Gestor responsável (select)
  - Setor
  - Datas de início e fim
  - Descrição

- **Avaliados:**
  - Botão "Adicionar" abre modal com lista de colaboradores
  - Checkbox para selecionar múltiplos avaliados
  - Lista de avaliados selecionados com opção de remover

- **Competências avaliadas:**
  - Botão "Adicionar" abre modal com lista de competências
  - Busca por nome/descrição
  - Lista de competências selecionadas com opção de remover

- **Ações:**
  - Botão "Voltar"
  - Botão "Criar Avaliação" / "Salvar Alterações"

**Modais:**

**Modal de Avaliados:**
- Barra de seleção com "Selecionar Todos"
- Lista de colaboradores com:
  - Avatar
  - Nome
  - RA
  - Checkbox
- Botões "Cancelar" e "Confirmar"

**Modal de Competências:**
- Campo de busca
- Lista de competências com:
  - Ícone
  - Nome
  - Tipo (badge)
  - Descrição
  - Checkbox
- Botões "Cancelar" e "Confirmar"

**Lógica:**
```javascript
import { requireAuth, isGestorOrAdmin, getUser } from '../js/auth.js';
import { usersApi, evaluationsApi, competenciesApi } from '../js/api.js';
import { showToast } from '../js/components/toast.js';

requireAuth();

const user = getUser();
let editandoId = null;
let avaliados180 = [];
let avaliadosSelecionados = [];
let competenciasSelecionadas = [];
let todosColaboradores = [];
let todasCompetencias = [];

// Oculta botão nova para colaboradores
if (!isGestorOrAdmin()) {
  document.getElementById('btn-nova-180').style.display = 'none';
}

// Carrega dados necessários
async function init() {
  try {
    const [resUsers, resComps] = await Promise.all([
      usersApi.list({ tipo: 'colaborador', limit: 200 }),
      competenciesApi.list({ limit: 100 })
    ]);
    todosColaboradores = resUsers.data.users;
    todasCompetencias = resComps.data.competencies;
  } catch {}

  // Carrega gestores para o select
  try {
    const resGestores = await usersApi.list({ tipo: 'gestor', limit: 100 });
    const sel = document.getElementById('r180-gestor');
    sel.innerHTML = '<option value="">Selecione o gestor...</option>' +
      resGestores.data.users.map(g => 
        `<option value="${g.id}">${g.nome}</option>`
      ).join('');
  } catch {}

  // Carrega avaliações 180 existentes
  try {
    const res = await evaluationsApi.list({ 
      tipoAvaliacao: 'avaliacao_180', 
      limit: 100 
    });
    avaliados180 = res.data.evaluations;
  } catch {}

  renderLista();
}

// Salvar: cria uma avaliação 180 para cada avaliado
window.salvarAvaliacao180 = async function() {
  const nome = document.getElementById('r180-nome').value.trim();
  const empresa = document.getElementById('r180-empresa').value.trim();
  const gestorId = document.getElementById('r180-gestor').value;

  if (!nome) { 
    showToast('Digite o nome da avaliação.', 'error'); 
    return; 
  }
  if (!empresa) { 
    showToast('Digite o nome da empresa.', 'error'); 
    return; 
  }
  if (!avaliadosSelecionados.length) { 
    showToast('Adicione pelo menos um avaliado.', 'error'); 
    return; 
  }

  const btn = document.getElementById('btn-salvar-180');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

  try {
    // Cria uma avaliação 180 para cada avaliado selecionado
    const promises = avaliadosSelecionados.map(avaliado =>
      evaluationsApi.create({
        avaliadoId: avaliado.id,
        criterios: { 
          pontualidade: 0, 
          comunicacao: 0, 
          tecnico: 0, 
          proatividade: 0, 
          equipe: 0 
        },
        comentario: `Avaliação 180° — ${nome} — ${empresa}`,
        anonima: true,
        tipoAvaliacao: 'avaliacao_180',
      })
    );
    await Promise.all(promises);
    showToast(
      `Avaliação 180° criada para ${avaliadosSelecionados.length} avaliado(s)!`, 
      'success'
    );
    fecharFormulario();
    await init();
  } catch {}
  finally { 
    btn.disabled = false; 
    btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> ' +
      '<span id="r180-btn-texto">Criar Avaliação</span>'; 
  }
};

init();
```

**CSS específico:** `avaliacao-180.css`

**Regras de permissão:**
- Apenas `gestor` e `admin` podem criar avaliações 180°
- `colaborador` pode apenas visualizar avaliações que o envolvem
- Botão "Nova Avaliação" oculto para colaboradores

---

### 9.9. Avaliação 360° (pages/avaliacao-360.html)

**Objetivo:**
Sistema de avaliação 360° exclusivo para administradores, permitindo avaliar qualquer usuário (gestor ou colaborador) com critérios completos e anonimato.

**Estrutura em 3 etapas:**

**Etapa 1: Seleção do Tipo**
- Card "Avaliar Gestor"
- Card "Avaliar Colaborador"
- Card "Ver Histórico 360°"
- Informação destacada: "Avaliação 360° — Exclusiva para administradores"

**Etapa 2: Formulário de Avaliação**
- Select de quem avaliar (filtrado por tipo selecionado)
- Critérios com estrelas (1-5):
  - Pontualidade
  - Comunicação
  - Desempenho Técnico
  - Proatividade
  - Trabalho em Equipe
- Média geral calculada automaticamente
- Comentário opcional
- Histórico lateral com avaliações 360° recentes
- Botões "Voltar" e "Enviar Avaliação 360°"

**Etapa 3: Histórico Completo**
- Lista todas as avaliações 360° do sistema
- Exibe:
  - Nome do avaliado
  - Badge "360°"
  - Badge "Anônima"
  - Data
  - Critérios avaliados com estrelas
  - Média geral
  - Comentário
- Botão "Voltar"

**Lógica:**
```javascript
import { requireRole, getUser } from '../js/auth.js';
import { usersApi, evaluationsApi } from '../js/api.js';
import { showToast } from '../js/components/toast.js';

// 360° é exclusiva para admin
requireRole('admin');

const user = getUser();
const notas = { 
  pontualidade: 0, 
  comunicacao: 0, 
  tecnico: 0, 
  proatividade: 0, 
  equipe: 0 
};
let tipoSelecionado = null;
let avaliacoes360 = [];

window.selecionarTipo360 = function(tipo) {
  tipoSelecionado = tipo;
  document.querySelectorAll('.av-tipo-card').forEach(c => 
    c.classList.toggle('selected', c.dataset.tipo === tipo)
  );
  document.getElementById('btn-proximo-360').disabled = false;
};

window.irParaFormulario360 = async function() {
  if (!tipoSelecionado) return;
  
  if (tipoSelecionado === 'historico') {
    document.getElementById('step-tipo').style.display = 'none';
    document.getElementById('step-historico').style.display = 'flex';
    carregarHistorico360Full();
    return;
  }
  
  document.getElementById('step-tipo').style.display = 'none';
  document.getElementById('step-form').style.display = 'block';

  const label = document.getElementById('av360-avaliado-label');
  label.textContent = tipoSelecionado === 'gestor' 
    ? 'Gestor a avaliar' 
    : 'Colaborador a avaliar';

  // Carrega usuários do tipo selecionado
  const select = document.getElementById('av360-avaliado');
  select.innerHTML = '<option value="">Carregando...</option>';
  
  try {
    const res = await usersApi.list({ 
      tipo: tipoSelecionado, 
      limit: 200 
    });
    const users = res.data.users.filter(u => u.id !== user.id);
    
    if (!users.length) { 
      select.innerHTML = 
        `<option value="">Nenhum ${tipoSelecionado} disponível</option>`; 
      return; 
    }
    
    select.innerHTML = '<option value="">Selecione...</option>' +
      users.map(u => 
        `<option value="${u.id}">${u.nome} (RA: ${u.ra})</option>`
      ).join('');
  } catch { 
    select.innerHTML = '<option value="">Erro ao carregar</option>'; 
  }

  initStars();
  carregarHistorico360();
};

window.enviarAvaliacao360 = async function() {
  const avaliadoId = document.getElementById('av360-avaliado').value;
  const comentario = document.getElementById('comentario-360').value.trim();
  
  if (!avaliadoId) { 
    showToast('Selecione quem será avaliado.', 'error'); 
    return; 
  }
  
  if (!Object.values(notas).some(v => v > 0)) { 
    showToast('Avalie pelo menos um critério.', 'error'); 
    return; 
  }

  const btn = document.getElementById('btn-submit-360');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
  
  try {
    await evaluationsApi.create({ 
      avaliadoId, 
      criterios: {...notas}, 
      comentario: comentario || null, 
      anonima: true 
    });
    showToast('Avaliação 360° enviada com sucesso!', 'success');
    
    // Limpar formulário
    Object.keys(notas).forEach(k => notas[k] = 0);
    document.querySelectorAll('.stars span').forEach(s => 
      s.classList.remove('active')
    );
    document.getElementById('av360-avaliado').value = '';
    document.getElementById('comentario-360').value = '';
    document.getElementById('media-box-360').style.display = 'none';
    
    carregarHistorico360();
  } catch {}
  finally { 
    btn.disabled = false; 
    btn.innerHTML = 
      '<i class="fa-solid fa-paper-plane"></i> Enviar Avaliação 360°'; 
  }
};

async function carregarHistorico360() {
  const container = document.getElementById('historico-360');
  container.innerHTML = '<p class="av-empty">Carregando...</p>';
  
  try {
    const res = await evaluationsApi.list({ 
      tipoAvaliacao: 'avaliacao_360', 
      limit: 50 
    });
    avaliacoes360 = res.data.evaluations;
    renderHistorico(avaliacoes360, container);
  } catch { 
    container.innerHTML = '<p class="av-empty">Erro ao carregar.</p>'; 
  }
}
```

**CSS específico:** `avaliacoes.css` (reutiliza estilos da página de avaliações)

**Regras de permissão:**
- **EXCLUSIVO para `admin`**
- Admin pode avaliar qualquer usuário (gestor ou colaborador)
- Avaliações são sempre anônimas
- O avaliador não é revelado ao avaliado
- Tipo de avaliação é automaticamente definido como `avaliacao_360`

**Diferenças entre 180° e 360°:**
- **180°**: Gestor avalia colaborador de forma estruturada com competências
- **360°**: Admin avalia qualquer usuário com critérios completos
- **180°**: Pode vincular múltiplos avaliados e competências
- **360°**: Avalia um usuário por vez com critérios fixos

---

## Padrões obrigatórios de implementação

### Loading state

Toda action assíncrona relevante precisa:

1. mostrar loading
2. desabilitar botão de envio quando fizer sentido
3. ocultar loading no `finally`

```javascript
async function salvar() {
  try {
    loading.show('Salvando...');
    btnSalvar.disabled = true;
    await api.createEvaluation(payload);
    toast.success('Avaliação criada com sucesso!');
  } catch (error) {
    toast.error(error.message);
  } finally {
    loading.hide();
    btnSalvar.disabled = false;
  }
}
```

### Tratamento de erro

Toda página deve tratar:

- backend offline → `Não foi possível conectar ao backend.`
- `401` sessão expirada → logout automático + redirect para login
- `403` sem permissão → `Você não tem permissão para acessar esta página.`
- validação inválida → exibir mensagem do backend
- erro inesperado → mensagem genérica amigável

### Sessão expirada

Se a API retornar `401`:

- limpar sessão
- redirecionar para login
- avisar o usuário com toast

---

## Checklist de reescrita do legado

- [ ] remover uso de `professor` no JS/HTML/CSS
- [ ] remover uso de `estagiario` no JS/HTML/CSS
- [ ] remover dependência de `disciplina`
- [ ] adicionar campo `RA` nas telas necessárias (cadastro, consulta)
- [ ] trocar renderização baseada em `localStorage` por API
- [ ] aplicar `auth.requireAuth()` nas telas privadas
- [ ] aplicar `auth.requireAdmin()` nas telas administrativas (cadastro, exclusão)
- [ ] aplicar `auth.requireGestorOrAdmin()` nas telas estratégicas (dashboard, Nine Box)
- [ ] conectar dashboard com `GET /api/reports/dashboard`
- [ ] conectar perfil com `GET /api/users/profile` e `PUT /api/users/profile`
- [ ] conectar avaliações com `/api/evaluations`
- [ ] conectar Nine Box com `/api/evaluations/nine-box`
- [ ] conectar competências com `/api/competencies`
- [ ] garantir que `avaliadorId` nunca aparece para usuário comum
- [ ] garantir que tipo de avaliação é derivado do contexto, não digitado pelo usuário
- [ ] implementar página de avaliação 180° (gestor/admin → colaborador)
- [ ] implementar página de avaliação 360° (admin → qualquer usuário)
- [ ] criar CSS específico para avaliação 180° (`avaliacao-180.css`)
- [ ] criar CSS específico para responder 180° (`responder-180.css`)
- [ ] adicionar links para 180° e 360° no submenu de Avaliações da navbar

---

## Critérios de aceite

- não existe mais fluxo principal alimentado por arrays mock em `localStorage`
- cadastro envia `ra` obrigatoriamente
- frontend inteiro usa `gestor`, `colaborador` e `admin`
- telas respeitam permissão por perfil
- login é obrigatório nas páginas privadas
- dashboard usa dados reais da API
- perfil usa dados reais da API
- avaliações usam o backend anônimo e bidirecional
- `avaliadorId` não aparece para usuário comum
- feedback visual de loading e erro está presente nas principais operações
- Nine Box só pode ser criado por `gestor` ou `admin`
- competências só podem ser criadas/editadas/deletadas por `admin`

---

## Handoff esperado

Quando este trabalho acabar, o frontend deve estar pronto para operar com o backend sem camada fake local.

Se ainda existir alguma tela antiga dependente de arrays mock, ela deve ser tratada como pendência e não como comportamento válido do sistema.
