## Lancer

- Ouvrir le projet dans le Dev Container défini par `.devcontainer/devcontainer.json` ; sa création exécute `npm ci`.
- Depuis `/workspace`, `npm run dev` lance React/Vite sur le port 5173 ; `compose.yaml` fournit uniquement le conteneur de travail `dev`.
- `web/src/App.tsx` affiche la page initiale ; aucune recommandation ni requête Data n’est implémentée.

## Règles

- Exécuter `npm run lint`, `npm run format:check` et `npm run build` ; `.github/workflows/ci.yml` applique les mêmes contrôles après `npm ci`.
- Développer les composants React dans `web/src/` ; `web/src/main.tsx` monte `App` et `web/tsconfig.json` configure TypeScript.
- `web/components.json` configure shadcn/ui ; ajouter les composants depuis le Dev Container avec `npx shadcn@latest add <composant> -c web` et utiliser l’alias `@/` vers `web/src/`.
- `web/package.json` définit le build avec `tsc --noEmit` puis `vite build` ; aucun script de test métier n’est configuré.
- Une branche par tâche depuis `develop`, avec une pull request vers `develop` suivant `.github/pull_request_template.md`.

## Décisions

- `docs/adr/0002-stack-et-responsabilites.md` décrit la cible React vers FastAPI ; seule l’initialisation React est réalisée, l’intégration Data reste à développer.
- `openapi.yaml` décrit le contrat convenu avec Data pour `GET /health` et `POST /ask`, avec `region`, pas une API implémentée dans ce dépôt ; suivre `docs/adr/0003-contrat-api-openapi.md` pour le maintenir.
- Suivre le modèle et le registre de `docs/adr/README.md` ; proposer un remplacement avant de modifier une décision acceptée.

## À ne pas faire

- Ne pas réintroduire Express, PostgreSQL ou l’historique des questions sans réexaminer `docs/adr/0002-stack-et-responsabilites.md`.
- Ne pas effacer les anciennes données locales de `db/data/` ni `api/.env` lors du nettoyage du code ; `.gitignore` les exclut et `compose.yaml` ne les utilise plus.
- Ne pas contourner `.husky/pre-commit` avec `git commit --no-verify` ; installer les dépendances avec `npm install` dans le Dev Container.
