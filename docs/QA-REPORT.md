# Rapport QA — HOLYDO MARKET v1.2

**Date :** 19 novembre 2026  
**Commit audité :** `4edf5f4` — *Add notifications, email outbox, password reset, request lifecycle, and FR localisation*  
**Environnement :** build de production (`next build` + `next start -p 3001`), SQLite seedée, Node 24, Chrome headless (1440 / 768 / 390 / 375 px)  
**Méthode :** QA read-only — aucun code modifié pendant la campagne. Les données de test ont été reseedées après la campagne.

---

## 1. Verdict

**Le parcours client est solide, mais le produit n’est pas prêt pour un lancement public.**

Deux problèmes bloquent une mise en production :

1. **Les photos téléversées par les prestataires ne s’affichent pas en production** : le fichier est bien écrit sur disque, mais l’URL publique retourne `404`. Un prestataire peut donc soumettre un profil avec une photo cassée.
2. **Les emails ne sont pas envoyés** : tout est mis en file dans `/admin/emails`, mais aucun SMTP n’est branché. La réinitialisation de mot de passe n’est donc pas utilisable par un vrai utilisateur.

Une **beta privée** est réaliste après correction de ces deux points et des principaux écarts P1 (FR prestataire, limitation des tentatives de connexion, accessibilité, catégories vides).

| Verdict | Détail |
| --- | --- |
| Démo locale / revue produit | ✅ Oui |
| Beta privée | ⚠️ Après P0 + P1 |
| Lancement public | ❌ Non — P0 ouverts |

---

## 2. Ce qui a été testé

| Persona | Parcours |
| --- | --- |
| Visiteur | Accueil, recherche, filtres, tri, pagination, carte, géolocalisation, profils, pages marketing, 404, FR/EN |
| Client | Inscription, connexion, favoris, demande de rendez-vous, suivi, reprogrammation, annulation, notifications, mot de passe oublié, déconnexion |
| Prestataire | Inscription, onboarding 7 étapes, services, photo, zone, horaires, soumission, approbation, édition, rejet, resoumission, suspension, déconnexion |
| Admin | File d’approbation, approbation, rejet avec note, suspension, réactivation, modération des avis, boîte d’envoi email, notifications |
| Mobile | 375 / 390 / 768 px, filtres, carte, débordement horizontal |
| Transverse | Autorisations, validation, liens/images, console, accessibilité axe, performance locale, FR/EN |

**Tests automatisés existants :** `54/54` tests Vitest passent. `tsc`, `eslint` et `next build` passent.

---

## 3. Problèmes prioritaires

### P0-1 — Les photos téléversées sont cassées en production

**Sévérité :** Critique — bloque une exigence centrale prestataire.

**Reproduction :**
1. Lancer le build de production : `npm run build && npm start`.
2. Créer un compte prestataire, remplir l’onboarding et téléverser un PNG valide.
3. Le compteur affiche `1 / 8`.
4. Ouvrir le profil public.

**Attendu :** la photo s’affiche.
**Réel :** image cassée sur le profil public ; la console réseau retourne `404` sur `/uploads/provider-….png` et `400` sur `/_next/image?url=%2Fuploads%2F…`.

**Cause observée :** les fichiers sont écrits dans `public/uploads` **après** le build. Next.js ne sert que les fichiers `public/` présents au moment du build (manifeste statique). En dev, cela fonctionne ; en production, non.

**Preuve :** [`qa/provider-public.png`](qa/provider-public.png) — la photo principale est cassée. Le nom concaténé du prestataire dans cette capture est un artefact du script QA, pas un bug produit.

**Correctif recommandé :**
- Stocker les fichiers hors de `public/` (par exemple `storage/uploads`) et les servir via un route handler, ou utiliser S3/Cloudinary ;
- vérifier l’URL publique **après un build de production** ;
- ajouter un test qui téléverse puis charge l’image sur le serveur built.

---

### P0-2 — La réinitialisation de mot de passe n’atteint pas l’utilisateur

**Sévérité :** Critique pour un lancement public (récupération de compte).

