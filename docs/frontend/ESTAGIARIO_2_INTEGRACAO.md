# ESTAGIÁRIO FRONTEND 2 - Funcionalidades e Integração

## Sua Responsabilidade

Você vai integrar as páginas com a API e implementar todas as funcionalidades CRUD.

---

## Pré-requisitos

**IMPORTANTE**: Antes de começar, certifique-se de que:

1. **Backend está rodando** em `http://localhost:3000`
2. **CORS está configurado** no backend para aceitar requisições do frontend
3. **Estagiário 1** já criou os módulos base (`api.js`, `auth.js`, `loading.js`, `toast.js`)
4. **Frontend usa ES Modules** (import/export) - não use scripts inline

**Configuração CORS no Backend** (em `backend/src/app.js`):
```javascript
import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:5500', // URL do Live Server
  credentials: true
}));
```

**Estrutura de Módulos ES6**:
```javascript
// Importar módulos
import { usersApi } from '../js/api.js';
import { showToast } from '../js/components/toast.js';

// Exportar funções
export function minhaFuncao() { ... }
```

---

## Objetivos

1. Criar módulo de validações (incluindo RA e email .edu.br)
2. Integrar página de cadastro com API (apenas admin pode cadastrar)
3. Integrar página de consulta com API
4. Integrar avaliações com API (limite de 24 horas para edição/exclusão)
5. Implementar filtros e busca (incluindo busca por RA)
6. Melhorar feedback visual
7. Atualizar dashboard com dados reais
8. Implementar exportação CSV com UTF-8 BOM

**IMPORTANTE**: O sistema agora usa RA (Registro Acadêmico):
- Cada pessoa já tem seu RA (como CPF)
- No cadastro, a pessoa informa o RA dela
- Sistema valida o formato (5 a 10 caracteres alfanuméricos) e se não está duplicado
- Usado para buscar usuários: `GET /api/users/ra/:ra`
- Campo obrigatório no cadastro
- Email institucional (.edu.br) obrigatório

**Apenas ADMIN pode cadastrar novos usuários!**

**REGRAS DE AVALIAÇÕES:**
- Avaliações podem ser editadas/excluídas apenas nas primeiras **24 horas** após criação
- **Admin** pode editar/excluir a qualquer momento (sem limite de tempo)
- Após 24 horas, botão mostra "Prazo expirado" para usuários comuns
- Sistema anônimo: `avaliadorId` não é retornado na API (exceto para admin)

---

## Arquivos que você vai trabalhar

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

## Tarefas Detalhadas

### TAREFA 1: Criar validators.js

```javascript
// js/validators.js

const validators = {
  // Validar email institucional (.edu.br obrigatório)
  email(value) {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu\.br$/i.test(value.trim());
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

  // Validar RA (5 a 10 caracteres alfanuméricos)
  ra(value) {
    const trimmed = value.trim();
    return trimmed.length >= 5 && trimmed.length <= 10;
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
    email: 'Use um e-mail institucional (ex: nome@faculdade.edu.br)',
    password: 'Senha deve ter no mínimo 6 caracteres',
    name: 'Nome deve ter no mínimo 3 caracteres',
    number: 'Deve ser um número válido',
    range: `Valor deve estar entre ${params[0]} e ${params[1]}`,
    selected: 'Selecione uma opção',
    ra: 'RA deve ter entre 5 e 10 caracteres',
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

**1. Corrigir os tipos de usuário nos botões:**
```html
<!-- TIPO -->
<div class="pg-type-toggle" role="group">
  <button class="pg-type-btn active" data-tipo="colaborador" onclick="setTipoCad('colaborador')">
    <i class="fa-solid fa-user"></i> Colaborador
  </button>
  <button class="pg-type-btn" data-tipo="gestor" onclick="setTipoCad('gestor')">
    <i class="fa-solid fa-user-tie"></i> Gestor
  </button>
</div>
```

**2. Adicionar todos os campos obrigatórios:**
```html
<!-- FOTO -->
<div class="pg-foto-wrap">
  <div class="pg-foto-preview" id="foto-preview" onclick="document.getElementById('cad-foto').click()">
    <i class="fa-solid fa-camera"></i>
    <span>Adicionar foto (opcional)</span>
  </div>
  <input type="file" id="cad-foto" accept="image/*" style="display:none" onchange="previewFoto(this)">
</div>

