# 🟢 ESTAGIÁRIO FRONTEND 2 - Funcionalidades e Integração

## 👤 Sua Responsabilidade

Você será responsável por **integrar as páginas com a API** e implementar todas as **funcionalidades CRUD**.

---

## 🎯 Objetivos

1. Criar módulo de validações (incluindo RA)
2. Integrar página de cadastro com API (apenas admin pode cadastrar)
3. Integrar página de consulta com API
4. Integrar avaliações com API
5. Implementar filtros e busca (incluindo busca por RA)
6. Melhorar feedback visual
7. Atualizar dashboard com dados reais

**⚠️ IMPORTANTE**: O sistema agora usa **RA (Registro Acadêmico)** de 7 dígitos:
- Cada usuário tem um RA único
- Validação: exatamente 7 dígitos numéricos
- Usado para buscar usuários: `GET /api/users/ra/:ra`
- Campo obrigatório no cadastro

**Apenas ADMIN pode cadastrar novos usuários!**

---

## 📁 Arquivos que você vai trabalhar

```
js/
├── validators.js       # CRIAR - Validações
│
└── pages/
    ├── cadastrar.js    # CRIAR - Lógica de cadastro
    ├── consultar.js    # CRIAR - Lógica de consulta
    ├── avaliacoes.js   # MODIFICAR - Integrar com API
    ├── dashboard.js    # CRIAR - Dashboard
    └── perfil.js       # CRIAR - Perfil do usuário

pages/
├── cadastrar.html      # MODIFICAR - Integrar
├── consultar.html      # MODIFICAR - Integrar
├── avaliacoes.html     # MODIFICAR - Integrar
└── perfil.html         # MODIFICAR - Integrar
```

---

## 🔨 Tarefas Detalhadas

### TAREFA 1: Criar validators.js

```javascript
// js/validators.js

const validators = {
  // Validar email
  email(value) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  },

  // Validar senha (mínimo 6 caracteres)
  password(value) {
    return value && value.length >= 6;
  },

  // Validar nome (mínimo 3 caracteres)
  name(value) {
    return value && value.trim().length >= 3;
  },

  // Validar campo obrigatório
  required(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  },

  // Validar número
  number(value) {
    return !isNaN(value) && value !== '';
  },

  // Validar range
  range(value, min, max) {
    const num = Number(value);
    return num >= min && num <= max;
  },

  // Validar seleção
  selected(value) {
    return value && value !== '';
  },

  // Validar RA (7 dígitos numéricos)
  ra(value) {
    return /^[0-9]{7}$/.test(value);
  },
};

// Função para validar campo individual
function validateField(field, rules) {
  const value = field.value;
  
  for (const rule of rules) {
    const [validatorName, ...params] = rule.split(':');
    const validator = validators[validatorName];

    if (!validator) continue;

    const ruleParams = params.length > 0 ? params[0].split(',').map(p => p.trim()) : [];
    const isValid = validator(value, ...ruleParams);

    if (!isValid) {
      return {
        isValid: false,
        message: getErrorMessage(validatorName, field.name || field.id, ruleParams)
      };
    }
  }

  return { isValid: true };
}

// Mostrar erro no campo
function showFieldError(field, message) {
  field.classList.add('error');
  
  // Remover erro anterior
  const oldError = field.parentElement.querySelector('.field-error');
  if (oldError) oldError.remove();
  
  // Adicionar novo erro
  const errorEl = document.createElement('span');
  errorEl.className = 'field-error';
  errorEl.textContent = message;
  field.parentElement.appendChild(errorEl);
}

// Limpar erro do campo
function clearFieldError(field) {
  field.classList.remove('error');
  const errorEl = field.parentElement.querySelector('.field-error');
  if (errorEl) errorEl.remove();
}

// Mensagens de erro
function getErrorMessage(validator, fieldName, params = []) {
  const messages = {
    required: `${fieldName} é obrigatório`,
    email: 'Email inválido',
    password: 'Senha deve ter no mínimo 6 caracteres',
    name: 'Nome deve ter no mínimo 3 caracteres',
    number: 'Deve ser um número válido',
    range: `Valor deve estar entre ${params[0]} e ${params[1]}`,
    selected: 'Selecione uma opção',
    ra: 'RA deve ter 7 dígitos numéricos',
  };
  return messages[validator] || 'Campo inválido';
}

// Adicionar validação em tempo real
function addRealtimeValidation(field, rules) {
  field.addEventListener('blur', () => {
    const result = validateField(field, rules);
    if (!result.isValid) {
      showFieldError(field, result.message);
    } else {
      clearFieldError(field);
    }
  });

  field.addEventListener('input', () => {
    if (field.classList.contains('error')) {
      clearFieldError(field);
    }
  });
}

window.validators = validators;
window.validateField = validateField;
window.showFieldError = showFieldError;
window.clearFieldError = clearFieldError;
window.addRealtimeValidation = addRealtimeValidation;
```

