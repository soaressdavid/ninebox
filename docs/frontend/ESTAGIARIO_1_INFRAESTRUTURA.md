# ESTAGIÁRIO FRONTEND 1 - Infraestrutura e Autenticação

## Sua Responsabilidade

Você vai cuidar da infraestrutura base do frontend e do sistema de autenticação.

---

## Objetivos

1. Criar módulos base (API, Auth, Loading, Toast)
2. Implementar sistema de login/logout
3. Criar proteção de rotas (incluindo admin)
4. Melhorar estrutura de arquivos
5. Implementar estados de loading

**IMPORTANTE**: O sistema agora suporta 3 tipos de usuário:
- **Admin** - Acesso total, pode cadastrar usuários (cada admin tem seu RA)
- **Gestor** - Pode avaliar colaboradores (RA é o número que a pessoa já possui)
- **Colaborador** - Acesso limitado (RA é o número que a pessoa já possui)

**Sistema de RA**: Cada pessoa já tem seu RA (como CPF). No cadastro, a pessoa informa o RA dela. Sistema valida o formato (5 a 10 caracteres alfanuméricos) e se não está duplicado.

Você deve implementar métodos `isAdmin()` e `requireAdmin()` no módulo de autenticação.

---

## Arquivos que você vai criar

```
js/
├── config.js           # Configurações
├── api.js              # Chamadas API
├── auth.js             # Autenticação
├── state.js            # Estado global (opcional)
├── utils.js            # Utilitários
│
├── components/
│   ├── loading.js      # Loading spinner
│   └── toast.js        # Notificações
│
└── pages/
    └── login.js        # Lógica da página de login

pages/
└── login.html          # Página de login
```

---

## Tarefas Detalhadas

### TAREFA 1: Criar config.js

**IMPORTANTE**: O frontend faz requisições para o backend em `http://localhost:3000/api`.

Certifique-se de que o backend está rodando e tem **CORS configurado** para aceitar requisições do frontend (normalmente `http://localhost:5500` com Live Server).

```javascript
// js/config.js

const CONFIG = {
  API_BASE_URL: 'http://localhost:3000/api',
  USER_KEY: 'user', // Apenas dados não-sensíveis do usuário
  TOAST_DURATION: 3000,
};

// Exportar para uso global
window.CONFIG = CONFIG;
```

**⚠️ IMPORTANTE - AUTENTICAÇÃO PROFISSIONAL:**

Este projeto usa **HttpOnly Cookies** para armazenar tokens JWT de forma segura:

- ✅ **Token em HttpOnly Cookie** (não acessível via JavaScript - protege contra XSS)
- ✅ **Dados do usuário em sessionStorage** (apenas info não-sensível)
- ❌ **NÃO usar localStorage para tokens** (vulnerável a ataques XSS)

**Durante desenvolvimento com MOCK:**
- Temporariamente usamos `sessionStorage` para simular autenticação
- Quando o backend estiver pronto, migraremos para HttpOnly Cookies

**Configuração CORS no Backend** (em `backend/src/app.js`):
```javascript
import cors from 'cors';
import cookieParser from 'cookie-parser';

app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5500', // URL do Live Server
  credentials: true // IMPORTANTE: Permite envio de cookies
}));
```

---

### TAREFA 2: Criar api.js

Copie o código do `FRONTEND_GUIDE.md` seção "Criar Módulo de API".

**Pontos importantes:**
- Adicionar token JWT automaticamente
- Tratar erros de rede
- Retornar dados formatados
- Fazer log de erros no console

**Teste:**
```javascript
// No console do navegador
api.getUsers().then(console.log);
```

---

### TAREFA 3: Criar auth.js

**⚠️ AUTENTICAÇÃO PROFISSIONAL COM HTTPONLY COOKIES**

O módulo de autenticação deve ser implementado de forma profissional:

**Funcionalidades:**
- `login(email, senha)` - Fazer login (token retorna em HttpOnly Cookie)
- `logout()` - Fazer logout (limpa cookie no backend)
- `isAuthenticated()` - Verificar se está logado
- `isAdmin()` - Verificar se é admin
- `isGestor()` - Verificar se é gestor
- `requireAuth()` - Proteger rotas
- `requireAdmin()` - Proteger rotas de admin
- `requireGestor()` - Proteger rotas de gestor