<div class="pg-field">
  <label for="cad-ra">RA (Registro Acadêmico) *</label>
  <input type="text" id="cad-ra" placeholder="Ex: 1234567, RA2021001" maxlength="10" autocomplete="off">
  <small style="color: var(--text-muted); font-size: 12px;">5 a 10 caracteres alfanuméricos</small>
</div>

<div class="pg-field">
  <label for="cad-nome">Nome completo *</label>
  <input type="text" id="cad-nome" placeholder="Digite o nome completo" autocomplete="off">
</div>

<div class="pg-field">
  <label for="cad-email">E-mail *</label>
  <input type="email" id="cad-email" placeholder="nome@empresa.com">
</div>

<div class="pg-field">
  <label for="cad-senha">Senha *</label>
  <input type="password" id="cad-senha" placeholder="Mínimo 6 caracteres" autocomplete="new-password">
</div>

<div class="pg-field" id="campo-cargo">
  <label for="cad-cargo">Cargo</label>
  <input type="text" id="cad-cargo" placeholder="Ex: Analista, Desenvolvedor">
</div>

<div class="pg-field" id="campo-departamento" style="display:none">
  <label for="cad-departamento">Departamento</label>
  <input type="text" id="cad-departamento" placeholder="Ex: TI, RH, Financeiro">
</div>

<button class="pg-btn" onclick="cadastrarPessoa()">
  <i class="fa-solid fa-user-plus"></i> Cadastrar
</button>
```

**3. Adicionar scripts no final, antes de `</body>`:**
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
  const campoCargo = document.getElementById('campo-cargo');
  const campoDepartamento = document.getElementById('campo-departamento');
  
  if (tipo === 'gestor') {
    if (campoCargo) campoCargo.style.display = 'none';
    if (campoDepartamento) campoDepartamento.style.display = 'block';
  } else {
    if (campoCargo) campoCargo.style.display = 'block';
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
  const cargo = document.getElementById('cad-cargo')?.value.trim();
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

  if (tipoSelecionado === 'colaborador' && cargo) {
    userData.cargo = cargo;
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
    if (document.getElementById('cad-cargo')) document.getElementById('cad-cargo').value = '';
    if (document.getElementById('cad-departamento')) document.getElementById('cad-departamento').value = '';
    
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
        <p class="pg-pessoa-ra">RA: ${pessoa.ra}</p>
        <span class="pg-pessoa-badge ${pessoa.tipo}">${pessoa.tipo === 'gestor' ? 'Gestor' : 'Colaborador'}</span>
      </div>
      <div class="pg-pessoa-actions">
        <button class="pg-btn-icon" onclick="verPerfil('${pessoa.id}')" title="Ver perfil">
          <i class="fa-solid fa-eye"></i>
        </button>
        ${auth.isAdmin() ? `
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

.pg-pessoa-ra {
  margin: 0 0 6px 0;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
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

## Checklist de Implementação

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

## Como Testar

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

Qualquer dúvida, chama.


---

### TAREFA 5: Implementar Edição de Usuários

#### 5.1 Adicionar método update no api.js

Arquivo: `js/api.js` (adicionar método)

```javascript
class API {
  // ... métodos existentes ...

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async updateProfile(userData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async updateEvaluation(id, data) {
    return this.request(`/evaluations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateNineBox(id, data) {
    return this.request(`/ninebox/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateCompetency(id, data) {
    return this.request(`/competencies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}
```

---

#### 5.2 Criar modal de edição

**Adicionar no HTML (exemplo: `pages/consultar.html`):**

```html
<!-- Modal de Edição -->
<div id="modal-editar" class="modal" style="display:none">
  <div class="modal-content">
    <div class="modal-header">
      <h3>Editar Usuário</h3>
      <button class="modal-close" onclick="fecharModalEditar()">
        <i class="fa-solid fa-times"></i>
      </button>
    </div>
    
    <div class="modal-body">
      <div class="pg-field">
        <label for="edit-nome">Nome completo *</label>
        <input type="text" id="edit-nome" placeholder="Digite o nome completo">
      </div>

      <div class="pg-field">
        <label for="edit-email">E-mail *</label>
        <input type="email" id="edit-email" placeholder="nome@empresa.com">
      </div>

      <div class="pg-field">
        <label for="edit-cargo">Cargo</label>
        <input type="text" id="edit-cargo" placeholder="Ex: Analista, Desenvolvedor">
      </div>

      <div class="pg-field">
        <label for="edit-departamento">Departamento</label>
        <input type="text" id="edit-departamento" placeholder="Ex: TI, RH, Financeiro">
      </div>
    </div>

    <div class="modal-footer">
      <button class="pg-btn secondary" onclick="fecharModalEditar()">Cancelar</button>
      <button class="pg-btn" onclick="salvarEdicao()">Salvar</button>
    </div>
  </div>
</div>
```

**CSS do Modal (adicionar em `css/components.css`):**

```css
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--surface);
  border-radius: var(--radius);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  margin: 0;
  color: var(--primary);
  font-size: 18px;
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 20px;
  padding: 4px 8px;
  transition: color 0.2s;
}

