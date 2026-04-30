# 🎨 Frontend - Guia Completo

> **Stack**: HTML + CSS + JavaScript (Vanilla)

## 🚀 Início Rápido

```bash
# Rodar servidor local
npx serve .
# ou usar Live Server no VS Code
```

## 📁 Estrutura

```
frontend/
├── index.html          # Dashboard
├── perfil.html
├── pages/
│   ├── login.html      # CRIAR
│   ├── cadastrar.html
│   ├── consultar.html
│   ├── avaliacoes.html
│   ├── nine-box.html
│   └── competencias.html
├── css/
│   ├── style.css
│   ├── pages.css
│   └── components.css  # CRIAR
└── js/
    ├── config.js       # CRIAR - API_BASE_URL
    ├── api.js          # CRIAR - Chamadas API
    ├── auth.js         # CRIAR - Autenticação
    ├── validators.js   # CRIAR - Validações
    ├── utils.js        # CRIAR - Utilitários
    ├── components/
    │   ├── navbar.js
    │   ├── toast.js
    │   └── loading.js  # CRIAR
    └── pages/
        ├── login.js    # CRIAR
        ├── cadastrar.js
        ├── consultar.js
        └── dashboard.js
```

## 👥 Divisão de Trabalho

### 🔵 Estagiário 1 - Infraestrutura
**Criar módulos base**:
- `js/config.js` - Configurações
- `js/api.js` - Chamadas HTTP
- `js/auth.js` - Login/logout/permissões
- `js/components/loading.js` - Spinner
- `pages/login.html` + `js/pages/login.js`

📖 Ver: [`docs/frontend/ESTAGIARIO_1_INFRAESTRUTURA.md`](frontend/ESTAGIARIO_1_INFRAESTRUTURA.md)

---

### 🟢 Estagiário 2 - Integração
**Integrar com API**:
- `js/validators.js` - Validações de formulário
- Integrar CRUD de usuários
- Integrar avaliações
- Adicionar filtros e busca
- Atualizar dashboard com dados reais

📖 Ver: [`docs/frontend/ESTAGIARIO_2_INTEGRACAO.md`](frontend/ESTAGIARIO_2_INTEGRACAO.md)

---

## 🔧 Módulos Principais

### 1. API (api.js)

```javascript
const API_BASE_URL = 'http://localhost:3000/api';

class API {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) throw new Error(data.message);
    return data;
  }

  // Usuários
  async login(credentials) {
    return this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getUsers(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/users?${params}`);
  }

  async getUserByRA(ra) {
    return this.request(`/users/ra/${ra}`);
  }

  // Avaliações
  async createEvaluation(data) {
    return this.request('/evaluations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ... outros métodos
}

const api = new API();
```

### 2. Autenticação (auth.js)

```javascript
class Auth {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  async login(email, senha) {
    const response = await api.login({ email, senha });
    this.token = response.data.token;
    this.user = response.data.user;
    localStorage.setItem('token', this.token);
    localStorage.setItem('user', JSON.stringify(this.user));
    return response;
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/pages/login.html';
  }

  isAuthenticated() {
    return !!this.token;
  }

  isAdmin() {
    return this.user?.tipo === 'admin';
  }

  isGestorOrAdmin() {
    return ['admin', 'gestor'].includes(this.user?.tipo);
  }

  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/pages/login.html';
      return false;
    }
    return true;
  }

  requireAdmin() {
    if (!this.requireAuth()) return false;
    if (!this.isAdmin()) {
      toast.error('Acesso negado. Apenas administradores.');
      window.location.href = '/index.html';
      return false;
    }
    return true;
  }
}

const auth = new Auth();
```

### 3. Loading (loading.js)

```javascript
class Loading {
  constructor() {
    this.createLoadingElement();
  }