**Reproduction :** `/forgot-password` → saisir un email → succès. Rien n’est envoyé. Le lien n’existe que dans `/admin/emails` (statut `QUEUED`).

**Attendu :** un email transactionnel arrive dans la boîte du client.
**Réel :** aucun SMTP/worker ; seul un admin peut copier le lien depuis l’outbox.

**Point de configuration associé :** `NEXT_PUBLIC_SITE_URL` vaut `http://localhost:3000` dans `.env`. Pendant la QA sur `3001`, tous les liens de reset pointaient donc vers `3000` (`ERR_CONNECTION_REFUSED`). En production, cette variable doit être l’URL publique exacte.

**Correctif recommandé :** brancher Resend/Postmark/SES + worker, gérer les statuts `SENT/FAILED`, les relances et les bounces ; définir `NEXT_PUBLIC_SITE_URL` par environnement ; tester avec Mailpit en CI.

**Note :** le flux lui-même fonctionne quand on remplace le port : lien valide une heure, usage unique, sessions supprimées, ancien token invalide. Testé avec succès.

---

### P1-1 — La localisation FR s’arrête au site client

**Sévérité :** Élevée par rapport à la promesse « option FR pour les utilisateurs francophones ».

**Reproduction :** passer en FR, se connecter comme prestataire (`nadia@example.com`).
**Réel :** le dashboard prestataire est entièrement en anglais ; aucun sélecteur de langue. `/provider/join` et `/provider/onboarding` sont aussi en anglais. L’admin reste en anglais.

**Preuve :** [`qa/fr-provider-dashboard.png`](qa/fr-provider-dashboard.png) — « Good to see you, Nadia. »

**Impact :** un prestataire francophone quitte un site français pour un formulaire anglais dès qu’il clique « Inscrire mon service ».

**Correctif recommandé :** traduire au minimum `provider/join`, l’onboarding et le dashboard, ou afficher une frontière de langue explicite + un sélecteur. Traduire aussi les erreurs serveur prestataire (le mapping actuel couvre surtout le client).

---

### P1-2 — Aucune limitation des tentatives de connexion

**Sévérité :** Élevée (sécurité).

**Constat :** `app/actions/auth.ts` ne contient aucun `rateLimit` sur `loginAction`. Les tentatives de mot de passe peuvent être répétées sans blocage, backoff ni CAPTCHA. Les sessions durent 30 jours.

**Impact :** credential stuffing / brute force.

**Correctif :** rate limit par IP + email, backoff exponentiel, journal d’audit, CAPTCHA après N échecs, 2FA optionnelle. Ajouter aussi une limite à l’inscription.

---

### P1-3 — Les liens « catégorie » renvoient 0 résultat

**Sévérité :** Élevée pour la découverte.

**Reproduction :**
- Depuis l’accueil, cliquer « Cleaning » → `/search?category=cleaning` → **0 prestataire près du centre-ville**.
- `/search?category=repairs` → **0**.
- Pourtant l’accueil affiche « Cleaning 1 » et « Repairs 1 ».

**Cause :** sans quartier, la recherche part du centre-ville avec un rayon de 5 km. Les prestataires concernés sont à environ 5,2–5,4 km.

**Preuve :** [`qa/category-cleaning-empty.png`](qa/category-cleaning-empty.png).

**Correctif :** quand aucune localisation n’est choisie, chercher à l’échelle de la ville (sans rayon) ou utiliser un rayon par défaut de 10–25 km ; aligner les compteurs de catégories sur les résultats réels.

---

### P1-4 — Contraste insuffisant (WCAG AA)

**Sévérité :** Élevée (accessibilité).

Axe signale des violations `color-contrast` **sérieuses** :

| Page | Élément | Ratio | Attendu |
| --- | --- | --- | --- |
| Accueil | « Why you can relax a little » | 4,35:1 | 4,5:1 |
| Accueil | « For independent providers… » | 3,37:1 | 4,5:1 |
| Accueil | « Takes about 12 minutes… » | 4,39:1 | 4,5:1 |
| Connexion | libellés `text-paper/50` (9 px) | 3,59:1 | 4,5:1 |
| Connexion | note `prisma/seed.ts` | 3,87:1 | 4,5:1 |
| Accueil FR | mêmes blocs | mêmes ratios | 4,5:1 |

