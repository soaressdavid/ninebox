# ❓ FAQ - Frontend

## Perguntas Frequentes

---

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
window.CONFIG = {
  API_BASE_URL: 'http://localhost:3000/api'
};
```

---

### 🔤 Terminologia

**Q: Qual terminologia devo usar?**
A: O sistema usa os seguintes termos. Nunca use os termos antigos.

| ❌ Antigo       | ✅ Correto      |
|----------------|----------------|
| `estagiario`   | `colaborador`  |
| `professor`    | `gestor`       |
| `disciplina`   | `cargo` ou `departamento` |

Isso vale para variáveis, labels, comentários, payloads e qualquer texto visível ao usuário.

**Q: O campo RA é obrigatório?**
A: Sim. RA é obrigatório no cadastro. Deve ter entre 5 e 10 caracteres. O sistema não gera RA — a pessoa informa o RA que já possui.

---

### 🔐 Autenticação

**Q: Como funciona o sistema de login?**
A:
1. Usuário faz login em `pages/login.html`
2. Backend retorna um token JWT via `POST /api/users/login`
3. Token é salvo no `localStorage`
4. Token é enviado em todas as requisições protegidas

**Q: Como proteger uma página?**
A: No início do script da página:
```javascript
// Verificar se está logado
auth.requireAuth(); // Redireciona para login se não estiver

// Verificar se é admin
auth.requireAdmin(); // Redireciona se não for admin

// Verificar se é gestor ou admin
auth.requireGestorOrAdmin(); // Redireciona se for colaborador
```

**Q: Como fazer logout?**
A:
```javascript
auth.logout(); // Remove token e redireciona para login
```

**Q: O que acontece quando o token expira?**
A: A API retorna `401`. O `api.js` deve capturar isso, chamar `auth.logout()` e redirecionar para login com uma mensagem de aviso.

---

### 🌐 Chamadas API

**Q: Como fazer uma requisição GET?**
A:
```javascript
try {
  loading.show('Carregando...');
  const response = await api.getUsers();
  renderTable(response.data);
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
    ra: '2022001',
    nome: 'Ana Costa',
    email: 'ana@eniac.edu.br',
    senha: 'senha123',
    tipo: 'colaborador',
    cargo: 'Desenvolvedora',
    departamento: 'Tecnologia'
  };
  await api.registerUser(data);
  toast.success('Colaborador cadastrado com sucesso!');
} catch (error) {
  toast.error(error.message);
} finally {
  loading.hide();
}
```

**Q: Como enviar o token JWT?**
A: O módulo `api.js` já faz isso automaticamente:
```javascript
const token = localStorage.getItem(CONFIG.TOKEN_KEY);
headers: {
  'Authorization': `Bearer ${token}`
}
```

**Q: Qual endpoint usar para login?**
A: `POST /api/users/login` — nunca use `/api/auth/login`.

---

### ✅ Validações

**Q: Como validar um formulário?**
A:
```javascript
const result = validateForm('form-cadastro', {
  ra:    ['required', 'ra'],
  nome:  ['required', 'name'],
  email: ['required', 'email'],
  senha: ['required', 'password'],
  tipo:  ['required', 'selected']
});

if (!result.isValid) return;
```

**Q: Como validar um campo específico?**
A:
```javascript
const raField = document.getElementById('ra');
const result = validateField(raField, ['required', 'ra']);

if (!result.isValid) {
  showFieldError(raField, result.message);
}
```

**Q: Quais são as regras de validação?**
A:
- `ra`: string com 5 a 10 caracteres
- `email`: formato de email real (qualquer domínio)
- `password`: mínimo de 6 caracteres
- `name`: mínimo de 3 caracteres

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

---

### 🐛 Erros Comuns

**Q: Erro "CORS policy"**
A: Backend precisa habilitar CORS. Verifique se o backend está configurado com a origem correta (porta do Live Server, geralmente `5500`).

**Q: Erro "401 Unauthorized"**
A: Token inválido ou expirado. O `api.js` deve fazer logout automático:
```javascript
if (error.status === 401) {
  auth.logout();
}
```

**Q: Dados não aparecem na página**
A: Verificar:
1. Console do navegador (F12) para erros
2. Network tab para ver requisições
3. Se backend está rodando em `http://localhost:3000`
4. Se token está válido

**Q: Posso usar `localStorage` para guardar listas de usuários?**
A: Não. `localStorage` é restrito a sessão mínima (token + usuário autenticado). Listas de negócio devem vir sempre da API.

---

### 👥 Permissões

**Q: Quem pode cadastrar usuários?**
A: Apenas `admin`.