  createLoadingElement() {
    const loading = document.createElement('div');
    loading.id = 'global-loading';
    loading.className = 'loading-overlay';
    loading.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Carregando...</p>
      </div>
    `;
    document.body.appendChild(loading);
  }

  show(message = 'Carregando...') {
    const loading = document.getElementById('global-loading');
    loading.querySelector('p').textContent = message;
    loading.classList.add('active');
  }

  hide() {
    document.getElementById('global-loading').classList.remove('active');
  }
}

const loading = new Loading();
```

### 4. Validações (validators.js)

```javascript
const validators = {
  required(value) {
    return value !== null && value !== undefined && value.trim() !== '';
  },
  
  email(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },
  
  password(value) {
    return value.length >= 6;
  },
  
  name(value) {
    return value.trim().length >= 3;
  },
  
  ra(value) {
    return /^[0-9]{7}$/.test(value);
  },
};

function validateForm(formId, rules) {
  const form = document.getElementById(formId);
  let isValid = true;
  const errors = {};

  Object.keys(rules).forEach(fieldName => {
    const field = form.querySelector(`[name="${fieldName}"]`);
    const value = field.value;
    const fieldRules = rules[fieldName];

    clearFieldError(field);

    for (const rule of fieldRules) {
      const validator = validators[rule];
      if (!validator || !validator(value)) {
        isValid = false;
        errors[fieldName] = getErrorMessage(rule, fieldName);
        showFieldError(field, errors[fieldName]);
        break;
      }
    }
  });

  return { isValid, errors };
}

function showFieldError(field, message) {
  field.classList.add('error');
  let errorEl = field.parentElement.querySelector('.field-error');
  if (!errorEl) {
    errorEl = document.createElement('span');
    errorEl.className = 'field-error';
    field.parentElement.appendChild(errorEl);
  }
  errorEl.textContent = message;
}

function clearFieldError(field) {
  field.classList.remove('error');
  const errorEl = field.parentElement.querySelector('.field-error');
  if (errorEl) errorEl.remove();
}

function getErrorMessage(validator, fieldName) {
  const messages = {
    required: `${fieldName} é obrigatório`,
    email: 'Email inválido',
    password: 'Senha deve ter no mínimo 6 caracteres',
    name: 'Nome deve ter no mínimo 3 caracteres',
    ra: 'RA deve ter 7 dígitos numéricos',
  };
  return messages[validator] || 'Campo inválido';
}
```

---

## 🔐 Sistema de Permissões

### Proteger páginas

```javascript
// No início do script da página
document.addEventListener('DOMContentLoaded', () => {
  // Apenas usuários autenticados
  if (!auth.requireAuth()) return;
  
  // Apenas admin
  if (!auth.requireAdmin()) return;
  
  // Apenas gestor ou admin
  if (!auth.isGestorOrAdmin()) {
    toast.error('Acesso negado');
    window.location.href = '/index.html';
    return;
  }
  
  // Carregar dados...
});
```

### Mostrar/ocultar elementos

```html
<button id="btn-cadastrar" style="display:none;">Cadastrar</button>

<script>
if (auth.isAdmin()) {
  document.getElementById('btn-cadastrar').style.display = 'block';
}
</script>
```

---

## 🎨 Exemplo Completo: Login

### login.html

```html
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Login</title>
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
  <div class="login-wrapper">
    <form id="login-form" onsubmit="handleLogin(event)">
      <h2>Login</h2>
      
      <div class="field">
        <label>E-mail</label>
        <input type="email" name="email" required>
      </div>
      
      <div class="field">
        <label>Senha</label>
        <input type="password" name="senha" required>
      </div>
      
      <button type="submit">Entrar</button>
    </form>
  </div>

  <script src="../js/config.js"></script>
  <script src="../js/api.js"></script>
  <script src="../js/auth.js"></script>
  <script src="../js/components/toast.js"></script>
  <script src="../js/components/loading.js"></script>
  <script src="../js/pages/login.js"></script>
</body>
</html>
```

### login.js

```javascript
async function handleLogin(event) {
  event.preventDefault();

  const email = document.querySelector('[name="email"]').value;
  const senha = document.querySelector('[name="senha"]').value;

  try {
    loading.show('Fazendo login...');
    await auth.login(email, senha);
    toast.success('Login realizado!');
    setTimeout(() => window.location.href = '/index.html', 1000);
  } catch (error) {
    toast.error(error.message || 'Erro ao fazer login');
  } finally {
    loading.hide();
  }
}

// Redirecionar se já estiver logado
if (auth.isAuthenticated()) {
  window.location.href = '/index.html';
}
```

---

## ✅ Checklist

### Estagiário 1
- [ ] Criar `js/config.js`
- [ ] Criar `js/api.js`
- [ ] Criar `js/auth.js`
- [ ] Criar `js/components/loading.js`
- [ ] Criar `pages/login.html` + `js/pages/login.js`
- [ ] Testar login/logout

### Estagiário 2
- [ ] Criar `js/validators.js`
- [ ] Integrar cadastro de usuários
- [ ] Integrar consulta de usuários
- [ ] Integrar avaliações
- [ ] Adicionar filtros
- [ ] Atualizar dashboard
- [ ] Testar fluxo completo

---

## 📚 Documentação Detalhada

- [Estagiário 1 - Infraestrutura](frontend/ESTAGIARIO_1_INFRAESTRUTURA.md)
- [Estagiário 2 - Integração](frontend/ESTAGIARIO_2_INTEGRACAO.md)
- [Início Rápido](frontend/START_HERE.md)
- [FAQ](frontend/FAQ.md)