**CSS necessário:**
```css
/* Adicionar em css/components.css */
.pg-field input.error,
.pg-field select.error,
.pg-field textarea.error {
  border-color: var(--danger) !important;
  background: #fff5f5;
}

.field-error {
  display: block;
  color: var(--danger);
  font-size: 12px;
  margin-top: 4px;
  font-weight: 500;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

### TAREFA 2: Integrar página de cadastro

**Modificar `pages/cadastrar.html`:**

Adicionar no final, antes de `</body>`:
```html
<script src="../js/config.js"></script>
<script src="../js/api.js"></script>
<script src="../js/auth.js"></script>
<script src="../js/validators.js"></script>
<script src="../js/components/toast.js"></script>
<script src="../js/components/loading.js"></script>
<script src="../js/pages/cadastrar.js"></script>
```

**Criar `js/pages/cadastrar.js`:**

```javascript
// js/pages/cadastrar.js

let tipoSelecionado = 'colaborador';
let fotoBase64 = null;

// Alternar tipo
function setTipoCad(tipo) {
  tipoSelecionado = tipo;
  
  // Atualizar botões
  document.querySelectorAll('.pg-type-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tipo === tipo);
  });

  // Mostrar/ocultar campos específicos
  const campoDisciplina = document.getElementById('campo-disciplina');
  const campoDepartamento = document.getElementById('campo-departamento');
  
  if (tipo === 'gestor') {
    if (campoDisciplina) campoDisciplina.style.display = 'none';
    if (campoDepartamento) campoDepartamento.style.display = 'block';
  } else {
    if (campoDisciplina) campoDisciplina.style.display = 'block';
    if (campoDepartamento) campoDepartamento.style.display = 'none';
  }
}

// Preview de foto
function previewFoto(input) {
  if (!input.files || !input.files[0]) return;

  const file = input.files[0];
  
  // Validar tamanho (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Imagem muito grande. Máximo 5MB.');
    return;
  }

  // Validar tipo
  if (!file.type.startsWith('image/')) {
    toast.error('Arquivo deve ser uma imagem.');
    return;
  }

  const reader = new FileReader();
  
  reader.onload = (e) => {
    fotoBase64 = e.target.result;
    const preview = document.getElementById('foto-preview');
    preview.innerHTML = `<img src="${fotoBase64}" alt="Preview">`;
    preview.classList.add('has-image');
  };
  
  reader.readAsDataURL(file);
}

