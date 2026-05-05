# ESTAGIÁRIO FRONTEND 1 - Infraestrutura, Autenticação e Componentes Base

## Missão

Você vai criar toda a **infraestrutura base do frontend** para que o Estagiário 2 possa integrar as páginas de negócio com o backend.

Seu trabalho cobre:

1. **Módulos JavaScript base** (config, api, auth, validators, components)
2. **Sistema de autenticação** com JWT
3. **Página de login** completa
4. **Componentes reutilizáveis** (loading, toast, navbar)
5. **Estilos globais** e design system

---

## Terminologia obrigatória

O sistema usa os seguintes termos. **Nunca use os termos antigos**.

| ❌ Antigo       | ✅ Correto      |
|----------------|----------------|
| `estagiario`   | `colaborador`  |
| `professor`    | `gestor`       |
| `disciplina`   | `cargo` ou `departamento` |

Isso vale para variáveis, labels, comentários, payloads, filtros e qualquer texto visível ao usuário.

---

## Estrutura que você vai criar

```
frontend/
├── css/
│   └── style.css (já existe, você vai revisar/completar)
├── js/
│   ├── config.js          ← CRIAR
│   ├── api.js             ← CRIAR
│   ├── auth.js            ← CRIAR
│   ├── validators.js      ← CRIAR
│   ├── navbar.js          ← CRIAR
│   └── components/
│       ├── loading.js     ← CRIAR
│       └── toast.js       ← CRIAR
└── pages/
    └── login.html         ← CRIAR
```

---

## Contrato oficial com o backend

### Base URL

```javascript
http://localhost:3000/api
```

### Endpoints mínimos que você precisa suportar

#### Usuários
- `POST /api/users/login` - Login (retorna token + user)
- `POST /api/users/register` - Cadastro
- `GET /api/users/profile` - Perfil do usuário logado
- `PUT /api/users/profile` - Atualizar perfil
- `GET /api/users` - Listar usuários (com filtros)
- `GET /api/users/:id` - Buscar por ID
- `GET /api/users/ra/:ra` - Buscar por RA
- `DELETE /api/users/:id` - Deletar usuário

#### Avaliações
- `POST /api/evaluations` - Criar avaliação
- `GET /api/evaluations` - Listar avaliações
- `GET /api/evaluations/:id` - Buscar avaliação
- `GET /api/evaluations/avaliado/:id` - Avaliações de um usuário
- `GET /api/evaluations/stats/avaliado/:id` - Estatísticas
- `PUT /api/evaluations/:id` - Atualizar
- `DELETE /api/evaluations/:id` - Deletar

#### Nine Box
- `POST /api/evaluations/nine-box` - Criar posição
- `GET /api/evaluations/nine-box` - Listar
- `GET /api/evaluations/nine-box/:id` - Buscar
- `GET /api/evaluations/nine-box/pessoa/:id` - Por pessoa
- `GET /api/evaluations/nine-box/pessoa/:id/latest` - Última posição
- `GET /api/evaluations/nine-box/stats/distribution` - Distribuição
- `PUT /api/evaluations/nine-box/:id` - Atualizar
- `DELETE /api/evaluations/nine-box/:id` - Deletar

#### Competências
- `POST /api/competencies` - Criar
- `GET /api/competencies` - Listar
- `GET /api/competencies/:id` - Buscar
- `PUT /api/competencies/:id` - Atualizar
- `DELETE /api/competencies/:id` - Deletar

#### Relatórios
- `GET /api/reports/dashboard` - Dashboard geral
- `GET /api/reports/user/:id` - Relatório de usuário
- `GET /api/reports/team/:id` - Relatório de equipe
- `GET /api/reports/export/:id` - Exportar relatório

---

## Regras de negócio que a base já deve respeitar

### Terminologia correta

Troque qualquer ocorrência de:
- `estagiario` → `colaborador`
- `professor` → `gestor`
- `disciplina` → `cargo` ou `departamento`

### RA (Registro Acadêmico)

- RA é **obrigatório** no cadastro
- RA pertence à pessoa; o sistema **não gera** RA
- No backend o campo é `string`
- Validação: **5 a 10 caracteres** alfanuméricos

### Email

