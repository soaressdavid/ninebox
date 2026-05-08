# Índice da Documentação

## Comece aqui

### Backend
1. Leia [`BACKEND.md`](BACKEND.md) - Guia completo
2. Veja seu módulo abaixo

### Frontend
1. Leia [`FRONTEND.md`](FRONTEND.md) - Guia completo
2. Veja sua tarefa abaixo

---

## 📖 Documentação Principal

- [`COMECE_AQUI.md`](COMECE_AQUI.md) - **Ponto de entrada** (leia primeiro!)
- [`ATUALIZACOES.md`](ATUALIZACOES.md) - Registro de mudanças

---

## Backend

### Docs gerais
- [`BACKEND.md`](BACKEND.md) - Guia completo
- [`backend/FAQ.md`](backend/FAQ.md) - Perguntas frequentes
- [`backend/SCHEMA.prisma`](backend/SCHEMA.prisma) - Schema do banco
- [`backend/DIAGRAMAS.md`](backend/DIAGRAMAS.md) - Diagramas

### Por estagiário
- [`backend/ESTAGIARIO_1_USERS.md`](backend/ESTAGIARIO_1_USERS.md) - Usuários (autenticação, RA)
- [`backend/ESTAGIARIO_2_EVALUATIONS.md`](backend/ESTAGIARIO_2_EVALUATIONS.md) - Avaliações (Nine Box)
- [`backend/ESTAGIARIO_3_COMPETENCIES.md`](backend/ESTAGIARIO_3_COMPETENCIES.md) - Competências (relatórios)

---

## Frontend

### Docs gerais
- [`FRONTEND.md`](FRONTEND.md) - Guia completo
- [`frontend/FAQ.md`](frontend/FAQ.md) - Perguntas frequentes

### Por estagiário
- [`frontend/ESTAGIARIO_1_INFRAESTRUTURA.md`](frontend/ESTAGIARIO_1_INFRAESTRUTURA.md) - Infraestrutura (API, auth)
- [`frontend/ESTAGIARIO_2_INTEGRACAO.md`](frontend/ESTAGIARIO_2_INTEGRACAO.md) - Integração (CRUD, validações)

---

## Estrutura completa

```
docs/
├── INDICE.md                   # Este arquivo
├── COMECE_AQUI.md              # Ponto de entrada
├── BACKEND.md                  # Guia backend
├── FRONTEND.md                 # Guia frontend
├── ATUALIZACOES.md             # Registro de mudanças
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

## Fluxo de trabalho

### Backend
1. Ler [`BACKEND.md`](BACKEND.md)
2. Ler doc do seu módulo
3. Configurar ambiente
4. Implementar (Controller → Service → Repository)
5. Testar no Postman
6. Fazer PR

### Frontend
1. Ler [`FRONTEND.md`](FRONTEND.md)
2. Ler doc da sua tarefa
3. Configurar ambiente
4. Implementar módulos
5. Testar no navegador
6. Fazer PR

---

## Ajuda

- **Backend**: Ver [`backend/FAQ.md`](backend/FAQ.md)
- **Frontend**: Ver [`frontend/FAQ.md`](frontend/FAQ.md)
- **Dúvidas**: Perguntar no daily
