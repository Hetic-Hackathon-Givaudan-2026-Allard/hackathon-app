## Lancer

- Ouvrir le projet dans le Dev Container défini par `.devcontainer/devcontainer.json` ; sa création exécute `npm ci` ; `runServices` lance `dev` et `data-mock`.
- Depuis `/workspace`, `npm run dev` lance React/Vite sur le port 5173 ; `compose.yaml` lance par défaut `web` et `data-mock` ; `dev` est derrière le profil `dev`.
- `web/src/App.tsx` affiche les espaces de navigation ; `web/src/components/app-sidebar.tsx` définit Nouveau Brief, Projets et Réglages, avec un appel Data depuis `web/src/pages/NewBriefPage.tsx`.

## Règles

- Exécuter `npm test`, `npm run lint`, `npm run format:check` et `npm run build` ; `.github/workflows/ci.yml` applique les mêmes contrôles après `npm ci`.
- Développer les composants React dans `web/src/` ; `web/src/main.tsx` monte `App` et `web/tsconfig.json` configure TypeScript.
- `web/components.json` configure shadcn/ui ; ajouter les composants depuis le Dev Container avec `npx shadcn@latest add <composant> -c web` et utiliser l’alias `@/` vers `web/src/`.
- `web/src/pages/NewBriefPage.tsx` valide le formulaire et appelle `web/src/services/data-api.ts` ; envoyer seulement les champs du contrat, pas le contexte client supplémentaire. Les sliders et `openapi.yaml` vont de 0 à 10.
- `web/package.json` définit le build avec `tsc --noEmit` puis `vite build` ; `npm test` vérifie la validation Zod de `web/src/schemas/new-brief.ts`.
- Une branche par tâche depuis `develop`, avec une pull request vers `develop` suivant `.github/pull_request_template.md`.

## Décisions

- `docs/adr/0002-stack-et-responsabilites.md` décrit la cible React vers FastAPI ; le mock Express dédié est documenté dans `docs/adr/0004-service-data-simule.md`.
- `openapi.yaml` décrit le contrat convenu avec Data pour `GET /health` et `POST /ask`, avec `region`, implémenté localement par `tools/data-mock/app.mjs` comme simulation ; suivre `docs/adr/0003-contrat-api-openapi.md` pour le maintenir.
- Suivre le modèle et le registre de `docs/adr/README.md` ; proposer un remplacement avant de modifier une décision acceptée.

- `web/.env.example` décrit l’URL et le mode mock/real ; conserver le bandeau en simulation et ne placer aucun secret dans `VITE_*`.

## À ne pas faire

- Ne pas transformer Express en backend applicatif ni réintroduire PostgreSQL ou l’historique sans réexaminer `docs/adr/0002-stack-et-responsabilites.md`.
- Ne pas effacer les anciennes données locales de `db/data/` ni `api/.env` lors du nettoyage du code ; `.gitignore` les exclut et `compose.yaml` ne les utilise plus.
- Ne pas contourner `.husky/pre-commit` avec `git commit --no-verify` ; installer les dépendances avec `npm install` dans le Dev Container.