- O backend aceita email válido via `Joi.string().email()`
- Use validação de formato real de email no frontend
- Não trave o frontend em um único domínio
- Exemplos do projeto usam `@eniac.edu.br` (apenas para placeholders)

### Sessão

- `localStorage` pode guardar apenas sessão mínima:
  - token JWT
  - usuário autenticado
- `localStorage` **não pode** ser a fonte de verdade para usuários, avaliações, Nine Box ou dashboard

---

## 1. config.js — Configurações globais

Crie `js/config.js`:

```javascript
// =============================================
// CONFIG.JS — Configurações globais da aplicação
// =============================================

const CONFIG = {
  API_BASE_URL: 'http://localhost:3000/api',
  TOKEN_KEY: 'portal_token',
  USER_KEY: 'portal_user',
  DARK_MODE_KEY: 'darkMode',
};

export default CONFIG;
```

---

## 2. api.js — Client HTTP centralizado

Crie `js/api.js`:

```javascript
// =============================================
// API.JS — Client HTTP centralizado
// =============================================

import CONFIG from './config.js';
import { getToken, logout } from './auth.js';
import { showToast } from './components/toast.js';
import { showLoading, hideLoading } from './components/loading.js';

/**
 * Faz uma requisição HTTP para a API.
 * @param {string} endpoint - Caminho relativo (ex: '/users/login')
 * @param {object} options  - Opções do fetch (method, body, etc.)
 * @param {boolean} silent  - Se true, não exibe loading/toast de erro
 */
async function request(endpoint, options = {}, silent = false) {
  const url = \`\${CONFIG.API_BASE_URL}\${endpoint}\`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
    ...(options.headers || {}),
  };

  if (!silent) showLoading();

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      // Token expirado ou inválido → logout automático
      if (response.status === 401) {
        logout();
        return;
      }

      const msg = data.message || 'Erro na requisição';
      if (!silent) showToast(msg, 'error');
      throw new Error(msg);
    }

    return data;
  } catch (err) {
    if (!silent && !(err instanceof TypeError)) {
      // TypeError = falha de rede (servidor offline)
    }
    if (err instanceof TypeError) {
      if (!silent) showToast('Servidor indisponível. Verifique se o backend está rodando.', 'error');
    }
    throw err;
  } finally {
    if (!silent) hideLoading();
  }
}

// =============================================
// HELPERS DE MÉTODO
// =============================================
const api = {
  get:    (endpoint, silent)       => request(endpoint, { method: 'GET' }, silent),
  post:   (endpoint, body, silent) => request(endpoint, { method: 'POST', body }, silent),
  put:    (endpoint, body, silent) => request(endpoint, { method: 'PUT', body }, silent),
  delete: (endpoint, silent)       => request(endpoint, { method: 'DELETE' }, silent),
};

// =============================================
// ENDPOINTS — USUÁRIOS
// =============================================
export const usersApi = {
  login:         (body)   => api.post('/users/login', body),
  register:      (body)   => api.post('/users/register', body),
  getProfile:    ()       => api.get('/users/profile'),
  updateProfile: (body)   => api.put('/users/profile', body),
  list:          (params) => api.get(\`/users\${buildQuery(params)}\`),
  getById:       (id)     => api.get(\`/users/\${id}\`),
  getByRA:       (ra)     => api.get(\`/users/ra/\${ra}\`),
  delete:        (id)     => api.delete(\`/users/\${id}\`),
};

// =============================================
// ENDPOINTS — AVALIAÇÕES
// =============================================
export const evaluationsApi = {
  create:          (body)   => api.post('/evaluations', body),
  list:            (params) => api.get(\`/evaluations\${buildQuery(params)}\`),
  getById:         (id)     => api.get(\`/evaluations/\${id}\`),
  getByAvaliado:   (id, p)  => api.get(\`/evaluations/avaliado/\${id}\${buildQuery(p)}\`),
  getStats:        (id)     => api.get(\`/evaluations/stats/avaliado/\${id}\`),
  update:          (id, b)  => api.put(\`/evaluations/\${id}\`, b),
  delete:          (id)     => api.delete(\`/evaluations/\${id}\`),
};

// =============================================
// ENDPOINTS — NINE BOX
// =============================================
export const nineBoxApi = {
  create:          (body)   => api.post('/evaluations/nine-box', body),
  list:            (params) => api.get(\`/evaluations/nine-box\${buildQuery(params)}\`),
  getById:         (id)     => api.get(\`/evaluations/nine-box/\${id}\`),
  getByPessoa:     (id)     => api.get(\`/evaluations/nine-box/pessoa/\${id}\`),
  getLatest:       (id)     => api.get(\`/evaluations/nine-box/pessoa/\${id}/latest\`),
  getDistribution: ()       => api.get('/evaluations/nine-box/stats/distribution'),
  update:          (id, b)  => api.put(\`/evaluations/nine-box/\${id}\`, b),
  delete:          (id)     => api.delete(\`/evaluations/nine-box/\${id}\`),
};

// =============================================
// ENDPOINTS — COMPETÊNCIAS
// =============================================
export const competenciesApi = {
  create:   (body)   => api.post('/competencies', body),
  list:     (params) => api.get(\`/competencies\${buildQuery(params)}\`),
  getById:  (id)     => api.get(\`/competencies/\${id}\`),
  update:   (id, b)  => api.put(\`/competencies/\${id}\`, b),
  delete:   (id)     => api.delete(\`/competencies/\${id}\`),
};

// =============================================
// ENDPOINTS — RELATÓRIOS
// =============================================
export const reportsApi = {
  dashboard:  ()   => api.get('/reports/dashboard'),
  user:       (id) => api.get(\`/reports/user/\${id}\`),
  team:       (id) => api.get(\`/reports/team/\${id}\`),
  export:     (id) => api.get(\`/reports/export/\${id}\`),
};

// =============================================
// HELPER — monta query string
// =============================================
function buildQuery(params) {
  if (!params) return '';
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString();
  return qs ? \`?\${qs}\` : '';
}

export default api;
```

