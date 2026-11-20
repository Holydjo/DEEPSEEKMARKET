# Déployer HOLYDO MARKET (staging)

Ce dépôt est une **application Next.js monolithique** : les pages, les Server Actions,
l’authentification et Prisma vivent dans le même projet. Il n’y a **pas** de dossier
`frontend/` + `backend/` ni d’API séparée à déployer sur Render.

Le plan le plus rapide pour un staging qui fonctionne **avec le code actuel** est donc :

```
Téléphone / navigateur ──▶ Render Web Service (Next.js, HTTPS)
                                   ├──▶ disque persistant /var/data (SQLite + photos)
                                   └──▶ Resend (emails)
```

> **Important :** ce dépôt utilise SQLite et stocke les photos sur disque. Il n’a pas encore
> d’adaptateur Cloudinary. Mettre `CLOUDINARY_URL` ne changera rien tant que le code n’est pas
> modifié. Pour un staging immédiat, utilisez le disque Render (option A). Pour une production
> durable, passez à PostgreSQL + un stockage objet (option B).

---

## Option A — Render, un seul service + disque persistant (recommandé pour ce dépôt)

Durée : environ 20–30 minutes. Un disque Render nécessite une instance **Starter** payante
(le plan gratuit n’a pas de disque persistant).

### 1. Créer le compte et le service

