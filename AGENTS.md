## Lancer

Les commandes npm ci-dessous se lancent dans le Dev Container, depuis `/workspace`.

- À la création du conteneur, `.devcontainer/devcontainer.json` lance `npm ci` et copie `api/.env.example` vers `api/.env` uniquement si ce fichier manque.
- `npm run dev` : API sur le port 3000, front sur le port 5173.
- `curl -s localhost:3000/api/health` doit renvoyer un objet JSON contenant `"status":"ok"` et le champ `db`.
- Dans `api/src/index.ts`, `GET /api/health` vérifie PostgreSQL, pas l’IA ; pour vérifier aussi l’appel au modèle et l’enregistrement, envoyer une question avec le formulaire de `web/src/main.ts` et vérifier qu’elle réapparaît après rechargement.

## Règles

- Exécuter `npm run lint`, `npm run format:check` et `npm run build` avant une contribution ; `.github/workflows/ci.yml` exécute ces vérifications après `npm ci`.
- `npm run build` lance `tsc` pour `api/` et `vite build` pour `web/` ; ces commandes vérifient la construction, pas le comportement métier. Aucun script `test` n’est défini dans les trois `package.json`.
- Les routes sont dans `api/src/index.ts`. Le front appelle `/api` : le proxy est dans `web/vite.config.ts`.
- Mettre à jour `openapi.yaml` avec toute modification des routes, requêtes ou réponses de `api/src/index.ts`, conformément à `docs/adr/0003-contrat-api-openapi.md`.
- `openapi.yaml` décrit le socle Express actuel ; ne pas le présenter comme le contrat du futur service Data.
- Le schéma et les données de test sont dans `db/init/`, joués au premier démarrage seulement : les modifier ne change pas une base existante.
- `ask()` dans `api/src/index.ts` attend un endpoint `/chat/completions` et une réponse contenant `choices[0].message.content` ; pour un fournisseur respectant ce contrat, configurer l’URL, le modèle et la clé dans `api/.env`.
- Une branche par tâche, depuis `develop`. La pull request vise `develop` et suit `.github/pull_request_template.md`.
- Rédiger les ADR selon le modèle de `docs/adr/README.md` et les ajouter à son registre.

## Décisions

- Lis `docs/adr/` avant d'ajouter une dépendance ou de changer de composant.
- `docs/adr/0002-stack-et-responsabilites.md` propose React avec un appel direct à FastAPI pour le MVP sans historique ; la migration n’est pas implémentée. Ne pas supprimer le stockage du catalogue avant clarification avec Data.
- Ne contredis pas un ADR au statut « acceptée » dans `docs/adr/`.
- Pour remplacer une décision acceptée, proposer un nouvel ADR selon `docs/adr/README.md` ; ne pas implémenter le changement concerné avant sa validation. Les tâches indépendantes peuvent continuer.

## À ne pas faire

- Passer `--no-verify` à `git commit`, ou ajouter `eslint-disable`, pour faire passer un contrôle.
- Lancer `npm install` hors du Dev Container défini dans `.devcontainer/devcontainer.json`, afin de conserver l’environnement commun pour les installations.
- Écrire une clé dans le code. Les secrets vont dans `api/.env`, jamais commité.