.modal-close:hover {
  color: var(--danger);
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid var(--border);
}

.pg-btn.secondary {
  background: var(--border);
  color: var(--text);
}

.pg-btn.secondary:hover {
  background: var(--text-muted);
}
```

---

#### 5.3 Implementar lógica de edição

**Adicionar em `js/pages/consultar.js`:**

```javascript
let usuarioEditando = null;

// Abrir modal de edição
function abrirModalEditar(id) {
  const pessoa = pessoas.find(p => p.id === id);
  if (!pessoa) {
    toast.error('Pessoa não encontrada');
    return;
  }

  usuarioEditando = pessoa;

  // Preencher campos
  document.getElementById('edit-nome').value = pessoa.nome;
  document.getElementById('edit-email').value = pessoa.email;
  document.getElementById('edit-cargo').value = pessoa.cargo || '';
  document.getElementById('edit-departamento').value = pessoa.departamento || '';

  // Mostrar modal
  document.getElementById('modal-editar').style.display = 'flex';
}

// Fechar modal
function fecharModalEditar() {
  document.getElementById('modal-editar').style.display = 'none';
  usuarioEditando = null;
}

// Salvar edição
async function salvarEdicao() {
  if (!usuarioEditando) return;

  const nome = document.getElementById('edit-nome').value.trim();
  const email = document.getElementById('edit-email').value.trim();
  const cargo = document.getElementById('edit-cargo').value.trim();
  const departamento = document.getElementById('edit-departamento').value.trim();

  // Validar campos
  if (!nome) {
    toast.error('Nome é obrigatório');
    return;
  }

  if (!email) {
    toast.error('Email é obrigatório');
    return;
  }

  if (!validators.email(email)) {
    toast.error('Email inválido');
    return;
  }

  try {
    loading.show('Salvando...');

    const userData = {
      nome,
      email,
      cargo,
      departamento
    };

    // Chamar API para atualizar
    await api.updateUser(usuarioEditando.id, userData);

    toast.success('Usuário atualizado com sucesso!');
    
    // Fechar modal
    fecharModalEditar();

    // Recarregar lista
    carregarPessoas();

  } catch (error) {
    console.error('Erro ao atualizar:', error);
    toast.error(error.message || 'Erro ao atualizar usuário');
  } finally {
    loading.hide();
  }
}
```

---

#### 5.4 Adicionar botão de editar na listagem

**Atualizar função `renderPessoas()` em `js/pages/consultar.js`:**

```javascript
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
        <p class="pg-pessoa-ra">RA: ${pessoa.ra}</p>
        <span class="pg-pessoa-badge ${pessoa.tipo}">${pessoa.tipo === 'gestor' ? 'Gestor' : 'Colaborador'}</span>
      </div>
      <div class="pg-pessoa-actions">
        <button class="pg-btn-icon" onclick="verPerfil('${pessoa.id}')" title="Ver perfil">
          <i class="fa-solid fa-eye"></i>
        </button>
        ${auth.isGestorOrAdmin() ? `
          <button class="pg-btn-icon" onclick="abrirModalEditar('${pessoa.id}')" title="Editar">
            <i class="fa-solid fa-edit"></i>
          </button>
        ` : ''}
        ${auth.isAdmin() ? `
          <button class="pg-btn-icon danger" onclick="confirmarExclusao('${pessoa.id}', '${pessoa.nome}')" title="Excluir">
            <i class="fa-solid fa-trash"></i>
          </button>
        ` : ''}
      </div>
    </div>
  `).join('');
}
```

---

#### 5.5 Implementar edição de perfil próprio

**Criar `js/pages/perfil.js`:**