**Correctif :** augmenter l’opacité/assombrir les tokens (`paper/55`, `ink/55`, `ink/65`, `paper/50`), vérifier avec axe à chaque page.

**Preuves :** [`qa/axe-report.json`](qa/axe-report.json), [`qa/axe-detail.json`](qa/axe-detail.json).

---

### P1-5 — ARIA, landmarks et lien d’évitement

**Sévérité :** Moyenne à élevée.

1. **Attribut ARIA interdit** : des `span` de note portent `aria-label="4.9 out of 5"` sans rôle. Axe : `aria-prohibited-attr` (sérieux, 4 occurrences sur le profil).
2. **Deux `<main>` imbriqués** sur le profil : `landmark-main-is-top-level`, `landmark-no-duplicate-main`, `landmark-unique`.
3. **Ordre des titres** sur la recherche : un `h3` de carte suit directement le `h1` (pas de `h2`).
4. **Région** : la barre supérieure n’est pas dans un landmark (`region`).
5. **Lien d’évitement** : premier Tab = « Skip to content » ✅ ; Entrée met `#main` dans l’URL mais le focus reste sur `BODY`, pas sur `<main>`. Ajouter `tabIndex={-1}` et focaliser la cible.

**Cibles tactiles :** 59 éléments interactifs sous 44×44 px sur le profil (dont des liens inline) ; les contrôles principaux (cœur, langue, petits boutons) méritent 44 px.

**Typographie :** nombreuses tailles 8,5–10 px ; lisibilité insuffisante pour du contenu clé.

---

### P1-6 — Avis ouverts à tout compte connecté

**Sévérité :** Élevée pour la confiance (revue de code).

`createReview` exige seulement une session ; il ne vérifie un rendez-vous `COMPLETED` que pour marquer `isVerified`. Un compte connecté peut donc publier un avis non vérifié sur n’importe quel prestataire approuvé et modifier sa note, une fois par prestataire.

**Correctif :** exiger une demande complétée (ou une invitation de review), ou afficher clairement « non vérifié » et modérer par défaut ; conserver la limite de débit.

---

### P2-1 — Admin : pas de recherche / édition / suppression de prestataire

**Sévérité :** Moyenne (fonctionnalité manquante).

`/admin/providers` ne propose ni champ de recherche, ni édition, ni suppression. Les actions disponibles sont : examiner, suspendre, réactiver, modérer les avis. La suppression doit être un soft delete anonymisé avec audit, pas un `DELETE` brutal.

---

### P2-2 — Pas d’états de chargement

Aucun `loading.tsx`. Sur la recherche, `networkidle2` a pris **3,8 s** lors de la QA (carte OSM), avec un `DOMContentLoaded` autour de 1,8 s. Ajouter des squelettes pour les cartes, la carte et les dashboards ; streamer les sections lentes.

---

### P2-3 — Rate limiting en mémoire

Le rate limit est dans le processus : un redémarrage le remet à zéro et plusieurs instances ne le partagent pas. Pour la production : Redis/Upstash, clés par IP/utilisateur, et CAPTCHA sur les formulaires publics.

---

### P2-4 — Abus et vérification de compte

- Pas de CAPTCHA sur inscription/connexion/demande.
- Pas de vérification d’email.
- Mot de passe : minimum 8 caractères, pas de contrôle de fuite.
- Pas de 2FA.
- Les demandes de rendez-vous sont rate-limitées, mais les emails prestataires peuvent être spammés.

---

### P2-5 — Points mineurs

