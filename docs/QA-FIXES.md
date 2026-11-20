# HOLYDO MARKET — Correctifs P0/P1 après QA

**Date :** 19 novembre 2026  
**Branche :** `fix/qa-p0-p1` (locale, aucun push)  
**Base :** `4edf5f4` + `d86a0a5` (rapport QA v1.2)

---

## Résultat

Les deux bloquants P0 sont corrigés et vérifiés sur un build de production. Les P1 sécurité, recherche, avis et accessibilité sont corrigés. Le parcours prestataire est maintenant disponible en français.

| Point QA | Statut |
| --- | --- |
| P0-1 Photos prestataires cassées en production | ✅ Corrigé |
| P0-2 Emails / réinitialisation non délivrés | ✅ Code corrigé, testé avec SMTP local |
| P1-1 FR prestataire / onboarding / dashboard | ✅ Corrigé |
| P1-2 Absence de rate limit connexion | ✅ Corrigé |
| P1-3 Catégories sans quartier → 0 résultat | ✅ Corrigé |
| P1-4 Contrastes WCAG | ✅ Corrigé sur les pages auditées |
| P1-5 ARIA / landmarks / lien d’évitement | ✅ Corrigé sur les pages auditées |
| P1-6 Avis sans rendez-vous terminé | ✅ Corrigé |
| P2 admin recherche/édition/suppression | ⏳ Reste à faire |
| P2 chargement / Redis / CAPTCHA / vérification email | ⏳ Reste à faire |

---

## P0-1 — Stockage des photos

**Avant :** les fichiers étaient écrits dans `public/uploads` après le build ; Next.js ne les servait pas → `404`, image cassée sur le profil public.

**Après :**
- Les fichiers sont écrits dans `storage/uploads` (hors `public/`).
- `app/uploads/[...path]/route.ts` sert les images avec validation du nom, `Content-Type`, cache immutable et fallback legacy `public/uploads`.
- La suppression d’une photo supprime aussi le fichier.
- `next/image` fonctionne via `/_next/image?url=%2Fuploads%2F…`.

**Vérifié :**
- upload réel d’un PNG ;
- URL directe `/uploads/…` → `200 image/png` ;
- optimiseur Next → `200` ;
- image rendue sur le profil public (`naturalWidth = 300`) ;
- aucun 404/400 sur l’image.

**Preuve :** [`upload-fixed.png`](qa-fixes/upload-fixed.png)

**Limite restante :** le disque local doit être un volume persistant en production ; S3/Cloudinary reste recommandé pour le serverless et les déploiements multi-instances.

---

## P0-2 — Emails et réinitialisation

**Avant :** tout restait `QUEUED` dans `/admin/emails` ; aucun email ne partait.

**Après :**
- `lib/email.ts` : transport **Resend** (`RESEND_API_KEY`) ou **SMTP** (`SMTP_HOST`, port, auth, TLS), avec timeout.
- `queueEmail` tente l’envoi et enregistre `SENT` / `FAILED` + `sentAt` / `error`.
- `/admin/emails` affiche le transport, les statuts, le nombre envoyé, et permet **Retry** / **Retry all**.
- `SITE_URL` (runtime) est prioritaire sur `NEXT_PUBLIC_SITE_URL` pour les liens de reset.
- `.env.example` documente Resend, SMTP, `EMAIL_FROM` et `SITE_URL`.

**Vérifié avec un serveur SMTP local de capture :**
- 15 emails envoyés, statut `SENT` ;
- email de reset reçu avec lien `http://localhost:3001/reset-password?token=…` ;
- token à usage unique, reset et login réussis ;
- bouton de retry admin testé.

**Limite restante :** il faut fournir les identifiants Resend/SMTP en production. Aucun worker asynchrone, gestion de bounce ou vérification d’email n’est encore branché.

---

## P1-1 — FR prestataire

**Avant :** `/provider/join`, l’onboarding et le dashboard restaient en anglais.

**Après :**
- 381 clés ajoutées en EN/FR (1 151 clés par locale) ;
- sélecteur de langue dans join, onboarding et dashboard ;
- 14 formulaires `ActionForm` localisés ;
- labels de statuts, dates, prix, erreurs d’action prestataire en français ;
- navigation prestataire traduite.

**Vérifié :** dashboard FR « Content de vous revoir, Nadia. », page services FR, aucune régression EN.

**Reste en anglais :** l’admin interne (choix assumé), les contenus saisis par les prestataires, les noms de quartiers et les langues déclarées.