---

## 3. auth.js — Autenticação com JWT

Crie `js/auth.js`:


```javascript
// =============================================
// AUTH.JS — Autenticação com JWT
// =============================================

import CONFIG from './config.js';

// =============================================
// TOKEN
// =============================================
export function getToken() {
  return localStorage.getItem(CONFIG.TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(CONFIG.TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(CONFIG.TOKEN_KEY);
}

// =============================================
// USUÁRIO LOGADO
// =============================================
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
}

export function removeUser() {
  localStorage.removeItem(CONFIG.USER_KEY);
}

// =============================================
// SESSÃO
// =============================================
export function isLoggedIn() {
  return !!getToken();
}

export function logout() {
  removeToken();
  removeUser();
  window.location.href = '/pages/login.html';
}

// =============================================
// PERMISSÕES
// =============================================
export function isAdmin() {
  return getUser()?.tipo === 'admin';
}

export function isGestor() {
  return getUser()?.tipo === 'gestor';
}

export function isColaborador() {
  return getUser()?.tipo === 'colaborador';
}

export function isGestorOrAdmin() {
  const tipo = getUser()?.tipo;
  return tipo === 'gestor' || tipo === 'admin';
}

// =============================================
// PROTEÇÃO DE ROTAS
// =============================================

/**
 * Redireciona para login se não estiver autenticado.
 * Chame no início de cada página protegida.
 */
export function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = '/pages/login.html';
    return false;
  }
  return true;
}

/**
 * Redireciona para index se não tiver a permissão necessária.
 * @param {'admin'|'gestor'|'colaborador'|'gestorOrAdmin'} role
 */
export function requireRole(role) {
  if (!requireAuth()) return false;

  const tipo = getUser()?.tipo;
  const allowed = {
    admin:         tipo === 'admin',
    gestor:        tipo === 'gestor',
    colaborador:   tipo === 'colaborador',
    gestorOrAdmin: tipo === 'gestor' || tipo === 'admin',
  };

  if (!allowed[role]) {
    window.location.href = '/index.html';
    return false;
  }
  return true;
}

/**
 * Atualiza o header com os dados do usuário logado.
 * Chame após requireAuth() em cada página.
 */
export function updateHeaderUser() {
  const user = getUser();
  if (!user) return;

  const nomeEl   = document.getElementById('user-dropdown-nome');
  const tipoEl   = document.getElementById('user-dropdown-tipo');
  const avatarEl = document.getElementById('user-dropdown-avatar');
  const sairBtn  = document.getElementById('btn-sair-header');

  if (nomeEl)  nomeEl.textContent  = user.nome || 'Usuário';
  if (tipoEl)  tipoEl.textContent  = tipoLabel(user.tipo);
  if (sairBtn) sairBtn.style.display = 'flex';

  if (avatarEl) {
    if (user.foto) {
      avatarEl.innerHTML = `<img src="${user.foto}" alt="${user.nome}">`;
    } else {
      const iniciais = (user.nome || 'U').split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
      avatarEl.innerHTML = `<span>${iniciais}</span>`;
    }
  }
}

export function sairDaConta() {
  logout();
}

export function toggleUserMenu() {
  document.getElementById('user-dropdown')?.classList.toggle('open');
}

// Fechar dropdown ao clicar fora
document.addEventListener('click', (e) => {
  if (!e.target.closest('#user-menu')) {
    document.getElementById('user-dropdown')?.classList.remove('open');
  }
});

// =============================================
// HELPERS
// =============================================
export function tipoLabel(tipo) {
  const labels = { admin: 'Administrador', gestor: 'Gestor', colaborador: 'Colaborador' };
  return labels[tipo] || tipo;
}
```