**Implementação Profissional:**

```javascript
// js/auth.js

const auth = {
  // Fazer login
  async login(email, senha) {
    const response = await fetch(`${CONFIG.API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // IMPORTANTE: Envia/recebe cookies
      body: JSON.stringify({ email, senha })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao fazer login');
    }

    const data = await response.json();
    
    // Token está em HttpOnly Cookie (não acessível via JS)
    // Salva apenas dados não-sensíveis do usuário
    this.setUser(data.data.user);
    
    return data;
  },

  // Fazer logout
  async logout() {
    try {
      await fetch(`${CONFIG.API_BASE_URL}/users/logout`, {
        method: 'POST',
        credentials: 'include' // Envia cookie para ser limpo
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Limpa dados locais
      this.removeUser();
      window.location.href = '/pages/login.html';
    }
  },

  // Verificar se está autenticado
  isAuthenticated() {
    // Verifica se tem dados do usuário salvos
    return !!this.getUser();
  },

  // Verificar se é admin
  isAdmin() {
    const user = this.getUser();
    return user && user.tipo === 'admin';
  },

  // Verificar se é gestor
  isGestor() {
    const user = this.getUser();
    return user && user.tipo === 'gestor';
  },

  // Proteger rotas (requer autenticação)
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/pages/login.html';
      return false;
    }
    return true;
  },

  // Proteger rotas de admin
  requireAdmin() {
    if (!this.requireAuth()) return false;
    
    if (!this.isAdmin()) {
      toast.error('Acesso negado. Apenas administradores.');
      window.location.href = '/index.html';
      return false;
    }
    return true;
  },

  // Proteger rotas de gestor
  requireGestor() {
    if (!this.requireAuth()) return false;
    
    if (!this.isGestor() && !this.isAdmin()) {
      toast.error('Acesso negado. Apenas gestores.');
      window.location.href = '/index.html';
      return false;
    }
    return true;
  },

  // Obter dados do usuário
  getUser() {
    try {
      return JSON.parse(sessionStorage.getItem(CONFIG.USER_KEY) || 'null');
    } catch {
      return null;
    }
  },

  // Salvar dados do usuário (apenas info não-sensível)
  setUser(user) {
    sessionStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
  },

  // Remover dados do usuário
  removeUser() {
    sessionStorage.removeItem(CONFIG.USER_KEY);
  }
};

window.auth = auth;
```

**Por que HttpOnly Cookies?**

| Método | Segurança XSS | Segurança CSRF | Profissional |
|--------|---------------|----------------|--------------|
| localStorage | ❌ Vulnerável | ✅ Protegido | ⚠️ Básico |
| sessionStorage | ❌ Vulnerável | ✅ Protegido | ⚠️ Médio |
| **HttpOnly Cookie** | ✅ **Protegido** | ✅ **Protegido** | ✅ **Recomendado** |

**Teste:**
```javascript
// No console
auth.login('joao@empresa.com', 'senha123')
  .then(() => console.log('Logado!'));
```

**NOTA IMPORTANTE:**
Durante o desenvolvimento com dados MOCK (sem backend), você pode usar `sessionStorage` temporariamente. Quando o backend estiver pronto, o token virá automaticamente em HttpOnly Cookie.

---

### TAREFA 4: Criar loading.js

Copie o código do `FRONTEND_GUIDE.md` seção "Criar Componente de Loading".

**CSS necessário:**
```css
/* Adicionar em css/components.css */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}

.loading-overlay.active {
  opacity: 1;
  pointer-events: all;
}

