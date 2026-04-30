# ❓ FAQ - Frontend

## Perguntas Frequentes

### 🚀 Início Rápido

**Q: Como rodar o frontend?**
A: Use um servidor local:
```bash
# Opção 1: Live Server (VS Code)
# Instalar extensão "Live Server" e clicar com botão direito em index.html

# Opção 2: Python
python -m http.server 8000

# Opção 3: Node.js
npx serve .
```

**Q: Qual a URL do backend?**
A: Por padrão: `http://localhost:3000`
Configure em `js/config.js`:
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

---

### 🔐 Autenticação

**Q: Como funciona o sistema de login?**
A:
1. Usuário faz login em `pages/login.html`
2. Backend retorna um token JWT
3. Token é salvo no `localStorage`
4. Token é enviado em todas as requisições protegidas

**Q: Como proteger uma página?**
A: No início do script da página:
```javascript
// Verificar se está logado
if (!auth.requireAuth()) {
  // Redireciona para login
}

// Verificar se é admin
if (!auth.requireAdmin()) {
  // Redireciona para home
}
```

**Q: Como fazer logout?**
A:
```javascript
auth.logout(); // Remove token e redireciona
```

---

### 🌐 Chamadas API

**Q: Como fazer uma requisição GET?**
A:
```javascript
try {
  loading.show('Carregando...');
  const response = await api.getUsers();
  console.log(response.data);
} catch (error) {
  toast.error(error.message);
} finally {
  loading.hide();
}
```

**Q: Como fazer uma requisição POST?**
A:
```javascript
try {
  loading.show('Salvando...');
  const data = {
    nome: 'João',
    email: 'joao@email.com'
  };
  const response = await api.register(data);
  toast.success('Cadastrado com sucesso!');
} catch (error) {
  toast.error(error.message);
} finally {
  loading.hide();
}
```

**Q: Como enviar o token JWT?**
A: O módulo `api.js` já faz isso automaticamente:
```javascript
// Pega o token do localStorage
const token = localStorage.getItem('token');

// Adiciona no header
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

### ✅ Validações

**Q: Como validar um formulário?**
A:
```javascript
// Definir regras
const rules = {
  nome: ['required', 'name'],
  email: ['required', 'email'],
  senha: ['required', 'password']
};

// Validar
const result = validateForm('meu-form', rules);
if (!result.isValid) {
  console.log(result.errors);
  return;
}
```

**Q: Como validar um campo específico?**
A:
```javascript
const emailField = document.getElementById('email');
const result = validateField(emailField, ['required', 'email']);

if (!result.isValid) {
  showFieldError(emailField, result.message);
}
```

**Q: Como adicionar validação customizada?**
A: Em `validators.js`:
```javascript
const validators = {
  // ... validadores existentes
  
  cpf(value) {
    // Lógica de validação de CPF
    return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value);
  }
};

// Adicionar mensagem
function getErrorMessage(validator, fieldName) {
  const messages = {
    // ... mensagens existentes
    cpf: 'CPF inválido'
  };
  return messages[validator];
}
```

---

### 🎨 Componentes UI

**Q: Como mostrar um loading?**
A:
```javascript
loading.show('Carregando dados...');
// ... fazer requisição
loading.hide();
```

**Q: Como mostrar um toast?**
A:
```javascript
toast.success('Operação realizada!');
toast.error('Erro ao processar');
toast.info('Informação importante');
toast.warning('Atenção!');
```

**Q: Como criar um modal?**
A:
```javascript
// Criar HTML do modal
const modal = document.createElement('div');
modal.className = 'modal';
modal.innerHTML = `
  <div class="modal-content">
    <h3>Título</h3>
    <p>Conteúdo</p>
    <button onclick="closeModal()">Fechar</button>
  </div>
`;
document.body.appendChild(modal);
```

---

### 🐛 Erros Comuns

**Q: Erro "CORS policy"**
A: Backend precisa habilitar CORS:
```javascript
// No backend (app.js)
const cors = require('cors');
app.use(cors());
```

**Q: Erro "401 Unauthorized"**
A: Token inválido ou expirado. Fazer login novamente:
```javascript
if (error.status === 401) {
  auth.logout();
}
```

**Q: Erro "Cannot read property of undefined"**
A: Verificar se elemento existe antes de acessar:
```javascript
const element = document.getElementById('meu-id');
if (element) {
  element.value = 'valor';
}
```

**Q: Dados não aparecem na página**
A: Verificar:
1. Console do navegador (F12) para erros
2. Network tab para ver requisições
3. Se backend está rodando
4. Se token está válido

---

### 📝 Manipulação de DOM

**Q: Como popular uma tabela com dados?**
A:
```javascript
function renderTable(data) {
  const tbody = document.querySelector('#tabela tbody');
  tbody.innerHTML = '';
  
  data.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.nome}</td>
      <td>${item.email}</td>
      <td>
        <button onclick="editar('${item.id}')">Editar</button>
        <button onclick="deletar('${item.id}')">Deletar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}
