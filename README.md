# Manhuabk

Plateforme de lecture de mangas, manhwas, manhuas et webtoons.

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS 4**
- **PostgreSQL** + **Prisma 6**
- **NextAuth v5** (credentials, sessions JWT)
- **Zod** (validation), **Vitest** (tests)
- i18n FR/EN

## Démarrage

1. Copier `.env.example` vers `.env` et renseigner `DATABASE_URL` (PostgreSQL).
2. Installer : `npm install`
3. Migrer : `npm run db:migrate`
4. Seed démo (données `is_demo: true`) : `npm run db:seed`
5. Lancer : `npm run dev`

Compte de démo créé par le seed : `admin@manhuabk.dev` / `demo-password` (rôle ADMIN, à changer en production).

## Administration

Rôle **EDITOR** ou **ADMIN** requis (l'interface redirige sinon). Accès via `/admin` :

- **Tableau de bord** — stats réelles (séries, chapitres, utilisateurs).
- **Séries** — création / édition / suppression douce ; genres, métadonnées, visibilité.
- **Chapitres** — création, **import d'images** (JPEG/PNG/WebP, 10 Mo max, contrôle des magic bytes côté serveur), réordonnancement, publication.
- **Genres** — ajout / suppression (bloquée si utilisée).
- **Utilisateurs** (ADMIN) — changement de rôle.
- **Journal** — actions administratives (audit).

### Stockage des images

En dev, les images sont stockées sur disque dans `data/uploads/` et servies via `/api/images/[key]`. En production, brancher un stockage S3-compatible (Cloudflare R2) + CDN via les variables `S3_*` et `CDN_URL` — l'interface de stockage est isolée dans `src/modules/storage/`.

## Déploiement (Vercel)

Le projet est prêt pour Vercel (`vercel.json` configure `prisma migrate deploy` au build).

1. Pousser le dépôt sur Git (GitHub/GitLab/Bitbucket).
2. Importer le projet sur [vercel.com](https://vercel.com) (détection Next.js automatique).
3. Renseigner les **variables d'environnement** (Settings → Environment Variables) :

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | URL PostgreSQL (Neon) avec `?sslmode=require` |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL publique (ex. `https://manhuabk.vercel.app`) |
| `NEXT_PUBLIC_SITE_URL` | Même URL (SEO/canonical) |
| `APP_URL` | URL de base des liens de confirmation (ex. `https://manhuabk.vercel.app`) |
| `RESEND_API_KEY` | Clé API Resend (e-mail de confirmation) — voir ci-dessous |
| `EMAIL_FROM` | Adresse d'expédition (domaine vérifié Resend) |
| `S3_*`, `CDN_URL` | *(optionnel)* R2 pour les images — voir ci-dessous |

4. **Déployer** — les migrations s'appliquent automatiquement au build.

### Confirmation e-mail (Resend)

Chaque nouvelle inscription doit être confirmée par e-mail avant connexion. Configuration :

1. Créer un compte sur [resend.com](https://resend.com) puis une **clé API** (`RESEND_API_KEY`).
2. **Vérifier un domaine d'envoi** (Domains → Add Domain) et configurer les enregistrements DNS (SPF/DKIM) fournis. Sans domaine vérifié, Resend n'envoie qu'à ton adresse de compte avec l'expéditeur `onboarding@resend.dev`.
3. Définir `EMAIL_FROM` (ex. `Manhuabk <noreply@tondomaine.com>`).
4. Ajouter `RESEND_API_KEY`, `EMAIL_FROM` et `APP_URL` dans `.env` (dev) **et** dans les *Environment Variables* Vercel (prod).

> ⚠️ **Honnêteté** : sans `RESEND_API_KEY` valide, l'inscription **crée le compte mais n'envoie pas d'e-mail** (`emailSent: false`). La confirmation n'est possible qu'avec un Resend correctement configuré. Le lien de confirmation expire après **24 h** ; seuls l'empreinte SHA-256 du jeton sont stockés en base.

> 🗄️ **Comptes existants** : à l'introduction de la vérification, les comptes déjà présents ont été marqués comme vérifiés (backfill) afin de ne pas verrouiller l'accès. Seules les **nouvelles** inscriptions doivent confirmer.

> ⚠️ **Stockage images sur Vercel** : les fonctions serverless ont un système de fichiers **éphémère**. Le stockage local (`data/uploads/`) n'y **persiste pas** — les images importées via l'admin seront perdues. Pour un usage réel, brancher **Cloudflare R2** (voir `src/modules/storage/`) via les variables `S3_*` + `CDN_URL`. Le reste de l'app (catalogue, comptes, admin) fonctionne sans R2.

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run typecheck` | Vérification TypeScript |
| `npm run lint` | Lint ESLint |
| `npm run test` | Tests Vitest |
| `npm run db:migrate` | Migration Prisma (dev) |
| `npm run db:seed` | Seed de démonstration |
| `npm run db:studio` | Prisma Studio |

## Structure

```
src/
├── app/          # App Router (pages + API)
├── modules/      # Logique métier (auth, series, chapters, …)
├── lib/          # Prisma client, erreurs, logger, validations
├── auth/         # Config NextAuth + hashing
├── i18n/         # Dictionnaires FR/EN
└── components/   # UI partagée
prisma/           # Schéma + migrations + seed
```

## Notes

- Les données de démonstration sont marquées `is_demo: true`.
- Seuls des contenus dont les droits sont autorisés doivent être publiés.
- Aucun secret dans le dépôt : utiliser `.env` (ignoré par git).