- `app/error.tsx` reste en anglais en mode FR.
- Locale par cookie, pas de routes `/fr` ni `hreflang` : le contenu FR est mal exposé aux moteurs.
- Page notifications limitée à 60 éléments, pas de pagination ni de lecture individuelle.
- Pas de renvoi d’email depuis l’admin.
- Validation d’upload basée sur le MIME déclaré ; pas de scan antivirus/dimensions.
- Pas de suppression de compte ni de gestion des sessions/appareils.
- Pas de paiement, pas d’app native, pas de calendrier de disponibilité — hors périmètre v1, à documenter.
- `NEXT_PUBLIC_SITE_URL` et l’URL réelle du serveur doivent être alignés (cf. P0-2).
- Textes légaux (confidentialité, conditions, rétention) encore à finaliser.

---

## 4. Tests passés

| # | Test | Résultat |
| --- | --- | --- |
| A1 | Accueil, recherche, profil, pages marketing, auth, 404 | ✅ 200 ; 404 correct |
| A2 | Recherche : filtres type/lieu/prix/note, tri prix/note, open now, pagination, géolocalisation | ✅ |
| A3 | État sans résultat + extension du rayon + réinitialisation | ✅ |
| A4 | Filtres et carte sur mobile 390 px | ✅ pas de débordement |
| A5 | Demande de rendez-vous invitée → confirmation | ✅ |
| A6 | Reprogrammation → retour en attente → annulation | ✅ |
| A7 | Favoris : ajout/retrait, page privée | ✅ |
| A8 | Notifications : badge, lecture, tout marquer comme lu | ✅ (rafraîchissement ~3 s) |
| A9 | Mot de passe oublié → outbox → reset → login, token réutilisé refusé | ✅ (hors envoi email réel) |
| A10 | Autorisations invité/client/prestataire/admin, open redirect | ✅ |
| B1 | Inscription prestataire + onboarding 7 étapes + soumission | ✅ |
| B2 | Upload photo | ❌ photo 404 en production |
| B3 | Approbation admin → profil public + recherche | ✅ |
| B4 | Édition du prix d’un service → profil public | ✅ |
| B5 | Rejet avec note → dashboard + resoumission | ✅ |
| B6 | Suspension → 404 public → réactivation → 200 | ✅ |
| C1 | File d’approbation, approbation, rejet | ✅ |
| C2 | Modération d’avis hide/publish + recalcul | ✅ |
| C3 | Outbox email et notification admin | ✅ (queued) |
| C4 | Recherche/édition/suppression prestataire admin | ❌ absent |
| D1 | Liens internes | ✅ 92 liens, 0 cassé |
| D2 | Images seedées + lazy loading | ✅ |
| D3 | Console/hydratation | ✅ 0 erreur applicative ; 404/400 attendus sur la photo QA |
| D4 | Mobile 375/390/768 | ✅ aucun débordement |
| D5 | Accessibilité axe | ❌ contrastes, ARIA, landmarks |
| D6 | Lien d’évitement clavier | ❌ focus non déplacé |
| D7 | FR client | ✅ pages, erreurs, emails, notifications, 404 |
| D8 | FR prestataire/admin | ❌ anglais |
| D9 | Performance locale | ⚠️ correcte hors carte ; pas de Lighthouse |
| D10 | Tests unitaires | ✅ 54/54 |

---

## 5. Captures et preuves

- Photo cassée : [`qa/provider-public.png`](qa/provider-public.png)
- Dashboard prestataire en FR mais anglais : [`qa/fr-provider-dashboard.png`](qa/fr-provider-dashboard.png)
- Catégorie Cleaning vide : [`qa/category-cleaning-empty.png`](qa/category-cleaning-empty.png)
- État sans résultat : [`qa/search-empty.png`](qa/search-empty.png)
- Filtres mobile : [`qa/mobile-filter-open.png`](qa/mobile-filter-open.png)
- Carte mobile : [`qa/mobile-map.png`](qa/mobile-map.png)
- Rejet prestataire + note : [`qa/provider-rejected.png`](qa/provider-rejected.png)
- Notification admin : [`qa/admin-notification.png`](qa/admin-notification.png)
- Accueil FR : [`qa/fr-home-final.png`](qa/fr-home-final.png)
- Notifications FR : [`qa/fr-notifications-provider.png`](qa/fr-notifications-provider.png)
- Données axe : [`qa/axe-report.json`](qa/axe-report.json), [`qa/axe-detail.json`](qa/axe-detail.json)
- Crawl public : [`qa/public-report.json`](qa/public-report.json)
- Liens : [`qa/link-report.json`](qa/link-report.json)
- Mobile : [`qa/mobile-report.json`](qa/mobile-report.json)