```

**Q: Como criar cards dinamicamente?**
A:
```javascript
function renderCards(data) {
  const container = document.getElementById('cards-container');
  container.innerHTML = '';
  
  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${item.titulo}</h3>
      <p>${item.descricao}</p>
    `;
    container.appendChild(card);
  });
}
```

---

### 🔍 Filtros e Busca

**Q: Como implementar busca em tempo real?**
A:
```javascript
const searchInput = document.getElementById('busca');
searchInput.addEventListener('input', async (e) => {
  const query = e.target.value;
  
  if (query.length >= 3) {
    const results = await api.getUsers({ search: query });
    renderResults(results.data);
  }
});
```

**Q: Como implementar filtros?**
A:
```javascript
async function aplicarFiltros() {
  const tipo = document.getElementById('filtro-tipo').value;
  const departamento = document.getElementById('filtro-depto').value;
  
  const filters = {};
  if (tipo) filters.tipo = tipo;
  if (departamento) filters.departamento = departamento;
  
  const response = await api.getUsers(filters);
  renderTable(response.data);
}
```

---

### 📱 Responsividade

**Q: Como testar em mobile?**
A: No Chrome:
1. F12 (DevTools)
2. Ctrl+Shift+M (Toggle device toolbar)
3. Selecionar dispositivo

**Q: Como fazer menu mobile?**
A:
```javascript
const menuToggle = document.getElementById('menu-toggle');
const navbar = document.getElementById('navbar');

menuToggle.addEventListener('click', () => {
  navbar.classList.toggle('active');
});
```

---

### 🎯 Boas Práticas

**Q: Como organizar o código JavaScript?**
A:
```javascript
// ❌ Ruim: Tudo em um arquivo
// script.js com 1000 linhas

// ✅ Bom: Separar por responsabilidade
// api.js - Chamadas API
// auth.js - Autenticação
// validators.js - Validações
// pages/cadastrar.js - Lógica da página
```

**Q: Como evitar código duplicado?**
A: Criar funções reutilizáveis:
```javascript
// utils.js
function formatDate(date) {
  return new Date(date).toLocaleDateString('pt-BR');
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('');
}
```

**Q: Como lidar com async/await?**
A:
```javascript
// ✅ Sempre usar try/catch
async function fetchData() {
  try {
    const response = await api.getData();
    return response.data;
  } catch (error) {
    console.error(error);
    toast.error('Erro ao carregar dados');
    return null;
  }
}
```

---

### 🔧 Debug

**Q: Como debugar JavaScript?**
A:
```javascript
// Usar console.log
console.log('Valor:', valor);

// Usar debugger
debugger; // Pausa execução

// Usar console.table para arrays
console.table(usuarios);
```

**Q: Como ver requisições HTTP?**
A: No Chrome DevTools:
1. F12
2. Aba "Network"
3. Fazer requisição
4. Clicar na requisição para ver detalhes

---

### 📦 Estrutura de Arquivos

**Q: Onde colocar novos arquivos JS?**
A:
```
js/
├── config.js           # Configurações
├── api.js              # API
├── auth.js             # Autenticação
├── utils.js            # Utilitários
├── validators.js       # Validações
├── components/         # Componentes reutilizáveis
│   ├── navbar.js
│   ├── toast.js
│   └── loading.js
└── pages/              # Scripts específicos de páginas
    ├── login.js
    ├── cadastrar.js
    └── dashboard.js
```

---

## 📞 Ainda com dúvidas?

- Revisar [README.md](README.md)
- Revisar [START_HERE.md](START_HERE.md)
- Perguntar ao time no daily standup