// Cadastrar pessoa
async function cadastrarPessoa() {
  // Verificar se é admin
  if (!auth.isAdmin()) {
    toast.error('Apenas administradores podem cadastrar usuários');
    return;
  }

  // Obter valores
  const ra = document.getElementById('cad-ra').value.trim();
  const nome = document.getElementById('cad-nome').value.trim();
  const email = document.getElementById('cad-email').value.trim();
  const senha = document.getElementById('cad-senha').value;
  const disciplina = document.getElementById('cad-disciplina')?.value.trim();
  const departamento = document.getElementById('cad-departamento')?.value.trim();

  // Validar campos
  const raField = document.getElementById('cad-ra');
  const nomeField = document.getElementById('cad-nome');
  const emailField = document.getElementById('cad-email');
  const senhaField = document.getElementById('cad-senha');

  let hasError = false;

  // Validar RA
  const raResult = validateField(raField, ['required', 'ra']);
  if (!raResult.isValid) {
    showFieldError(raField, raResult.message);
    hasError = true;
  }

  // Validar nome
  const nomeResult = validateField(nomeField, ['required', 'name']);
  if (!nomeResult.isValid) {
    showFieldError(nomeField, nomeResult.message);
    hasError = true;
  }

  // Validar email
  const emailResult = validateField(emailField, ['required', 'email']);
  if (!emailResult.isValid) {
    showFieldError(emailField, emailResult.message);
    hasError = true;
  }

  // Validar senha
  const senhaResult = validateField(senhaField, ['required', 'password']);
  if (!senhaResult.isValid) {
    showFieldError(senhaField, senhaResult.message);
    hasError = true;
  }

  if (hasError) {
    toast.error('Corrija os erros no formulário');
    return;
  }

  // Preparar dados
  const userData = {
    ra,
    nome,
    email,
    senha,
    tipo: tipoSelecionado,
  };

  if (tipoSelecionado === 'gestor' && departamento) {
    userData.departamento = departamento;
  }

  if (tipoSelecionado === 'colaborador' && disciplina) {
    userData.cargo = disciplina; // Usar cargo para armazenar disciplina
  }

  try {
    loading.show('Cadastrando...');

    // Cadastrar usuário
    const response = await api.register(userData);

    // Se tem foto, fazer upload
    if (fotoBase64 && response.data.id) {
      try {
        await api.uploadPhoto(response.data.id, fotoBase64);
      } catch (error) {
        console.error('Erro ao fazer upload da foto:', error);
        // Não bloquear o cadastro por erro na foto
      }
    }

    toast.success('Cadastrado com sucesso!');

    // Limpar formulário
    document.getElementById('cad-ra').value = '';
    document.getElementById('cad-nome').value = '';
    document.getElementById('cad-email').value = '';
    document.getElementById('cad-senha').value = '';
    if (disciplina) document.getElementById('cad-disciplina').value = '';
    if (departamento) document.getElementById('cad-departamento').value = '';
    
    // Resetar foto
    fotoBase64 = null;
    const preview = document.getElementById('foto-preview');
    preview.innerHTML = '<i class="fa-solid fa-camera"></i><span>Adicionar foto</span>';
    preview.classList.remove('has-image');

    // Limpar erros
    clearFieldError(raField);
    clearFieldError(nomeField);
    clearFieldError(emailField);
    clearFieldError(senhaField);

  } catch (error) {
    console.error('Erro ao cadastrar:', error);
    toast.error(error.message || 'Erro ao cadastrar');
  } finally {
    loading.hide();
  }
}

// Adicionar validação em tempo real
document.addEventListener('DOMContentLoaded', () => {
  // Verificar se é admin
  if (!auth.requireAdmin()) return;

  const raField = document.getElementById('cad-ra');
  const nomeField = document.getElementById('cad-nome');
  const emailField = document.getElementById('cad-email');
  const senhaField = document.getElementById('cad-senha');

  if (raField) addRealtimeValidation(raField, ['required', 'ra']);
  if (nomeField) addRealtimeValidation(nomeField, ['required', 'name']);
  if (emailField) addRealtimeValidation(emailField, ['required', 'email']);
  if (senhaField) addRealtimeValidation(senhaField, ['required', 'password']);
});
```

---

### TAREFA 3: Integrar página de consulta

**Criar `js/pages/consultar.js`:**

```javascript
// js/pages/consultar.js

let filtroAtual = 'todos';
let buscaAtual = '';
let pessoas = [];

// Carregar pessoas
async function carregarPessoas() {
  try {
    loading.show('Carregando pessoas...');

    const filters = {};
    if (filtroAtual !== 'todos') {
      filters.tipo = filtroAtual;
    }
    if (buscaAtual) {
      filters.search = buscaAtual;
    }

    const response = await api.getUsers(filters);
    pessoas = response.data.users || [];

    renderPessoas();

  } catch (error) {
    console.error('Erro ao carregar pessoas:', error);
    toast.error('Erro ao carregar pessoas');
  } finally {
    loading.hide();
  }
}