---

## 4. validators.js — Validações reutilizáveis

Crie `js/validators.js`:

```javascript
// =============================================
// VALIDATORS.JS — Validações reutilizáveis
// =============================================

/**
 * Valida e-mail (qualquer domínio válido)
 */
export function isValidEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(email.trim());
}

/**
 * Valida RA: 5 a 10 caracteres alfanuméricos
 */
export function isValidRA(ra) {
  const trimmed = ra.trim();
  return trimmed.length >= 5 && trimmed.length <= 10;
}

/**
 * Valida nome: mínimo 3 caracteres
 */
export function isValidNome(nome) {
  return nome.trim().length >= 3;
}

/**
 * Valida senha: mínimo 6 caracteres
 */
export function isValidSenha(senha) {
  return senha.length >= 6;
}

/**
 * Valida comentário de avaliação: mínimo 20 caracteres
 */
export function isValidComentario(texto) {
  return texto.trim().length >= 20;
}

/**
 * Exibe mensagem de erro inline em um campo.
 * @param {string} fieldId - ID do input
 * @param {string} msg     - Mensagem de erro (vazio para limpar)
 */
export function setFieldError(fieldId, msg) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  // Remove erro anterior
  const prev = field.parentElement.querySelector('.field-error');
  if (prev) prev.remove();
  field.classList.remove('field-invalid');

  if (msg) {
    field.classList.add('field-invalid');
    const span = document.createElement('span');
    span.className = 'field-error';
    span.textContent = msg;
    field.parentElement.appendChild(span);
  }
}

/**
 * Limpa todos os erros de um formulário.
 * @param {string} formId - ID do form
 */
export function clearFormErrors(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.querySelectorAll('.field-error').forEach(el => el.remove());
  form.querySelectorAll('.field-invalid').forEach(el => el.classList.remove('field-invalid'));
}

/**
 * Valida o formulário de cadastro de usuário.
 * Retorna true se válido, false se inválido (e exibe erros inline).
 */
export function validateCadastroForm({ ra, nome, email, senha, tipo }) {
  let valid = true;

  if (!isValidRA(ra)) {
    setFieldError('cad-ra', 'RA deve ter entre 5 e 10 caracteres');
    valid = false;
  } else {
    setFieldError('cad-ra', '');
  }

  if (!isValidNome(nome)) {
    setFieldError('cad-nome', 'Nome deve ter pelo menos 3 caracteres');
    valid = false;
  } else {
    setFieldError('cad-nome', '');
  }

  if (!isValidEmail(email)) {
    setFieldError('cad-email', 'Use um e-mail válido');
    valid = false;
  } else {
    setFieldError('cad-email', '');
  }

  if (!isValidSenha(senha)) {
    setFieldError('cad-senha', 'Senha deve ter pelo menos 6 caracteres');
    valid = false;
  } else {
    setFieldError('cad-senha', '');
  }

  if (!tipo) {
    setFieldError('cad-tipo', 'Selecione o tipo de usuário');
    valid = false;
  } else {
    setFieldError('cad-tipo', '');
  }

  return valid;
}

/**
 * Valida o formulário de login.
 */
export function validateLoginForm({ email, senha }) {
  let valid = true;

  if (!isValidEmail(email)) {
    setFieldError('login-email', 'Use um e-mail válido');
    valid = false;
  } else {
    setFieldError('login-email', '');
  }

  if (!senha) {
    setFieldError('login-senha', 'Digite sua senha');
    valid = false;
  } else {
    setFieldError('login-senha', '');
  }

  return valid;
}
```

