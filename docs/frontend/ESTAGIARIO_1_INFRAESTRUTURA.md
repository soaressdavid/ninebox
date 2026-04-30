# 🔵 ESTAGIÁRIO FRONTEND 1 - Infraestrutura e Autenticação

## 👤 Sua Responsabilidade

Você será responsável pela **infraestrutura base** do frontend e pelo **sistema de autenticação**.

---

## 🎯 Objetivos

1. Criar módulos base (API, Auth, Loading, Toast)
2. Implementar sistema de login/logout
3. Criar proteção de rotas (incluindo admin)
4. Melhorar estrutura de arquivos
5. Implementar estados de loading

**⚠️ IMPORTANTE**: O sistema agora suporta 3 tipos de usuário:
- **Admin** (RA: 1000000) - Acesso total, pode cadastrar usuários
- **Gestor** (RA: 2021XXX) - Pode avaliar colaboradores
- **Colaborador** (RA: 2022XXX) - Acesso limitado

Você deve implementar métodos `isAdmin()` e `requireAdmin()` no módulo de autenticação.

---

## 📁 Arquivos que você vai criar

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

## 🔨 Tarefas Detalhadas

### TAREFA 1: Criar config.js

```javascript
// js/config.js

const CONFIG = {
  API_BASE_URL: 'http://localhost:3000/api',
  TOKEN_KEY: 'token',
  USER_KEY: 'user',
  TOAST_DURATION: 3000,
};

// Exportar para uso global
window.CONFIG = CONFIG;
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

Copie o código do `FRONTEND_GUIDE.md` seção "Criar Módulo de Autenticação".

**Funcionalidades:**
- `login(email, senha)` - Fazer login
- `logout()` - Fazer logout
- `isAuthenticated()` - Verificar se está logado
- `isGestor()` - Verificar se é gestor
- `requireAuth()` - Proteger rotas
- `requireGestor()` - Proteger rotas de gestor

**Teste:**
```javascript
// No console
auth.login('joao@empresa.com', 'senha123')
  .then(() => console.log('Logado!'));
```

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

## ✅ Checklist de Implementação

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

## 🧪 Como Testar

### 1. Testar API
```javascript
// No console do navegador
api.getUsers().then(console.log);
```

### 2. Testar Login
1. Abrir `pages/login.html`
2. Usar credenciais: `joao@empresa.com` / `senha123`
3. Verificar se redireciona para dashboard
4. Verificar se token está no localStorage

### 3. Testar Logout
1. Clicar no menu do usuário
2. Clicar em "Sair"
3. Verificar se redireciona para login
4. Verificar se token foi removido

### 4. Testar Proteção de Rotas
1. Fazer logout
2. Tentar acessar `/index.html` diretamente
3. Deve redirecionar para login

---

## 📝 Dicas Importantes

1. **Sempre use try-catch** em funções async
2. **Mostre loading** durante requisições
3. **Trate erros** com mensagens claras
4. **Teste no console** antes de integrar
5. **Use DevTools** para debugar
6. **Verifique localStorage** para ver token
7. **Teste com backend desligado** para ver erros

---

## 🆘 Problemas Comuns

### "api is not defined"
→ Importar `api.js` antes de usar

### "CORS error"
→ Backend deve ter CORS habilitado

### "Token inválido"
→ Verificar se token está sendo enviado corretamente

### "Não redireciona após login"
→ Verificar se `window.location.href` está correto

---

**Boa sorte! 🚀**