// Renderizar lista de pessoas
function renderPessoas() {
  const container = document.getElementById('lista-pessoas');
  if (!container) return;

  if (pessoas.length === 0) {
    container.innerHTML = '<p class="pg-empty">Nenhuma pessoa encontrada.</p>';
    return;
  }

  container.innerHTML = pessoas.map(pessoa => `
    <div class="pg-pessoa-card">
      <div class="pg-pessoa-avatar">
        ${pessoa.foto 
          ? `<img src="${pessoa.foto}" alt="${pessoa.nome}">`
          : `<span>${utils.getInitials(pessoa.nome)}</span>`
        }
      </div>
      <div class="pg-pessoa-info">
        <h4>${pessoa.nome}</h4>
        <p class="pg-pessoa-email">${pessoa.email}</p>
        <span class="pg-pessoa-badge ${pessoa.tipo}">${pessoa.tipo === 'gestor' ? 'Gestor' : 'Colaborador'}</span>
      </div>
      <div class="pg-pessoa-actions">
        <button class="pg-btn-icon" onclick="verPerfil('${pessoa.id}')" title="Ver perfil">
          <i class="fa-solid fa-eye"></i>
        </button>
        ${auth.isGestor() ? `
          <button class="pg-btn-icon danger" onclick="confirmarExclusao('${pessoa.id}', '${pessoa.nome}')" title="Excluir">
            <i class="fa-solid fa-trash"></i>
          </button>
        ` : ''}
      </div>
    </div>
  `).join('');
}

// Filtrar pessoas
function filtrarPessoas(filtro) {
  if (filtro) {
    filtroAtual = filtro;
    
    // Atualizar botões
    document.querySelectorAll('.pg-filtro').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filtro === filtro);
    });
  }

  // Obter busca
  const buscaInput = document.getElementById('busca');
  if (buscaInput) {
    buscaAtual = buscaInput.value.trim();
  }

  carregarPessoas();
}

// Debounce para busca
const debouncedFilter = utils.debounce(filtrarPessoas, 500);

// Ver perfil
function verPerfil(id) {
  window.location.href = `/perfil.html?id=${id}`;
}

// Confirmar exclusão
function confirmarExclusao(id, nome) {
  if (confirm(`Deseja realmente excluir ${nome}?`)) {
    excluirPessoa(id);
  }
}

// Excluir pessoa
async function excluirPessoa(id) {
  try {
    loading.show('Excluindo...');

    await api.deleteUser(id);

    toast.success('Pessoa excluída com sucesso');
    carregarPessoas();

  } catch (error) {
    console.error('Erro ao excluir:', error);
    toast.error(error.message || 'Erro ao excluir pessoa');
  } finally {
    loading.hide();
  }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  carregarPessoas();

  // Adicionar evento de busca
  const buscaInput = document.getElementById('busca');
  if (buscaInput) {
    buscaInput.addEventListener('input', debouncedFilter);
  }
});
```

**CSS necessário:**
```css
/* Adicionar em css/pages.css */
.pg-pessoa-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--surface);
  padding: 16px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border);
  margin-bottom: 12px;
  transition: all 0.2s;
}

.pg-pessoa-card:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow-sm);
}

.pg-pessoa-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
  overflow: hidden;
}

.pg-pessoa-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pg-pessoa-info {
  flex: 1;
}

.pg-pessoa-info h4 {
  margin: 0 0 4px 0;
  color: var(--primary);
  font-size: 15px;
  font-weight: 600;
}

.pg-pessoa-email {
  margin: 0 0 6px 0;
  color: var(--text-muted);
  font-size: 13px;
}

.pg-pessoa-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pg-pessoa-badge.gestor {
  background: #dbeafe;
  color: #1e40af;
}

.pg-pessoa-badge.colaborador {
  background: #d1fae5;
  color: #065f46;
}

.pg-pessoa-actions {
  display: flex;
  gap: 8px;
}

.pg-btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1.5px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
  margin: 0;
}

.pg-btn-icon:hover {
  background: #f0f9ff;
  color: var(--primary);
  border-color: var(--primary-light);
  transform: none;
  box-shadow: none;
}

.pg-btn-icon.danger {
  color: var(--danger);
  border-color: #fecaca;
}

.pg-btn-icon.danger:hover {
  background: #fff5f5;
  border-color: var(--danger);
}