---

## 5. components/loading.js — Spinner global

Crie `js/components/loading.js`:

```javascript
// =============================================
// LOADING.JS — Spinner global de carregamento
// =============================================

let loadingCount = 0;

export function showLoading() {
  loadingCount++;
  let overlay = document.getElementById('loading-overlay');

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  overlay.classList.add('active');
}

export function hideLoading() {
  loadingCount = Math.max(0, loadingCount - 1);
  if (loadingCount === 0) {
    document.getElementById('loading-overlay')?.classList.remove('active');
  }
}
```

---

## 6. components/toast.js — Notificações

Crie `js/components/toast.js`:

```javascript
// =============================================
// TOAST.JS — Notificações visuais
// =============================================

let toastTimer = null;

/**
 * Exibe uma notificação toast.
 * @param {string} msg   - Mensagem
 * @param {'success'|'error'|'info'|'warning'} type
 * @param {number} duration - Duração em ms (padrão 3000)
 */
export function showToast(msg, type = 'success', duration = 3000) {
  let toast = document.getElementById('toast-global');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-global';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  // Ícones por tipo
  const icons = {
    success: '<i class="fa-solid fa-circle-check"></i>',
    error:   '<i class="fa-solid fa-circle-xmark"></i>',
    info:    '<i class="fa-solid fa-circle-info"></i>',
    warning: '<i class="fa-solid fa-triangle-exclamation"></i>',
  };

  toast.innerHTML = `${icons[type] || ''} ${msg}`;
  toast.className = `toast ${type} show`;

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// Expõe globalmente para uso em HTML inline (onclick="...")
window.showToast = showToast;
```

---

## 7. navbar.js — Navegação e dark mode

Crie `js/navbar.js`:

```javascript
// =============================================
// NAVBAR.JS — Navegação, dark mode, usuário logado
// =============================================

import { getUser, sairDaConta, toggleUserMenu, updateHeaderUser, isAdmin, isGestorOrAdmin } from './auth.js';

// ---- SUBMENU TOGGLE ----
window.toggleSubmenu = function(e, link) {
  e.preventDefault();
  const item = link.closest('.navbar-item-dropdown');
  if (!item) return;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.navbar-item-dropdown.open').forEach(el => {
    if (el !== item) el.classList.remove('open');
  });
  item.classList.toggle('open', !isOpen);
};

document.addEventListener('click', (e) => {
  if (!e.target.closest('.navbar-item-dropdown')) {
    document.querySelectorAll('.navbar-item-dropdown.open').forEach(el => el.classList.remove('open'));
  }
});

// ---- DARK MODE ----
function aplicarDarkMode(ativo) {
  document.body.classList.toggle('dark-mode', ativo);
  const btn = document.getElementById('dark-mode-btn');
  if (btn) {
    btn.innerHTML = ativo ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    btn.title = ativo ? 'Modo claro' : 'Modo escuro';
  }
}

window.toggleDarkMode = function() {
  const ativo = !document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', ativo ? '1' : '0');
  aplicarDarkMode(ativo);
};

// ---- CONTROLE DE VISIBILIDADE POR PERMISSÃO ----
function aplicarPermissoesNav() {
  const user = getUser();
  if (!user) return;

  // Cadastrar: apenas admin
  document.querySelectorAll('[data-role="admin"]').forEach(el => {
    el.style.display = isAdmin() ? '' : 'none';
  });

  // Consultar / Dashboard / Relatórios: gestor ou admin
  document.querySelectorAll('[data-role="gestorOrAdmin"]').forEach(el => {
    el.style.display = isGestorOrAdmin() ? '' : 'none';
  });
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  // Ativar link correto
  const page = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.navbar-link:not(.navbar-link-dropdown)').forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (!href) return;
    const hrefPage = href.split('/').pop();
    if ((page === 'index.html' || page === '') && (hrefPage === 'index.html' || href.includes('index.html'))) {
      link.classList.add('active');
    } else if (hrefPage && hrefPage !== 'index.html' && page === hrefPage) {
      link.classList.add('active');
    }
  });

  document.querySelectorAll('.navbar-submenu-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const hrefPage = href.split('/').pop();
    if (hrefPage && page === hrefPage) {
      link.classList.add('active');
      const parentItem = link.closest('.navbar-item-dropdown');
      if (parentItem) {
        parentItem.querySelector('.navbar-link-dropdown')?.classList.add('active');
      }
    }
  });

  // Usuário logado no header
  updateHeaderUser();
  aplicarPermissoesNav();

  // Dark mode
  const darkSalvo = localStorage.getItem('darkMode');
  if (darkSalvo === '1') {
    aplicarDarkMode(true);
  } else if (darkSalvo === null) {
    aplicarDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }
});

// Expõe funções usadas em HTML inline
window.sairDaConta = sairDaConta;
window.toggleUserMenu = toggleUserMenu;
```

