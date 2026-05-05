# HOK Builds — Guia de Setup

## 1. Pré-requisitos

- Node.js 20+
- Conta no Supabase (só para storage de imagens)
- PostgreSQL rodando no EasyPanel (já configurado)

---

## 2. Configurar variáveis de ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
# PostgreSQL — URL interna do EasyPanel
DATABASE_URL=postgres://postgres:6xadfjw2a7ehp38y342e@hokbuilds_hokbuilds_db:5432/hokbuilds?sslmode=disable

# Supabase (vá em Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# JWT secret — gere com: openssl rand -base64 32
JWT_SECRET=cole-aqui-um-segredo-longo-e-aleatorio

# URL do seu site
NEXT_PUBLIC_BASE_URL=https://seudominio.com.br
```

---

## 3. Configurar o Supabase Storage

1. Acesse o Supabase → Storage → New bucket
2. Nome: `hok-assets`
3. Marque como **Public bucket**
4. Clique em Create

---

## 4. Rodar as migrations do banco

```bash
npm install
npm run db:migrate
```

---

## 5. Criar o usuário admin

```bash
node scripts/create-admin.js seuemail@gmail.com suaSenha SeuNome
```

---

## 6. Rodar localmente

```bash
npm run dev
```

Acesse:
- Site: http://localhost:3000
- Admin: http://localhost:3000/admin

---

## 7. Deploy no EasyPanel

### No EasyPanel:
1. Crie um novo serviço do tipo **App**
2. Conecte ao repositório GitHub: `GabrielSafe/hok-builds`
3. Branch: `main`
4. Build Command: `npm run build`
5. Start Command: `npm start`
6. Port: `3000`

### Variáveis de ambiente:
Adicione todas as variáveis do `.env.local` no painel de **Environment** do serviço.

### Domínio:
Configure o domínio no EasyPanel e aponte o DNS para a VPS no Cloudflare.

---

## 8. Estrutura de pastas no Supabase Storage

```
hok-assets/
├── heroes/
│   ├── luara/
│   │   ├── icon.webp      (64x64 — ícone da listagem)
│   │   └── splash.webp    (800x450 — banner da página)
│   └── loong/
│       ├── icon.webp
│       └── splash.webp
├── items/
│   └── nome-do-item.webp  (48x48)
├── arcana/
│   └── nome-arcana.webp   (48x48)
├── spells/
│   └── nome-feitico.webp  (48x48)
└── skills/
    └── luara/
        ├── passive.webp
        ├── 1.webp
        ├── 2.webp
        ├── 3.webp
        └── ult.webp
```

---

## 9. Fluxo para adicionar um herói

1. Acesse `/admin/heroes/new`
2. Preencha nome, função, dificuldade, descrição
3. Faça upload do ícone e splash art
4. Marque como publicado
5. Acesse `/admin/stats` para definir winrate e tier
6. Acesse `/admin/builds/new` para criar a build
7. Use o banco (via EasyPanel terminal ou cliente SQL) para adicionar itens à build

---

## 10. Adicionar itens ao banco (exemplo SQL)

```sql
-- 1. Inserir item
INSERT INTO items (name, slug, image_url, cost)
VALUES ('Guja das Sombras', 'guja-das-sombras', 'https://xxx.supabase.co/storage/v1/object/public/hok-assets/items/guja-das-sombras.webp', 2150);

-- 2. Pegar ID da build do herói
SELECT id FROM builds WHERE hero_id = (SELECT id FROM heroes WHERE slug = 'luara') AND is_recommended = true;

-- 3. Adicionar item à build (supondo build id=1, item id=1)
INSERT INTO build_items (build_id, item_id, sort_order) VALUES (1, 1, 1);
```