1. Créez un compte sur [render.com](https://render.com) et connectez GitHub.
2. **New → Web Service** → sélectionnez le dépôt `Holydjo/DEEPSEEKMARKET`, branche `main`.
3. Runtime : **Node**.
4. Build Command :

   ```bash
   npm ci && npx prisma generate && npm run build
   ```

5. Start Command :

   ```bash
   npm start -- -p $PORT
   ```

6. Health Check Path : `/`.
7. Ajoutez un **Disk** :
   - Name : `holydo-data`
   - Mount Path : `/var/data`
   - Size : 1 GB suffit pour un staging.

### 2. Variables d’environnement Render

Dans **Environment**, ajoutez :

| Variable | Valeur |
| --- | --- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `file:/var/data/holydo.db` |
| `UPLOAD_DIR` | `/var/data/uploads` |
| `SITE_URL` | `https://VOTRE-SERVICE.onrender.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://VOTRE-SERVICE.onrender.com` |
| `RESEND_API_KEY` | votre clé Resend |
| `EMAIL_FROM` | `HOLYDO MARKET <onboarding@resend.dev>` |

Si Prisma refuse le chemin SQLite absolu, essayez `file:///var/data/holydo.db`.

### 3. Première base et données de démo

Après le premier déploiement, ouvrez le **Shell** Render du service et lancez :

```bash
npx prisma db push
npm run db:seed
```

`db:seed` **efface et recrée** la base. Ne le relancez pas si vous avez déjà de vraies données.
Il crée aussi les comptes de démonstration connus (`admin@holydo.market` / `Admin123!`).

> Avant d’inviter qui que ce soit : connectez-vous à l’admin, utilisez « Mot de passe oublié »
> avec Resend, puis changez immédiatement le mot de passe de démonstration.

### 4. Vérifier

- ouvrez `https://VOTRE-SERVICE.onrender.com` ;
- connectez-vous avec un compte de démo ;
- créez un prestataire et **téléversez une photo** ;
- vérifiez que la photo reste visible après un redéploiement Render ;
- déclenchez un « mot de passe oublié » et vérifiez `/admin/emails` + la boîte Resend.

---

## Option B — Vercel + Neon + Cloudinary (production)

Cette option correspond à l’architecture de l’exemple (site sur Vercel, base managée,
photos Cloudinary), mais **elle demande deux modifications de code** avant d’être utilisable :

1. Passer Prisma de SQLite à PostgreSQL et créer des migrations ;
2. Ajouter un adaptateur Cloudinary (ou Vercel Blob) pour les uploads. Le code actuel écrit
   dans `storage/uploads` et sert les fichiers via `/uploads/[...path]` : sur Vercel, ce disque
   n’est ni persistant ni partagé entre instances.

### 1. PostgreSQL

Dans `prisma/schema.prisma` :

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Créez une base Neon (ou Render Postgres), puis générez la migration depuis votre machine :

```bash
DATABASE_URL="<url-postgres>" npx prisma migrate dev --name init
```

Commitez le dossier `prisma/migrations/`. Sur Vercel, le build doit exécuter :

```bash
npx prisma generate && npx prisma migrate deploy && npm run build
```

### 2. Stockage des photos

Le plus simple est d’ajouter un adaptateur Cloudinary dans `lib/uploads.ts` et
`app/actions/provider.ts` :

- upload du `Buffer` via `cloudinary.uploader.upload_stream` ;
- stockage de l’URL `https://res.cloudinary.com/...` dans `ProviderPhoto.url` ;
- suppression via `cloudinary.uploader.destroy` ;
- ajout du domaine Cloudinary dans `next.config.ts` (`images.remotePatterns`).

Tant que cela n’est pas fait, **ne déployez pas sur Vercel** : les photos seraient perdues.

### 3. Vercel

1. **Add New → Project** → importez `Holydjo/DEEPSEEKMARKET`.
2. Framework : Next.js. Root Directory : `.` (le projet est à la racine).
3. Build Command : `npx prisma generate && npx prisma migrate deploy && npm run build`.
4. Variables :

| Variable | Valeur |
| --- | --- |
| `DATABASE_URL` | URL Neon/Postgres |
| `SITE_URL` | `https://votre-site.vercel.app` |
| `NEXT_PUBLIC_SITE_URL` | `https://votre-site.vercel.app` |
| `RESEND_API_KEY` | clé Resend |
| `EMAIL_FROM` | `HOLYDO MARKET <onboarding@resend.dev>` |
| `CLOUDINARY_URL` | **après** ajout de l’adaptateur |

5. Déployez, puis testez le parcours complet.

---

## Resend — emails

Le code supporte **Resend directement** (`RESEND_API_KEY`) ou un SMTP classique
(`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`). Il n’utilise pas
`SMTP_URL`.

Avec Resend :

```env
RESEND_API_KEY="re_..."
EMAIL_FROM="HOLYDO MARKET <onboarding@resend.dev>"
SITE_URL="https://votre-site.example"
```

- Tant que votre domaine n’est pas vérifié dans Resend, `onboarding@resend.dev` ne peut
  envoyer qu’à **votre propre adresse email** : c’est suffisant pour un staging.
- Vérifiez `holydomarket.com` (ou votre domaine) avant d’inviter de vrais utilisateurs,
  puis remplacez `EMAIL_FROM`.
- Les messages non envoyés restent dans `/admin/emails` et peuvent être relancés.
- Sans transport configuré, les emails restent `QUEUED` ; l’application continue de fonctionner.

Avec un autre fournisseur SMTP :

```env
SMTP_HOST="smtp.brevo.com"
SMTP_PORT="587"
SMTP_USER="..."
SMTP_PASS="..."
SMTP_SECURE="0"
EMAIL_FROM="HOLYDO MARKET <hello@votre-domaine.com>"
```

---

## Adresse publique et cookies

- `SITE_URL` est utilisé dans les liens des emails (réinitialisation, notifications).
- `NEXT_PUBLIC_SITE_URL` est utilisé pour les URL canoniques et les métadonnées.
- En production HTTPS, les cookies de session et de langue sont `Secure`.
- En test HTTP sur une IP LAN (`http://192.168.x.x:3001`), ils sont automatiquement non
  `Secure` pour que le login et le switch FR fonctionnent.

---

## Tester sur téléphone

1. Ouvrez l’URL Render ou Vercel sur votre téléphone.
2. La géolocalisation fonctionne en HTTPS.
3. Installez la PWA :
   - iPhone/Safari : **Partager → Sur l’écran d’accueil** ;
   - Android/Chrome : **⋮ → Ajouter à l’écran d’accueil**.

---

## Checklist avant d’inviter de vrais utilisateurs

- [ ] Changer le compte admin de démonstration (`admin@holydo.market`).
- [ ] Supprimer ou remplacer les prestataires de démo.
- [ ] Vérifier le domaine Resend et mettre à jour `EMAIL_FROM`.
- [ ] Tester un vrai email de réinitialisation.
- [ ] Vérifier que les photos survivent à un redéploiement (disque Render ou Cloudinary).
- [ ] Sauvegarder la base (Render Postgres/Neon recommandé pour la production).
- [ ] Rédiger/faire relire les pages confidentialité et conditions.
- [ ] Vérifier `SITE_URL` et `NEXT_PUBLIC_SITE_URL`.
- [ ] Tester FR/EN, mobile, upload, demande, approbation admin.
- [ ] Configurer un monitoring (Sentry ou équivalent).

---

## Limites des plans gratuits

- **Render Web Service gratuit** : s’endort après ~15 minutes sans trafic ; la première requête
  peut prendre jusqu’à une minute. Il **ne fournit pas de disque persistant** : la base SQLite
  et les photos seraient perdues à chaque redéploiement/redémarrage. Utilisez une instance
  Starter avec disque, ou passez à Postgres + stockage objet.
- **Render PostgreSQL gratuit** : supprimé après 30 jours. Pour du staging durable, utilisez
  Neon/Supabase ou une offre payante.
- **Vercel gratuit** : convient à Next.js, mais le système de fichiers est éphémère ; il faut
  PostgreSQL + Cloudinary/Vercel Blob.
- **Resend gratuit** : quotas d’envoi et domaine `onboarding@resend.dev` limité à votre adresse.
- **Cloudinary gratuit** : quota mensuel ; à surveiller si beaucoup de photos.

---

## Dépannage

| Symptôme | Vérifier |
| --- | --- |
| Erreur 500 au démarrage | `DATABASE_URL`, présence du disque `/var/data`, `npx prisma db push` exécuté |
| Les photos disparaissent | disque Render monté sur `/var/data`, `UPLOAD_DIR=/var/data/uploads` |
| `404` sur `/uploads/...` | le fichier existe dans `UPLOAD_DIR`, le disque est bien monté |
| Emails `QUEUED` | `RESEND_API_KEY`/`SMTP_HOST`, `EMAIL_FROM`, domaine Resend vérifié |
| Email `FAILED` | ouvrir `/admin/emails`, lire l’erreur, corriger puis **Retry** |
| Connexion impossible | cookies `Secure` + HTTPS, `SITE_URL` correct, base initialisée |
| FR ne change pas | rechargement complet, URL `/locale/fr`, cookie `holydo_locale` |
| Admin inaccessible | `npm run db:seed` exécuté, compte `admin@holydo.market` changé |

---

## Ce qui n’est pas inclus

- pas de paiement, de dépôt ou de commission ;
- pas de vérification d’email, 2FA ou CAPTCHA ;
- pas de worker email asynchrone ni gestion des bounces ;
- pas de calendrier de disponibilité en temps réel ;
- pas d’app mobile native (PWA uniquement) ;
- pas d’intégration Cloudinary dans cette version.

Pour une mise en production réelle, traitez d’abord les points P2 du
[rapport de correctifs](docs/QA-FIXES.md) et du [rapport QA](docs/QA-REPORT.md).