.pg-empty {
  text-align: center;
  color: var(--text-muted);
  padding: 40px 20px;
  font-size: 14px;
}
```

---

### TAREFA 4: Atualizar Dashboard

**Criar `js/pages/dashboard.js`:**

```javascript
// js/pages/dashboard.js

async function carregarDashboard() {
  try {
    loading.show('Carregando dashboard...');

    const response = await api.getDashboard();
    const data = response.data;

    renderDashboardStats(data);

  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
    
    // Mostrar mensagem de boas-vindas se não houver dados
    const container = document.getElementById('dash-stats');
    if (container) {
      container.innerHTML = `
        <div class="dash-welcome">
          <i class="fa-solid fa-users"></i>
          <h3>Bem-vindo ao Portal de Gestão de Pessoas!</h3>
          <p>Comece cadastrando gestores e colaboradores para usar o sistema.</p>
          <a href="pages/cadastrar.html" class="dash-welcome-btn">
            <i class="fa-solid fa-user-plus"></i> Cadastrar primeira pessoa
          </a>
        </div>
      `;
    }
  } finally {
    loading.hide();
  }
}

function renderDashboardStats(data) {
  const container = document.getElementById('dash-stats');
  if (!container) return;

  const { usuarios, avaliacoes, nineBox, competencias } = data;

  container.innerHTML = `
    <div class="dash-stat">
      <i class="fa-solid fa-user-tie"></i>
      <div>
        <span class="dash-stat-val">${usuarios.gestores}</span>
        <span class="dash-stat-label">Gestores</span>
      </div>
    </div>
    <div class="dash-stat">
      <i class="fa-solid fa-users"></i>
      <div>
        <span class="dash-stat-val">${usuarios.colaboradores}</span>
        <span class="dash-stat-label">Colaboradores</span>
      </div>
    </div>
    <div class="dash-stat">
      <i class="fa-solid fa-star"></i>
      <div>
        <span class="dash-stat-val">${avaliacoes.total}</span>
        <span class="dash-stat-label">Avaliações</span>
      </div>
    </div>
    <div class="dash-stat">
      <i class="fa-solid fa-th"></i>
      <div>
        <span class="dash-stat-val">${nineBox.total}</span>
        <span class="dash-stat-label">Nine Box</span>
      </div>
    </div>
  `;
}

// Carregar ao iniciar
document.addEventListener('DOMContentLoaded', carregarDashboard);
```

**Adicionar em `index.html`:**
```html
<script src="js/config.js"></script>
<script src="js/api.js"></script>
<script src="js/auth.js"></script>
<script src="js/utils.js"></script>
<script src="js/components/toast.js"></script>
<script src="js/components/loading.js"></script>
<script src="js/pages/dashboard.js"></script>
```

---

## ✅ Checklist de Implementação

- [ ] Criar `js/validators.js`
- [ ] Adicionar CSS de validação
- [ ] Criar `js/pages/cadastrar.js`
- [ ] Integrar cadastro com API
- [ ] Testar cadastro de gestor
- [ ] Testar cadastro de colaborador
- [ ] Testar upload de foto
- [ ] Criar `js/pages/consultar.js`
- [ ] Adicionar CSS de cards de pessoa
- [ ] Integrar consulta com API
- [ ] Testar filtros
- [ ] Testar busca
- [ ] Testar exclusão
- [ ] Criar `js/pages/dashboard.js`
- [ ] Integrar dashboard com API
- [ ] Testar dashboard
- [ ] Documentar no README

---

## 🧪 Como Testar

### 1. Testar Cadastro
1. Abrir `pages/cadastrar.html`
2. Preencher formulário
3. Tentar enviar com dados inválidos (ver erros)
4. Preencher corretamente e enviar
5. Verificar se aparece no backend

### 2. Testar Consulta
1. Abrir `pages/consultar.html`
2. Ver lista de pessoas
3. Testar filtros (Todos, Gestores, Colaboradores)
4. Testar busca por nome
5. Testar exclusão (se for gestor)

### 3. Testar Dashboard
1. Abrir `index.html`
2. Ver estatísticas
3. Verificar se números estão corretos

---

**Boa sorte! 🚀**