**Q: Quem pode criar Nine Box?**
A: Apenas `gestor` e `admin`.

**Q: Quem pode criar/editar/deletar competências?**
A: Apenas `admin`.

**Q: Quem pode ver o dashboard?**
A: `gestor` e `admin`. Colaborador não tem acesso ao dashboard geral.

**Q: Colaborador pode avaliar gestor?**
A: Sim. O sistema é bidirecional:
- `gestor` avalia `colaborador` → tipo `gestor_para_colaborador`
- `colaborador` avalia `gestor` → tipo `colaborador_para_gestor`
- `admin` avalia qualquer um → tipo `avaliacao_360`

---

### 🔒 Avaliações Anônimas

**Q: Como funciona o anonimato?**
A:
- `avaliadorId` é salvo no banco para controle interno
- `avaliadorId` **nunca** é retornado pela API para usuário comum
- apenas `admin` vê quem avaliou quem (auditoria)
- a interface deve deixar claro quando a avaliação é anônima

**Q: Preciso enviar o `tipoAvaliacao` no payload?**
A: Não. O backend determina o tipo automaticamente com base nos tipos dos usuários envolvidos. Envie apenas `avaliadoId`, `criterios` (se houver), `comentario` e `anonima`.

**Q: Posso mostrar o nome do avaliador na tela?**
A: Não para usuário comum. Apenas admin pode ver essa informação.

---

### 📝 Manipulação de DOM

**Q: Como popular uma tabela com dados?**
A:
```javascript
function renderTable(colaboradores) {
  const tbody = document.querySelector('#tabela tbody');
  tbody.innerHTML = '';

  colaboradores.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.ra}</td>
      <td>${item.nome}</td>
      <td>${item.email}</td>
      <td>${item.cargo || '-'}</td>
      <td>${item.departamento || '-'}</td>
      <td>
        <button onclick="editar('${item.id}')">Editar</button>
        <button onclick="deletar('${item.id}')">Deletar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}
```

---

### 🔍 Filtros e Busca

**Q: Como implementar busca por RA?**
A:
```javascript
const raInput = document.getElementById('busca-ra');
raInput.addEventListener('change', async (e) => {
  const ra = e.target.value.trim();
  if (ra.length >= 5) {
    try {
      const response = await api.getUserByRA(ra);
      renderResult(response.data);
    } catch (error) {
      toast.error('Usuário não encontrado');
    }
  }
});
```

**Q: Como implementar filtros por tipo?**
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

### 📦 Estrutura de Arquivos

**Q: Onde colocar novos arquivos JS?**
A:
```
js/
├── config.js           # Configurações globais
├── api.js              # Client HTTP centralizado
├── auth.js             # Autenticação e permissões
├── validators.js       # Validações reutilizáveis
├── components/         # Componentes reutilizáveis
│   ├── toast.js
│   └── loading.js
└── pages/              # Scripts específicos de páginas
    ├── login.js
    ├── cadastrar.js
    ├── consultar.js
    ├── avaliacoes.js
    ├── nine-box.js
    ├── competencias.js
    ├── perfil.js
    └── dashboard.js
```

---

### 🎯 Boas Práticas

**Q: Como organizar o código JavaScript?**
A:
```javascript
// ❌ Ruim: Tudo em um arquivo com localStorage
localStorage.setItem('usuarios', JSON.stringify(lista));

// ✅ Bom: Separar por responsabilidade e usar API
const response = await api.getUsers();
renderTable(response.data);
```

**Q: Como lidar com async/await?**
A:
```javascript
// ✅ Sempre usar try/catch/finally
async function carregarDados() {
  try {
    loading.show('Carregando...');
    const response = await api.getUsers();
    renderTable(response.data);
  } catch (error) {
    toast.error(error.message);
  } finally {
    loading.hide();
  }
}
```

---

### 🔧 Debug

**Q: Como ver requisições HTTP?**
A: No Chrome DevTools:
1. F12
2. Aba "Network"
3. Fazer requisição
4. Clicar na requisição para ver detalhes (headers, payload, response)

**Q: Como debugar permissões?**
A:
```javascript
console.log('Usuário atual:', auth.getUser());
console.log('É admin?', auth.isAdmin());
console.log('É gestor?', auth.isGestor());
console.log('É colaborador?', auth.isColaborador());
```

---

## 📞 Ainda com dúvidas?

- Revisar [ESTAGIARIO_1_INFRAESTRUTURA.md](ESTAGIARIO_1_INFRAESTRUTURA.md)
- Revisar [ESTAGIARIO_2_INTEGRACAO.md](ESTAGIARIO_2_INTEGRACAO.md)
- Perguntar ao time no daily standup