.loading-spinner {
  background: var(--surface);
  padding: 32px;
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-lg);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-spinner p {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
}
```

**Uso:**
```javascript
loading.show('Carregando dados...');
// ... fazer requisição
loading.hide();
```

---

### TAREFA 5: Melhorar toast.js

Copie o código do `FRONTEND_GUIDE.md` seção "Melhorar Sistema de Toast".

**Adicionar CSS:**
```css
/* Melhorar toast em css/style.css */
.toast {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toast i {
  font-size: 16px;
}

.toast.success {
  background: var(--success);
}

.toast.error {
  background: var(--danger);
}

.toast.info {
  background: var(--primary-light);
}

.toast.warning {
  background: #f59e0b;
}
```

**Uso:**
```javascript
toast.success('Salvo com sucesso!');
toast.error('Erro ao salvar');
toast.info('Informação importante');
toast.warning('Atenção!');
```

---

### TAREFA 6: Criar página de login (login.html)

Copie o código do `FRONTEND_GUIDE.md` seção "Criar Página de Login".

**Adicionar CSS:**
```css
/* Adicionar em css/pages.css */
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: var(--surface);
  padding: 40px;
  border-radius: var(--radius);
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header i {
  font-size: 48px;
  color: var(--primary);
  margin-bottom: 16px;
}

.login-header h2 {
  color: var(--primary);
  font-size: 24px;
  margin-bottom: 8px;
}

.login-header p {
  color: var(--text-muted);
  font-size: 14px;
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.login-footer p {
  color: var(--text-muted);
  font-size: 14px;
}

.login-footer a {
  color: var(--primary);
  font-weight: 600;
  text-decoration: none;
}

.login-footer a:hover {
  text-decoration: underline;
}
```

---

### TAREFA 7: Criar login.js

```javascript
// js/pages/login.js

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  // Validações básicas
  if (!email || !senha) {
    toast.error('Preencha todos os campos');
    return;
  }

  if (!validators.email(email)) {
    toast.error('Email inválido');
    return;
  }

  try {
    loading.show('Fazendo login...');

    const response = await auth.login(email, senha);

    toast.success('Login realizado com sucesso!');
    
    // Redirecionar para dashboard
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 1000);

  } catch (error) {
    console.error('Erro no login:', error);
    toast.error(error.message || 'Email ou senha incorretos');
  } finally {
    loading.hide();
  }
}

// Verificar se já está logado
document.addEventListener('DOMContentLoaded', () => {
  if (auth.isAuthenticated()) {
    window.location.href = '/index.html';
  }
});
```

---

### TAREFA 8: Proteger rotas

Adicionar no início de cada página que requer autenticação:

```javascript
// No início de index.html, perfil.html, etc.
<script>
  // Verificar autenticação
  if (!auth || !auth.isAuthenticated()) {
    window.location.href = '/pages/login.html';
  }
</script>
```

Ou criar um arquivo `js/guards.js`:

```javascript
// js/guards.js

function requireAuth() {
  if (!auth.isAuthenticated()) {
    window.location.href = '/pages/login.html';
    return false;
  }
  return true;
}

function requireGestor() {
  if (!requireAuth()) return false;
  
  if (!auth.isGestor()) {
    toast.error('Acesso negado. Apenas gestores.');
    window.location.href = '/index.html';
    return false;
  }
  return true;
}

// Executar automaticamente
document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname;
  
  // Páginas públicas
  const publicPages = ['/pages/login.html', '/pages/cadastrar.html'];
  if (publicPages.some(p => page.includes(p))) {
    return;
  }
  
  // Páginas que requerem autenticação
  requireAuth();
  
  // Páginas que requerem ser gestor
  const gestorPages = ['/pages/competencias.html'];
  if (gestorPages.some(p => page.includes(p))) {
    requireGestor();
  }
});
```

---

### TAREFA 9: Atualizar navbar com autenticação

Modificar `css/js/navbar.js`:

```javascript
// Adicionar no final do arquivo

