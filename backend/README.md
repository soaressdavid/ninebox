# Ninebox API

API da plataforma Ninebox com fluxo de avaliação 180°, autenticação via JWT e persistência com Prisma + PostgreSQL.

## Tecnologias utilizadas

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT
- bcryptjs

## Estrutura principal do domínio

A API está baseada no schema atual com as seguintes entidades principais:

- `users`
- `managers`
- `employees`
- `competencies`
- `evaluations`
- `evaluation_participants`
- `evaluation_competencies`
- `responses`

O identificador funcional dos usuários é o campo `registrationId`, que representa o **RA** tanto para gestor quanto para colaborador. O schema atual usa `registrationId` como único em `managers` e `employees`. A modelagem também separa competências por público (`EMPLOYEE` e `MANAGER`) e respostas por ator respondente/alvo. :contentReference[oaicite:3]{index=3}

---

## Base URL

```bash
http://localhost:3000/api
Variáveis de ambiente

Crie um arquivo .env com as variáveis abaixo:

DATABASE_URL="SUA_URL_DO_POSTGRES"
DIRECT_URL="SUA_URL_DIRETA_DO_POSTGRES"
TOKEN_SECRET="SEU_TOKEN_SECRET"
PORT=3000
Como rodar o projeto
1. Instalar dependências
npm install
2. Gerar o Prisma Client
npx prisma generate
3. Sincronizar schema com o banco
npx prisma db push
4. Rodar a aplicação
npm run dev
Autenticação

A autenticação é feita via login e retorna um token JWT.

Esse token deve ser enviado nas rotas protegidas no header:

Authorization: Bearer SEU_TOKEN
Endpoints da API
Auth
Login

POST /auth/login

Body
{
  "registrationId": "RA1001",
  "password": "123456",
  "role": "MANAGER"
}

ou

{
  "registrationId": "RA2001",
  "password": "123456",
  "role": "EMPLOYEE"
}
Retorno esperado
200 OK
token JWT
dados do usuário autenticado
Gestores
Listar gestores

GET /gestores

Buscar gestor por RA

GET /gestores/:ra

Criar gestor

POST /gestores

Body sugerido
{
  "nome": "Gestor Teste",
  "ra": "RA1001",
  "empresa": "Ninebox",
  "email": "gestor@ninebox.com",
  "senha": "123456"
}
Atualizar gestor

PUT /gestores/:ra

Body sugerido
{
  "nome": "Gestor Atualizado",
  "empresa": "Ninebox",
  "email": "gestor.atualizado@ninebox.com",
  "ativo": true
}
Avaliados
Listar avaliados

GET /avaliados

Listar avaliados por gestor

GET /avaliados?raGestor=RA1001

Buscar avaliado por RA

GET /avaliados/:ra

Criar avaliado

POST /avaliados

Body sugerido
{
  "nome": "Colaborador Teste",
  "ra": "RA2001",
  "empresa": "Ninebox",
  "ra_gestor": "RA1001",
  "email": "colaborador@ninebox.com",
  "senha": "123456"
}
Atualizar avaliado

PUT /avaliados/:ra

Body sugerido
{
  "nome": "Colaborador Atualizado",
  "empresa": "Ninebox",
  "ra_gestor": "RA1001",
  "email": "colaborador.atualizado@ninebox.com",
  "ativo": true
}
Remover avaliado

DELETE /avaliados/:ra

Competências

As competências são separadas por público:

EMPLOYEE
MANAGER

Essa separação está refletida no schema pelo campo audience de competencies e também em evaluation_competencies.

Listar competências

GET /competencias

Filtrar por público

GET /competencias?competenciaDe=EMPLOYEE

ou

GET /competencias?competenciaDe=MANAGER

Buscar competência por id

GET /competencias/:id

Criar competência

POST /competencias

Body sugerido
{
  "competencia": "Comunicação",
  "competenciaDe": "EMPLOYEE",
  "tipo": "Behavioral",
  "descricao": "Avalia a comunicação do colaborador.",
  "criterio1": "Comunicação excelente.",
  "criterio2": "Comunicação boa.",
  "criterio3": "Comunicação média.",
  "criterio4": "Comunicação precisa melhorar."
}
Atualizar competência

PUT /competencias/:id

Remover competência

DELETE /competencias/:id

Listar competências de colaboradores em uma avaliação

GET /competencias/avaliacao/:evaluationId/colaboradores

Listar competências de gestor em uma avaliação

GET /competencias/avaliacao/:evaluationId/gestor

Avaliações

A modelagem atual usa uma tabela única evaluations, com participantes em evaluation_participants e competências em evaluation_competencies. Isso substitui o fluxo antigo baseado em tabelas duplicadas de avaliação por tipo.

Listar avaliações

GET /avaliacoes

Filtrar por gestor

GET /avaliacoes?raGestor=RA1001

Filtrar por empresa

GET /avaliacoes?empresa=Ninebox

Buscar avaliação por id

GET /avaliacoes/:id

Criar avaliação

POST /avaliacoes

Body sugerido
{
  "nomeAvaliacao": "Avaliação 180 - Teste",
  "empresa": "Ninebox",
  "dataInicio": "2026-05-01",
  "dataFim": "2026-05-31",
  "descricao": "Avaliação 180 criada para testes.",
  "textoFinal": "Obrigado por responder.",
  "raGestor": "RA1001",
  "avaliados": [
    { "ra": "RA2001" }
  ],
  "competenciasColaboradores": [
    { "id": 3 },
    { "id": 4 }
  ],
  "competenciasGestor": [
    { "id": 1 },
    { "id": 2 }
  ],
  "status": "pending",
  "tipo": "180"
}
Atualizar avaliação

PUT /avaliacoes/:id

Remover avaliação

DELETE /avaliacoes/:id

Responses

O fluxo de responses foi implementado com Prisma e está baseado no schema atual, que diferencia:

quem responde (responderType)
quem é avaliado (targetType)
e o público da competência (audience)
Rotas do Colaborador
1) Login do Colaborador

POST /auth/login

Body
{
  "registrationId": "RA2001",
  "password": "123456",
  "role": "EMPLOYEE"
}
2) Pendências do Colaborador

GET /responses/employee/pending

Header
Authorization: Bearer TOKEN_DO_COLABORADOR
3) Acessar Avaliação do Colaborador

GET /responses/employee/ID_DA_AVALIACAO/form

Header
Authorization: Bearer TOKEN_DO_COLABORADOR
4) Enviar Resposta do Colaborador

POST /responses/employee/1

Headers
Authorization: Bearer TOKEN_DO_COLABORADOR
Content-Type: application/json
Body
[
  {
    "competencyId": 1,
    "score": 4,
    "observation": "Boa liderança."
  },
  {
    "competencyId": 2,
    "score": 3,
    "observation": "Pode melhorar feedback."
  }
]
Rotas do Gestor
1) Login do Gestor

POST /auth/login

Body
{
  "registrationId": "RA1001",
  "password": "123456",
  "role": "MANAGER"
}
2) Pendências do Gestor

GET /responses/manager/pending

Header
Authorization: Bearer TOKEN_DO_GESTOR
3) Acessar Avaliação do Gestor

GET /responses/manager/ID_DA_AVALIACAO/form

Header
Authorization: Bearer TOKEN_DO_GESTOR
4) Enviar Resposta do Gestor

POST /responses/manager/1

Headers
Authorization: Bearer TOKEN_DO_GESTOR
Content-Type: application/json
Body
[
  {
    "employeeId": 1,
    "answers": [
      {
        "competencyId": 3,
        "score": 4,
        "observation": "Ótima entrega."
      },
      {
        "competencyId": 4,
        "score": 3,
        "observation": "Boa comunicação."
      }
    ]
  }
]
Scripts úteis
Gerar client Prisma
npx prisma generate
Sincronizar banco
npx prisma db push
Abrir Prisma Studio
npx prisma studio
Rodar aplicação
npm run dev
Seeds de teste

Durante o desenvolvimento, foram usados scripts de apoio para:

criar usuário de teste
criar colaborador
criar avaliação
vincular participantes
vincular competências

Esses scripts podem ser mantidos na pasta scripts/ para facilitar novos testes locais.

Observações finais
Todas as rotas, exceto login, exigem autenticação via JWT.
O campo registrationId representa o RA.
O fluxo principal de resposta já foi validado com sucesso.
O projeto foi migrado do acesso manual via db.execute(...) para Prisma.
Qualquer resquício de tabelas legadas como avaliacoes_gestor, grupo_180 e similares deve ser removido do código restante.