**O que este módulo faz:**

- **Submenu toggle**: Abre/fecha submenus da navbar com controle de estado
- **Dark mode**: Persiste preferência no localStorage e aplica classe `.dark-mode` no body
- **Permissões**: Oculta links da navbar baseado no tipo do usuário (admin, gestor, colaborador)
- **Active link**: Marca o link ativo baseado na página atual
- **Integração com auth.js**: Usa funções de autenticação para controlar visibilidade

---

## 8. pages/login.html — Página de login completa

Crie `pages/login.html`:

```html
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login — Portal de Gestão de Pessoas</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <style>
    body { background: var(--bg); }
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .login-card {
      background: var(--surface);
      border-radius: var(--radius);
      box-shadow: var(--shadow-lg);
      padding: 40px 36px;
      width: 100%;
      max-width: 400px;
      border: 1.5px solid var(--border);
    }
    .login-logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      margin-bottom: 28px;
    }
    .login-logo i {
      font-size: 40px;
      color: var(--primary-light);
    }
    .login-logo h1 {
      font-size: 20px;
      font-weight: 700;
      color: var(--primary);
      text-align: center;
    }
    .login-logo p {
      font-size: 13px;
      color: var(--text-muted);
      text-align: center;
    }
    .login-field {
      margin-bottom: 16px;
    }
    .login-field label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: var(--primary);
      margin-bottom: 6px;
    }
    .login-field .input-wrap {
      position: relative;
    }
    .login-field .input-wrap i {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      font-size: 14px;
    }
    .login-field input {
      width: 100%;
      padding: 11px 14px 11px 38px;
      border-radius: var(--radius-sm);
      border: 1.5px solid var(--border);
      font-size: 14px;
      font-family: inherit;
      color: var(--text);
      background: #fafafa;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .login-field input:focus {
      border-color: var(--primary-light);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
      outline: none;
      background: var(--surface);
    }
    .login-btn {
      width: 100%;
      padding: 13px;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 15px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s;
      margin-top: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .login-btn:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(30, 58, 138, 0.25); }
    .login-info {
      margin-top: 20px;
      padding: 12px 14px;
      background: #eff6ff;
      border-radius: var(--radius-sm);
      border: 1px solid #bfdbfe;
      font-size: 12px;
      color: #1e40af;
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }
    .login-info i { margin-top: 1px; flex-shrink: 0; }
    body.dark-mode .login-card { background: #1e293b; }
    body.dark-mode .login-field input { background: #0f172a; color: #f1f5f9; border-color: #334155; }
    body.dark-mode .login-info { background: #1e3a5f; border-color: #1e40af; color: #93c5fd; }
  </style>
</head>
<body>

<div class="login-wrapper">
  <div class="login-card">
    <div class="login-logo">
      <i class="fa-solid fa-people-group"></i>
      <h1>Portal de Gestão de Pessoas</h1>
      <p>Acesse com seu e-mail institucional</p>
    </div>

    <div class="login-field">
      <label for="login-email">E-mail institucional</label>
      <div class="input-wrap">
        <i class="fa-solid fa-envelope"></i>
        <input type="email" id="login-email" placeholder="nome@faculdade.edu.br" autocomplete="email">
      </div>
      <!-- Erro inline injetado aqui pelo JS -->
    </div>

    <div class="login-field">
      <label for="login-senha">Senha</label>
      <div class="input-wrap">
        <i class="fa-solid fa-lock"></i>
        <input type="password" id="login-senha" placeholder="Sua senha" autocomplete="current-password">
      </div>
    </div>

    <button class="login-btn" id="btn-login" onclick="fazerLogin()">
      <i class="fa-solid fa-right-to-bracket"></i> Entrar
    </button>

    <div class="login-info">
      <i class="fa-solid fa-circle-info"></i>
      <span>Apenas usuários cadastrados pelo administrador podem acessar o sistema.</span>
    </div>
  </div>
</div>

<script type="module">
  import { usersApi } from '../js/api.js';
  import { setToken, setUser, isLoggedIn } from '../js/auth.js';
  import { validateLoginForm } from '../js/validators.js';
  import { showToast } from '../js/components/toast.js';

  // Se já logado, redireciona
  if (isLoggedIn()) {
    window.location.href = '../index.html';
  }

  window.fazerLogin = async function() {
    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value;

    if (!validateLoginForm({ email, senha })) return;

    const btn = document.getElementById('btn-login');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Entrando...';

    try {
      const res = await usersApi.login({ email, senha });
      setToken(res.data.token);
      setUser(res.data.user);
      window.location.href = '../index.html';
    } catch (err) {
      // Erro já exibido pelo api.js via toast
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Entrar';
    }
  };

  // Enter para logar
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') window.fazerLogin();
  });
</script>
</body>
</html>
```