// Atualizar informações do usuário na navbar
function updateNavbarUser() {
  if (!auth.isAuthenticated()) {
    // Esconder menu de usuário
    const userMenu = document.getElementById('user-menu');
    if (userMenu) userMenu.style.display = 'none';
    return;
  }

  const user = auth.getUser();
  if (!user) return;

  // Atualizar nome
  const nomeEl = document.getElementById('user-dropdown-nome');
  if (nomeEl) nomeEl.textContent = user.nome;

  // Atualizar tipo
  const tipoEl = document.getElementById('user-dropdown-tipo');
  if (tipoEl) tipoEl.textContent = user.tipo === 'gestor' ? 'Gestor' : 'Colaborador';

  // Atualizar avatar
  const avatarEl = document.getElementById('user-dropdown-avatar');
  if (avatarEl) {
    if (user.foto) {
      avatarEl.innerHTML = `<img src="${user.foto}" alt="${user.nome}">`;
    } else {
      const iniciais = user.nome.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
      avatarEl.innerHTML = iniciais;
    }
  }

  // Mostrar botão de sair
  const btnSair = document.getElementById('btn-sair-header');
  if (btnSair) btnSair.style.display = 'flex';
}

// Função de logout
function sairDaConta() {
  if (confirm('Deseja realmente sair?')) {
    auth.logout();
  }
}

// Executar ao carregar
document.addEventListener('DOMContentLoaded', updateNavbarUser);
```

---

### TAREFA 10: Criar utils.js

```javascript
// js/utils.js

const utils = {
  // Formatar data
  formatDate(date) {
    return new Date(date).toLocaleDateString('pt-BR');
  },

  // Formatar data e hora
  formatDateTime(date) {
    return new Date(date).toLocaleString('pt-BR');
  },

  // Debounce para busca
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Gerar iniciais do nome
  getInitials(name) {
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  },

  // Truncar texto
  truncate(text, length) {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  },

  // Copiar para clipboard
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copiado!');
    } catch (error) {
      toast.error('Erro ao copiar');
    }
  },
};

window.utils = utils;
```

---

## Checklist de Implementação

- [ ] Criar pasta `js/` na raiz
- [ ] Criar `js/config.js`
- [ ] Criar `js/api.js` e testar no console
- [ ] Criar `js/auth.js` e testar login
- [ ] Criar pasta `js/components/`
- [ ] Criar `js/components/loading.js`
- [ ] Criar `js/components/toast.js`
- [ ] Criar `css/components.css` com estilos
- [ ] Criar `pages/login.html`
- [ ] Criar pasta `js/pages/`
- [ ] Criar `js/pages/login.js`
- [ ] Testar fluxo de login completo
- [ ] Criar `js/guards.js` para proteção de rotas
- [ ] Atualizar navbar com autenticação
- [ ] Criar `js/utils.js`
- [ ] Testar logout
- [ ] Documentar no README

---

## Como Testar

### 1. Testar API
```javascript
// No console do navegador
api.getUsers().then(console.log);
```

### 2. Testar Login
1. Abrir `pages/login.html`
2. Usar credenciais: `joao@empresa.com` / `senha123`
3. Verificar se redireciona para dashboard
4. **Com backend**: Token está em HttpOnly Cookie (não visível no DevTools → Application → Cookies)
5. **Com mock**: Dados do usuário em sessionStorage (temporário)

### 3. Testar Logout
1. Clicar no menu do usuário
2. Clicar em "Sair"
3. Verificar se redireciona para login
4. **Com backend**: Cookie é limpo no servidor
5. **Com mock**: sessionStorage é limpo

### 4. Testar Proteção de Rotas
1. Fazer logout
2. Tentar acessar `/index.html` diretamente
3. Deve redirecionar para login

---

## Dicas Importantes

1. **Sempre use try-catch** em funções async
2. **Mostre loading** durante requisições
3. **Trate erros** com mensagens claras
4. **Teste no console** antes de integrar
5. **Use DevTools** para debugar
6. **Segurança**: Token em HttpOnly Cookie (não acessível via JavaScript)
7. **Teste com backend desligado** para ver erros
8. **Durante desenvolvimento**: sessionStorage é usado temporariamente para mock

---

## Problemas Comuns

### "api is not defined"
→ Importar `api.js` antes de usar

### "CORS error"
→ Backend deve ter CORS habilitado

### "Token inválido"
→ Verificar se token está sendo enviado corretamente

### "Não redireciona após login"
→ Verificar se `window.location.href` está correto

---

Qualquer dúvida, chama.