```javascript
// js/pages/perfil.js

let modoEdicao = false;

async function carregarPerfil() {
  try {
    loading.show('Carregando perfil...');

    const response = await api.getProfile();
    const user = response.data;

    // Preencher dados
    document.getElementById('perfil-nome').textContent = user.nome;
    document.getElementById('perfil-email').textContent = user.email;
    document.getElementById('perfil-ra').textContent = user.ra;
    document.getElementById('perfil-tipo').textContent = user.tipo === 'gestor' ? 'Gestor' : 'Colaborador';
    document.getElementById('perfil-cargo').textContent = user.cargo || '-';
    document.getElementById('perfil-departamento').textContent = user.departamento || '-';

    // Avatar
    const avatar = document.getElementById('perfil-avatar');
    if (user.foto) {
      avatar.innerHTML = `<img src="${user.foto}" alt="${user.nome}">`;
    } else {
      avatar.innerHTML = utils.getInitials(user.nome);
    }

  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    toast.error('Erro ao carregar perfil');
  } finally {
    loading.hide();
  }
}

function ativarEdicao() {
  modoEdicao = true;

  // Transformar textos em inputs
  const nome = document.getElementById('perfil-nome').textContent;
  const cargo = document.getElementById('perfil-cargo').textContent;
  const departamento = document.getElementById('perfil-departamento').textContent;

  document.getElementById('perfil-nome').innerHTML = `<input type="text" id="edit-perfil-nome" value="${nome}">`;
  document.getElementById('perfil-cargo').innerHTML = `<input type="text" id="edit-perfil-cargo" value="${cargo === '-' ? '' : cargo}">`;
  document.getElementById('perfil-departamento').innerHTML = `<input type="text" id="edit-perfil-departamento" value="${departamento === '-' ? '' : departamento}">`;

  // Mostrar botões de salvar/cancelar
  document.getElementById('btn-editar').style.display = 'none';
  document.getElementById('btn-salvar').style.display = 'inline-block';
  document.getElementById('btn-cancelar').style.display = 'inline-block';
}

function cancelarEdicao() {
  modoEdicao = false;
  carregarPerfil();

  // Mostrar botão de editar
  document.getElementById('btn-editar').style.display = 'inline-block';
  document.getElementById('btn-salvar').style.display = 'none';
  document.getElementById('btn-cancelar').style.display = 'none';
}

async function salvarPerfil() {
  const nome = document.getElementById('edit-perfil-nome').value.trim();
  const cargo = document.getElementById('edit-perfil-cargo').value.trim();
  const departamento = document.getElementById('edit-perfil-departamento').value.trim();

  if (!nome) {
    toast.error('Nome é obrigatório');
    return;
  }

  try {
    loading.show('Salvando...');

    const userData = {
      nome,
      cargo: cargo || null,
      departamento: departamento || null
    };

    await api.updateProfile(userData);

    toast.success('Perfil atualizado com sucesso!');
    
    modoEdicao = false;
    carregarPerfil();

    // Mostrar botão de editar
    document.getElementById('btn-editar').style.display = 'inline-block';
    document.getElementById('btn-salvar').style.display = 'none';
    document.getElementById('btn-cancelar').style.display = 'none';

  } catch (error) {
    console.error('Erro ao salvar perfil:', error);
    toast.error(error.message || 'Erro ao salvar perfil');
  } finally {
    loading.hide();
  }
}

// Carregar ao iniciar
document.addEventListener('DOMContentLoaded', () => {
  if (!auth.requireAuth()) return;
  carregarPerfil();
});
```

---

## Resumo - Operações CRUD Completas

Agora o frontend tem **todas as operações CRUD**:

### ✅ CREATE (Criar)
- `api.register(userData)` - Cadastrar usuário
- `api.createEvaluation(data)` - Criar avaliação
- `api.createNineBox(data)` - Criar Nine Box
- `api.createCompetency(data)` - Criar competência

### ✅ READ (Ler)
- `api.getUsers(filters)` - Listar usuários
- `api.getUserByRA(ra)` - Buscar por RA
- `api.getProfile()` - Ver perfil
- `api.getEvaluations(filters)` - Listar avaliações
- `api.getDashboard()` - Dashboard

### ✅ UPDATE (Atualizar)
- `api.updateUser(id, userData)` - Atualizar usuário
- `api.updateProfile(userData)` - Atualizar perfil próprio
- `api.updateEvaluation(id, data)` - Atualizar avaliação
- `api.updateNineBox(id, data)` - Atualizar Nine Box
- `api.updateCompetency(id, data)` - Atualizar competência

### ✅ DELETE (Deletar)
- `api.deleteUser(id)` - Deletar usuário
- `api.deleteEvaluation(id)` - Deletar avaliação
- `api.deleteNineBox(id)` - Deletar Nine Box
- `api.deleteCompetency(id)` - Deletar competência

**Frontend completo com CRUD total!** 🚀