**Características da página de login:**

- Design limpo e profissional com card centralizado
- Validação inline de campos (email e senha)
- Loading state no botão durante autenticação
- Redirecionamento automático se já estiver logado
- Suporte a dark mode
- Atalho Enter para fazer login
- Mensagem informativa sobre acesso restrito

---

## 9. CSS — Design system e estilos globais

O arquivo `css/style.css` já deve existir no projeto. Você precisa **revisar e completar** para garantir que ele contenha:

### Variáveis CSS (design tokens)

```css
:root {
  --primary: #1e3a8a;
  --primary-light: #3b82f6;
  --accent: #93c5fd;
  --bg: #eef4ff;
  --surface: #ffffff;
  --text: #1e293b;
  --text-muted: #64748b;
  --border: #e2e8f0;
  --danger: #dc2626;
  --success: #059669;
  --warning: #d97706;
  --shadow-sm: 0 2px 8px rgba(30, 58, 138, 0.07);
  --shadow-md: 0 8px 24px rgba(30, 58, 138, 0.10);
  --shadow-lg: 0 16px 40px rgba(30, 58, 138, 0.15);
  --radius: 18px;
  --radius-sm: 10px;
}
```

### Dark mode

```css
body.dark-mode {
  --primary: #60a5fa;
  --primary-light: #93c5fd;
  --bg: #0f172a;
  --surface: #1e293b;
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  --border: #334155;
  background: #0f172a;
}
```

### Componentes essenciais que devem estar no CSS

1. **Header e navbar** - Barra superior com logo e navegação
2. **User dropdown** - Menu do usuário logado
3. **Cards** - Cards do menu principal
4. **Forms** - Inputs, selects, textareas com estados de foco e erro
5. **Buttons** - Botões primários, secundários e de perigo
6. **Toast** - Notificações (success, error, info, warning)
7. **Loading overlay** - Spinner global
8. **Badges** - Tags de tipo de usuário (admin, gestor, colaborador)
9. **Empty state** - Estado vazio para listas
10. **Responsive** - Media queries para mobile

**Ação necessária:** Abra `css/style.css` e verifique se todos esses componentes estão implementados. Se faltar algo, adicione baseado no design system acima.

---

## 10. Checklist de entrega

Antes de passar o trabalho para o Estagiário 2, verifique:

### Estrutura de arquivos

- [ ] `js/config.js` criado
- [ ] `js/api.js` criado com todos os endpoints
- [ ] `js/auth.js` criado com funções de sessão e permissão
- [ ] `js/validators.js` criado com validações
- [ ] `js/components/loading.js` criado
- [ ] `js/components/toast.js` criado
- [ ] `js/navbar.js` criado
- [ ] `pages/login.html` criado e funcional
- [ ] `css/style.css` revisado e completo