**Preuve :** [`fr-provider-dashboard-final.png`](qa-fixes/fr-provider-dashboard-final.png)

---

## P1-2 — Rate limiting connexion

- Limite par email + IP : **10 tentatives / 10 min**.
- Limite IP globale : **40 tentatives / 10 min**.
- Inscription : **5 / heure / IP**.
- Inscription prestataire : **5 / heure / IP**.
- Messages localisés EN/FR.

**Vérifié :** la 11e tentative retourne « Too many login attempts. Try again in 10 minutes. »

**Limite restante :** compteur en mémoire (redémarrage/multi-instance). Redis reste recommandé.

---

## P1-3 — Recherche sans quartier

**Avant :** `/search?category=cleaning` → 0 prestataire (rayon 5 km autour du centre).

**Après :** sans quartier, sans géolocalisation et sans rayon explicite, la recherche couvre **tout Montréal**. Les liens catégories, « Tout Montréal » et la recherche vide sont concernés.

**Vérifié :**
- `/search?category=cleaning` → **1 prestataire près de Montréal** ;
- `/search?category=repairs` → **1** ;
- `/search` → **13** ;
- état vide « Aucun prestataire à Montréal » ;
- carte élargie à 25 km en mode ville.

**Preuve :** [`category-cleaning-fixed.png`](qa-fixes/category-cleaning-fixed.png)

---

## P1-4 / P1-5 — Accessibilité

Corrections :
- contrastes : `paper/55`, `ink/55`, `ink/65`, `paper/50`, `paper/60` augmentés ; token `clay` assombri de `#c9502e` à `#a83f22` ;
- `role="img"` sur les étoiles avec `aria-label` ;
- suppression du `<main>` imbriqué du profil ;
- `h2` sr-only avant les cartes de recherche et les favoris ;
- `<main id="main" tabIndex={-1}>` : le lien d’évitement déplace maintenant le focus sur `MAIN` ;
- barre d’annonce en `<section aria-label>` ;
- asides filtres/carte étiquetés ;
- onboarding : landmarks, rail, aperçu et bande mobile étiquetés ;
- cibles tactiles principales agrandies (cœur, cloche, menu, langue).

**Axe : 0 violation** sur :
`/`, `/search`, `/providers/[slug]`, `/login`, `/for-providers`, `/how-it-works`, `/provider/dashboard`, `/provider/onboarding`, `/saved`, `/account`, `/admin`, `/admin/applications`, `/admin/reviews`, `/admin/emails`, `/admin/providers`.

**Preuve :** [`axe-final.json`](qa-fixes/axe-final.json)

**Limite restante :** certaines petites cibles tactiles et micro-textes restent à auditer manuellement ; un audit lecteur d’écran externe reste recommandé.

---

## P1-6 — Avis liés à un rendez-vous terminé

- `createReview` exige désormais une demande `COMPLETED` du client pour ce prestataire.
- Le formulaire n’est affiché que si cette condition est remplie ; sinon un message explique que les avis s’ouvrent après le rendez-vous.
- Les avis existants restent modérables par l’admin.

**Vérifié :** Amina voit le message de blocage sur Studio Kora (aucun rendez-vous terminé) et pas de formulaire ; les prestataires avec rendez-vous terminé conservent le formulaire (ou « déjà publié »).

---

## Vérifications finales

| Commande | Résultat |
| --- | --- |
| `npx tsc --noEmit` | ✅ |
| `npx eslint .` | ✅ |
| `npm test` | ✅ 61/61 |
| `npm run build` | ✅ |
| Axe pages auditées | ✅ 0 violation |
| Upload réel + image publique | ✅ |
| SMTP local + reset | ✅ |
| Rate limit login | ✅ |
| Catégories ville | ✅ |
| FR prestataire | ✅ |
| Mobile 390 px | ✅ aucun débordement |

---

## Reste à faire avant lancement public

1. Fournir les credentials Resend/SMTP et tester un vrai email.
2. Stockage durable (S3/Cloudinary ou volume persistant) pour les photos.
3. Admin : recherche, édition, suppression/suspension avec audit.
4. Redis pour le rate limit, CAPTCHA, vérification email, 2FA.
5. Squelettes de chargement et monitoring.
6. `hreflang`/URLs localisées, page d’erreur FR.
7. Audit accessibilité externe (lecteur d’écran, Safari/iOS/Firefox).
8. Postgres, sauvegardes, CSP, Sentry, politique de rétention.
