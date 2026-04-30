# FAQ - Backend

## Setup

**Q: Qual versão do Node usar?**
A: Node 18+

**Q: Como pegar a URL do Supabase?**
A:
1. Vai em supabase.com
2. Cria um projeto
3. Settings → Database
4. Copia a Connection String

**Q: Migration deu erro, e agora?**
A:
```bash
# Reseta tudo (cuidado, apaga dados)
npx prisma migrate reset

# Ou cria nova migration
npx prisma migrate dev --name nome_da_migration
```

## Prisma

**Q: Como ver os dados do banco?**
A:
```bash
npx prisma studio
```
Abre em http://localhost:5555

**Q: Como adicionar campo novo?**
A:
1. Edita `prisma/schema.prisma`
2. Roda `npx prisma migrate dev --name add_campo`
3. Roda `npx prisma generate`

**Q: Erro "Prisma Client not found"**
A:
```bash
npx prisma generate
```

## Autenticação

**Q: Como gerar JWT_SECRET?**
A:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Q: Token expira rápido demais**
A: No `.env`:
```env
JWT_EXPIRES_IN=30d
```

**Q: Como testar endpoint protegido no Postman?**
A:
1. Faz login: `POST /api/users/login`
2. Copia o token
3. Nas outras requests, adiciona header:
   - Key: `Authorization`
   - Value: `Bearer SEU_TOKEN`

**Q: O que vem no token JWT?**
A:
```javascript
{
  userId: "uuid",
  email: "usuario@empresa.com",
  tipo: "admin", // ou "gestor" ou "colaborador"
  ra: "1000000"
}
```

**Q: Como funciona o RA?**
A: RA = Registro Acadêmico (7 dígitos)
- Admin: `1000000` (fixo)
- Gestores: `2021XXX`
- Colaboradores: `2022XXX`

**Q: Como buscar por RA?**
A:
```bash
GET /api/users/ra/2021001
Authorization: Bearer {token}
```

## Erros comuns

**Q: Porta 3000 já em uso**
A: Muda no `.env`:
```env
PORT=3001
```

**Q: Cannot find module 'express'**
A:
```bash
npm install
```

**Q: Erro de validação Joi não aparece**
A: Verifica se tem o errorHandler no final do app.js:
```javascript
app.use(errorHandler);
```

**Q: P2002: Unique constraint failed**
A: Email ou RA duplicado. Verifica se já existe no banco.

**Q: 403 Forbidden**
A: Sem permissão. Verifica:
- Token válido?
- Tipo de usuário correto?
- Tentando acessar dados que não são seus?

## Validações

**Q: Como adicionar validação?**
A:
```javascript
const schema = Joi.object({
  campo: Joi.string()
    .min(3)
    .required()
    .messages({
      'string.min': 'Mínimo 3 caracteres',
      'any.required': 'Campo obrigatório'
    })
});
```

**Q: Campo opcional?**
A:
```javascript
campo: Joi.string().optional()
// ou
campo: Joi.string().allow(null, '')
```

## Relacionamentos

**Q: Como buscar usuário com avaliações?**
A:
```javascript
const user = await prisma.user.findUnique({
  where: { id },
  include: {
    avaliacoesRecebidas: true,
    avaliacoesFeitas: true
  }
});
```

**Q: Como filtrar por data?**
A:
```javascript
const avaliacoes = await prisma.evaluation.findMany({
  where: {
    data: {
      gte: new Date('2026-01-01'),
      lte: new Date('2026-12-31')
    }
  }
});
```

## Permissões

**Q: Quais são os 3 tipos?**
A:
- **Admin** (RA: 1000000) - Acesso total
- **Gestor** (RA: 2021XXX) - Avalia, cria Nine Box, vê equipe
- **Colaborador** (RA: 2022XXX) - Vê só próprio perfil

**Q: Como verificar tipo do usuário?**
A:
```javascript
// No middleware authMiddleware
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded; // decoded.tipo = 'admin' | 'gestor' | 'colaborador'
```

**Q: Colaborador pode criar avaliação?**
A: Não. Só gestor e admin.

**Q: Gestor pode deletar usuário?**
A: Não. Só admin.

**Q: Gestor pode atualizar avaliação de outro gestor?**
A: Não. Só o que ele criou. Admin pode atualizar qualquer uma.

**Q: Como implementar "gestor vê só sua equipe"?**
A:
```javascript
if (userTipo === 'gestor') {
  // Por enquanto, vê só o que criou
  // TODO: adicionar lógica de equipe
  return this.repository.findAll({
    ...filters,
    avaliadorId: userId
  });
}
```

**Q: Onde validar permissões?**
A: Em 2 lugares:
1. **Middleware** - Bloqueio inicial
```javascript
router.post('/', isAdminMiddleware, controller.create);
```
2. **Service** - Validação detalhada
```javascript
if (userTipo !== 'admin' && evaluation.avaliadorId !== userId) {
  throw new AppError('Sem permissão', 403);
}
```

## Sistema de RA

**Q: O que é RA?**
A: Registro Acadêmico - ID único de 7 dígitos

**Q: Como gerar RA?**
A: Segue o padrão:
- Admin: `1000000` (fixo)
- Gestores: `2021001`, `2021002`, `2021003`...
- Colaboradores: `2022001`, `2022002`, `2022003`...

**Q: RA pode mudar?**
A: Não. É único e imutável.

**Q: Como validar RA?**
A:
```javascript
const raSchema = Joi.string()
  .pattern(/^\d{7}$/)
  .required()
  .messages({
    'string.pattern.base': 'RA deve ter 7 dígitos'
  });
```

**Q: Como verificar se RA existe?**
A:
```javascript
const exists = await userRepository.raExists(ra);
if (exists) {
  throw new AppError('RA já cadastrado', 400);
}
```

## Testes

**Q: Como testar se tá rodando?**
A:
```bash
curl http://localhost:3000/health
```

**Q: Como popular banco com dados de teste?**
A:
```bash
npm run prisma:seed
```

## Boas práticas

**Q: Commitar .env?**
A: NÃO! Adiciona no `.gitignore`:
```
.env
node_modules/
```

**Q: Como organizar commits?**
A:
```bash
git commit -m "feat: adicionar endpoint de login"
git commit -m "fix: corrigir validação de email"
git commit -m "docs: atualizar README"
```

**Q: Service vs Repository?**
A:
- **Repository**: Só acesso ao banco (Prisma)
- **Service**: Lógica de negócio, validações

**Q: Como criar admin?**
A: Admin NÃO pode ser criado pela API. Só via seed:
```bash
npm run prisma:seed
```
Login: `admin@empresa.com` / `admin123` (RA: 1000000)

## Debug

**Q: Como ver logs do Prisma?**
A: No `.env`:
```env
DEBUG=prisma:*
```

**Q: Como debugar no VS Code?**
A: Cria `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "program": "${workspaceFolder}/backend/src/server.js",
      "envFile": "${workspaceFolder}/backend/.env"
    }
  ]
}
```