### Funcionalidades

- [ ] Login funciona e salva token + user no localStorage
- [ ] Logout limpa sessão e redireciona para login
- [ ] Páginas protegidas redirecionam para login se não autenticado
- [ ] Dark mode funciona e persiste preferência
- [ ] Loading global aparece durante requisições
- [ ] Toast exibe mensagens de sucesso/erro
- [ ] Validações inline funcionam nos formulários
- [ ] Navbar oculta links baseado em permissões
- [ ] User dropdown exibe dados do usuário logado

### Terminologia

- [ ] Nenhum uso de `estagiario` no código
- [ ] Nenhum uso de `professor` no código
- [ ] Nenhum uso de `disciplina` no código
- [ ] Todos os termos corretos: `colaborador`, `gestor`, `cargo`, `departamento`

### Integração com backend

- [ ] API base URL configurada corretamente
- [ ] Todos os endpoints mapeados em `api.js`
- [ ] Tratamento de erro 401 (logout automático)
- [ ] Tratamento de erro de rede (servidor offline)
- [ ] Headers de autorização enviados corretamente

### Testes manuais

- [ ] Login com credenciais válidas funciona
- [ ] Login com credenciais inválidas exibe erro
- [ ] Logout funciona
- [ ] Dark mode alterna corretamente
- [ ] Validação de email aceita qualquer domínio válido
- [ ] Validação de RA aceita 5-10 caracteres
- [ ] Toast aparece e desaparece automaticamente
- [ ] Loading aparece durante requisições

---

## 11. Handoff para Estagiário 2

Quando você terminar, o Estagiário 2 terá:

✅ **Infraestrutura completa** para integrar páginas de negócio  
✅ **Sistema de autenticação** funcionando com JWT  
✅ **Client HTTP** centralizado com tratamento de erro  
✅ **Componentes reutilizáveis** (loading, toast, navbar)  
✅ **Design system** consistente com dark mode  
✅ **Validações** prontas para reutilizar  
✅ **Página de login** completa e funcional  

O Estagiário 2 vai focar em:

- Reescrever páginas de negócio (cadastrar, consultar, avaliacoes, etc.)
- Integrar com API real (substituir localStorage)
- Implementar CRUD completo de usuários
- Implementar sistema de avaliações anônimas
- Implementar Nine Box e competências
- Implementar dashboard e relatórios

---

## 12. Observações finais

### Sobre localStorage

`localStorage` deve ser usado **apenas** para:
- Token JWT (`portal_token`)
- Usuário logado (`portal_user`)
- Preferência de dark mode (`darkMode`)

**Nunca** use `localStorage` para:
- Listas de usuários
- Avaliações
- Nine Box
- Competências
- Qualquer dado de negócio

### Sobre validações

As validações do frontend são para **melhorar UX**, não substituem as validações do backend. O backend é sempre a fonte de verdade.

### Sobre permissões

As permissões do frontend são para **ocultar UI**, não substituem as permissões do backend. O backend sempre valida se o usuário pode executar a ação.

### Sobre erros

Sempre trate erros de forma amigável:
- Servidor offline → "Não foi possível conectar ao backend"
- 401 → Logout automático + redirect para login
- 403 → "Você não tem permissão"
- Validação → Exibir mensagem do backend
- Erro inesperado → "Ocorreu um erro. Tente novamente"

---

## Dúvidas frequentes

**P: Posso usar bibliotecas externas como Axios ou React?**  
R: Não. O projeto usa vanilla JavaScript com ES6 modules e fetch nativo.

**P: Posso mudar a estrutura de pastas?**  
R: Não. Siga exatamente a estrutura definida neste documento.

**P: Posso adicionar novos endpoints na API?**  
R: Não. Use apenas os endpoints documentados. Se precisar de algo novo, alinhe com o time de backend.

**P: Posso usar TypeScript?**  
R: Não. O projeto usa JavaScript puro.

**P: Posso usar CSS frameworks como Tailwind ou Bootstrap?**  
R: Não. O projeto usa CSS vanilla com variáveis CSS.

**P: O que fazer se o backend retornar um formato diferente do esperado?**  
R: Alinhe com o time de backend. O contrato da API deve ser respeitado por ambos os lados.

---

**Boa sorte! 🚀**