# HETIC — Hackathon Givaudan 2026

Projet des mastères CTO/Tech Lead, Product et Data de HETIC. Le dépôt contient désormais uniquement le socle frontend React, TypeScript et Vite, dans un Dev Container VS Code. Express, PostgreSQL et l’ancien parcours question-réponse ont été retirés de la configuration.

Le produit visé recommande un parfum ou un arôme à partir d’un brief client et de cinq préférences. Le formulaire, les sliders, l’affichage des résultats et l’intégration FastAPI seront développés progressivement. La page actuelle confirme uniquement le démarrage de React.

## Prérequis

- Git et un compte GitHub ayant accès au dépôt.
- Docker Desktop démarré, ou Docker Engine avec Compose v2 sous Linux.
- VS Code et l’extension Dev Containers.

Node.js et npm sont fournis par le conteneur ; Ollama et PostgreSQL ne sont pas nécessaires pour lancer ce socle.

## Installation et lancement

```shell
git clone https://github.com/Hetic-Hackathon-Givaudan-2026-Allard/hackathon-app.git
cd hackathon-app
```

Ouvrir le dossier dans VS Code et lancer **Dev Containers: Reopen in Container**. Si le projet était déjà ouvert dans un ancien conteneur, utiliser **Dev Containers: Rebuild Container**.

La création installe les dépendances avec `npm ci`. Le volume `dev-node-modules` conserve les dépendances du conteneur séparément de celles de la machine.

Dans le terminal du Dev Container, depuis `/workspace` :

```shell
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173), ou l’adresse indiquée dans l’onglet Ports de VS Code. La page affiche « Le socle React est prêt ». Les modifications du frontend sont rechargées par Vite.

`docker compose up` démarre uniquement le conteneur de travail ; le lancement du frontend reste manuel avec `npm run dev`. Aucun service Data simulé ni base de données ne démarre. Arrêter Vite avec `Ctrl+C` ; fermer la fenêtre attachée au Dev Container arrête Compose selon sa configuration.

## Structure

| Chemin                           | Rôle                                                                   |
| -------------------------------- | ---------------------------------------------------------------------- |
| `web/src/main.tsx`               | Entrée React                                                           |
| `web/src/App.tsx`                | Composant initial à faire évoluer                                      |
| `web/vite.config.ts`             | Plugin React et serveur sur le port 5173                               |
| `web/tsconfig.json`              | Vérification TypeScript du frontend                                    |
| `.devcontainer/`, `compose.yaml` | Environnement de développement                                         |
| `docs/adr/`                      | Choix de stack et documentation des décisions                          |
| `openapi.yaml`                   | Contrat Data de GET /health et POST /ask, non implémenté dans ce dépôt |

## Service Data à intégrer ultérieurement

L’équipe Data développe FastAPI dans son propre dépôt. Le frontend devra appeler `POST /ask` avec le type, le brief, les préférences et la région. Le service conserve aussi `GET /health`, qui retourne `{"status":"ok"}`. Le [contrat OpenAPI convenu avec Data](openapi.yaml) décrit les réponses `success`, `no_match` et le format d’erreur. Les statuts HTTP des erreurs restent à préciser ; aucune requête n’est actuellement envoyée par le frontend.

La gestion du catalogue et son hébergement restent à convenir avec Data. Les anciens fichiers locaux `db/data/` et `api/.env`, s’ils existent, ne sont pas utilisés et n’ont pas été effacés.

## Vérifications

Depuis `/workspace`, dans le Dev Container :

```shell
npm run lint
npm run format:check
npm run build
```

La CI exécute les mêmes contrôles après `npm ci`. Le build vérifie les types avec `tsc --noEmit` puis construit le frontend avec Vite. Aucun script de test métier n’est configuré. Utiliser `npm run format` pour corriger la mise en forme.