*Les captures prestataire contiennent le nom de test « QA TesterQA Braid Studio » dû à la saisie du script QA ; ce n’est pas un bug produit.*

---

## 6. Tests automatisés à ajouter

1. **Playwright — parcours client** : accueil → recherche → profil → demande → reprogrammation → annulation ; notifications.
2. **Playwright — onboarding prestataire** : inscription → 7 étapes → upload → soumission → approbation admin → photo publique visible **sur le serveur built**.
3. **Playwright — admin** : approbation, rejet avec note, suspension/réactivation, modération d’avis, outbox.
4. **Playwright — mot de passe** : Mailpit, lien reçu, reset, token réutilisé, sessions invalidées.
5. **Playwright — i18n** : switch FR, `html lang`, pages client, erreurs, emails/notifications, et test explicite du dashboard prestataire (actuellement en échec).
6. **Playwright — recherche** : matrice filtres/tri/pagination, catégorie sans quartier, état vide, géolocalisation.
7. **Playwright — autorisations** : invité/client/prestataire/admin, tentative d’accès croisé.
8. **Axe** : accueil, recherche, profil, login, saved, dashboard admin/prestataire ; seuil zéro violation sérieuse.
9. **Mobile** : 375/390/768, débordement, filtres, carte.
10. **Liens/images** : crawl interne, images naturelles, upload.
11. **Unitaire** : `todayInToronto`, `translate`, `hashResetToken`, `rateLimit`, `parseSearchParams`, `filtersToQuery`, `ratingAfterHide/Publish`, stockage d’upload.
12. **CI** : `tsc`, `eslint`, `vitest`, `next build`, Playwright avec base seedée, axe.

---

## 7. Checklist avant lancement

### P0
- [ ] Stockage d’images hors `public/` + URL publique testée après build (ou S3/CDN).
- [ ] SMTP/transactional email + worker + statuts + relances ; `NEXT_PUBLIC_SITE_URL` correct.
- [ ] Rejouer le parcours « mot de passe oublié » avec un vrai email.

### P1
- [ ] Rate limit login/inscription + CAPTCHA/backoff + audit.
- [ ] FR prestataire/onboarding/dashboard (ou frontière explicite).
- [ ] Catégories sans quartier → résultats ville.
- [ ] Contrastes WCAG AA + ARIA notes + `<main>` unique + ordre des titres + skip link.
- [ ] Avis liés à un rendez-vous complété (ou badge non vérifié explicite).

### P2
- [ ] Recherche/édition/suppression prestataire admin.
- [ ] Squelettes de chargement.
- [ ] Redis/Upstash pour le rate limit.
- [ ] Vérification email, 2FA, CAPTCHA.
- [ ] `hreflang`/URLs localisées, page erreur FR.
- [ ] Postgres, sauvegardes, monitoring, Sentry, en-têtes de sécurité/CSP.
- [ ] Politique de confidentialité, conditions, rétention, consentement.
- [ ] Audit accessibilité externe + tests Safari/iOS/Firefox.

---

## 8. Conclusion

La v1.2 tient la promesse fonctionnelle côté client : recherche, demande, notifications, favoris, reprogrammation/annulation, réinitialisation et FR client fonctionnent, avec une base technique propre (54 tests, build, lint, typecheck). Le travail QA a toutefois mis en évidence des blocages de production réels que les tests unitaires ne pouvaient pas voir, en particulier le stockage des photos et l’envoi des emails.

**Recommandation :** corriger P0-1 et P0-2, puis P1-1 à P1-5, avant toute beta publique. Un lancement contrôlé en démo locale reste possible dès maintenant.
