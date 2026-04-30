# 🚀 COMECE AQUI

## 📚 Documentação Organizada

A documentação está dividida em **2 arquivos principais** + documentos específicos por estagiário.

---

## 🎯 Leia Primeiro

### 🔧 Backend
**Arquivo único com tudo**: [`BACKEND.md`](BACKEND.md)

Contém:
- Setup completo
- Arquitetura (Controller → Service → Repository)
- **Sistema de permissões** (Admin/Gestor/Colaborador) 🆕
- **Sistema de RA** (7 dígitos únicos) 🆕
- **Tabela de permissões por endpoint** 🆕
- Exemplos de código
- Como testar

### 🎨 Frontend
**Arquivo único com tudo**: [`FRONTEND.md`](FRONTEND.md)

Contém:
- Setup completo
- Módulos principais (api.js, auth.js, validators.js)
- Sistema de permissões
- Exemplos de código
- Como testar

---

## 👥 Documentos por Estagiário

### Backend (3 pessoas)

| Estagiário | Módulo | Arquivo |
|------------|--------|---------|
| 1 | Usuários (autenticação, RA) | [`backend/ESTAGIARIO_1_USERS.md`](backend/ESTAGIARIO_1_USERS.md) |
| 2 | Avaliações (Nine Box) | [`backend/ESTAGIARIO_2_EVALUATIONS.md`](backend/ESTAGIARIO_2_EVALUATIONS.md) |
| 3 | Competências (relatórios) | [`backend/ESTAGIARIO_3_COMPETENCIES.md`](backend/ESTAGIARIO_3_COMPETENCIES.md) |

### Frontend (2 pessoas)

| Estagiário | Tarefa | Arquivo |
|------------|--------|---------|
| 1 | Infraestrutura (API, auth, loading) | [`frontend/ESTAGIARIO_1_INFRAESTRUTURA.md`](frontend/ESTAGIARIO_1_INFRAESTRUTURA.md) |
| 2 | Integração (CRUD, validações) | [`frontend/ESTAGIARIO_2_INTEGRACAO.md`](frontend/ESTAGIARIO_2_INTEGRACAO.md) |

---

## 📖 Documentos de Apoio

- [`backend/FAQ.md`](backend/FAQ.md) - Perguntas frequentes backend (atualizado com RA e permissões) 🆕
- [`frontend/FAQ.md`](frontend/FAQ.md) - Perguntas frequentes frontend
- [`backend/SCHEMA.prisma`](backend/SCHEMA.prisma) - Schema do banco de dados (com RA e admin) 🆕
- [`backend/DIAGRAMAS.md`](backend/DIAGRAMAS.md) - Diagramas visuais (com sistema de permissões) 🆕
- [`CHANGELOG.md`](CHANGELOG.md) - Registro de todas as atualizações 🆕

---

## 🗂️ Estrutura Final

```
docs/
├── START_HERE.md          ← Você está aqui
├── INDEX.md               ← Índice completo
├── BACKEND.md             ← 🔧 GUIA COMPLETO BACKEND
├── FRONTEND.md            ← 🎨 GUIA COMPLETO FRONTEND
│
├── backend/
│   ├── ESTAGIARIO_1_USERS.md
│   ├── ESTAGIARIO_2_EVALUATIONS.md
│   ├── ESTAGIARIO_3_COMPETENCIES.md
│   ├── SCHEMA.prisma
│   ├── DIAGRAMAS.md
│   └── FAQ.md
│
└── frontend/
    ├── ESTAGIARIO_1_INFRAESTRUTURA.md
    ├── ESTAGIARIO_2_INTEGRACAO.md
    └── FAQ.md
```

---

## ⚡ Início Rápido

### Backend
```bash
cd backend
npm install
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

### Frontend
```bash
npx serve .
# ou Live Server no VS Code
```

---

## 🎯 Seu Próximo Passo

1. **Backend?** → Leia [`BACKEND.md`](BACKEND.md)
2. **Frontend?** → Leia [`FRONTEND.md`](FRONTEND.md)
3. Depois, veja o documento do seu módulo específico

---

**Boa sorte! 🚀**
