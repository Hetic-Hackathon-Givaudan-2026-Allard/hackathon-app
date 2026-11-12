# HETIC — Hackathon Givaudan 2026

Application de recommandation de parfums et d’arômes à partir d’un brief client, de cinq préférences et d’une région. Le frontend React, TypeScript et Vite utilise shadcn/ui. Le service Data réel est développé avec FastAPI dans un dépôt distinct.

Pour développer sans dépendre de la machine Data, `tools/data-mock/` expose un service Express autonome. Il ne contient ni IA ni catalogue réel : les produits sont fictifs et le score est fixé à 85 %. Le bandeau de l’interface identifie ce mode. Il n’y a ni authentification ni historique.

## Lancement complet avec Docker Compose

Prérequis : Git, accès au dépôt et Docker Desktop démarré, ou Docker Engine avec Compose v2 sous Linux. VS Code, Node.js et Ollama ne sont pas nécessaires pour ce parcours.

```shell
git clone https://github.com/Hetic-Hackathon-Givaudan-2026-Allard/hackathon-app.git
cd hackathon-app
docker compose up
```

Compose construit les images si nécessaire, lance `data-mock`, attend son contrôle de santé puis lance `web`. Ouvrir [http://localhost:5173](http://localhost:5173). La santé du mock est accessible sur [http://localhost:8000/health](http://localhost:8000/health). Les ports sont publiés uniquement sur la machine locale.

Après modification du code ou des dépendances, reconstruire avec `docker compose up --build`. Ce lancement utilise les sources copiées dans l’image ; utiliser le Dev Container ci-dessous pour le rechargement automatique pendant le développement.

Remplir les champs obligatoires du formulaire puis cliquer sur **Trouver le meilleur Produit**. Pendant la requête, un loader et un bouton désactivé indiquent le chargement. Un succès ouvre une modale avec le nom, la description, le score, les raisons et les limites ; une erreur API apparaît en toast. Les erreurs de saisie Zod restent sous les champs et l’absence de correspondance reste un résultat dans la page. Le nom du client, la catégorie et le type de client sont validés localement mais ne sont pas envoyés : le contrat Data ne prévoit que `product_type`, `brief`, `preferences` et `region`.

Scénarios de démonstration (remplacer uniquement le brief, en gardant les autres champs renseignés) :

| Brief             | Résultat                                                              |
| ----------------- | --------------------------------------------------------------------- |
| Texte libre       | Produit fictif correspondant au type parfum/arôme, score fixe de 85 % |
| `[sans-resultat]` | HTTP 200, `no_match` et message d’absence de correspondance           |
| `[erreur]`        | HTTP 503, erreur simulée affichée en toast                            |
| `[lent]`          | Succès après environ 3 secondes pour observer le loader               |

Le mock attend environ 600 ms par défaut pour rendre le chargement visible ; `[lent]` attend environ 3 secondes. Remplir les autres champs obligatoires pour chacun de ces scénarios.

Effacer réinitialise le formulaire, et annule la requête en cours. Une modification pendant la recherche annule aussi la requête pour ne pas afficher un résultat correspondant à d’anciens critères. Les valeurs initiales des sliders sont 5 ; les entiers de 0 à 10 sont acceptés.

Arrêter avec `Ctrl+C` puis `docker compose down`. Les anciens fichiers `db/data/` et `api/.env`, s’ils existent, ne sont ni utilisés ni effacés.

## Développer dans VS Code

Installer VS Code et Dev Containers. Ouvrir le dossier puis lancer **Dev Containers: Reopen in Container**, ou **Dev Containers: Rebuild Container** si un ancien conteneur existe.

La configuration démarre uniquement `dev` et `data-mock`, puis installe les dépendances avec `npm ci`. Dans le terminal du conteneur, depuis `/workspace` :

```shell
npm run dev
```

Ouvrir le port 5173 transféré par VS Code. Arrêter préalablement le service Compose `web` s’il occupe déjà ce port (`docker compose stop web`). Le mock reste disponible sur le port 8000. Les sources du frontend sont montées ; Vite recharge les modifications. Après une modification du mock, reconstruire son image avec `docker compose up --build -d data-mock`, ou utiliser `npm run dev:mock` après avoir arrêté son conteneur.

Si le port 5173 est déjà occupé et doit le rester, définir `WEB_PORT=5174` et `CORS_ORIGINS=http://localhost:5174` dans le fichier `.env` racine avant de lancer Compose ; ouvrir alors le port 5174.

## Passer au service Data réel

Dans le Dev Container, copier `web/.env.example` vers `web/.env.local`, puis renseigner :

```dotenv
VITE_DATA_API_URL=https://adresse-du-tunnel-data.ngrok-free.app
VITE_DATA_API_MODE=real
```

Redémarrer Vite. Pour le lancement Compose, définir ces variables dans `.env` à la racine (ignoré par Git), puis lancer `docker compose up --build -d web`. Les variables Compose prennent priorité sur `web/.env.local`.

Le frontend appelle directement l’URL configurée, sans proxy Express. Le mock peut être arrêté après le lancement de `web` avec `docker compose stop data-mock`. FastAPI doit autoriser l’origine du frontend via CORS. L’URL doit être accessible depuis le navigateur : ne pas utiliser le nom Docker `data-mock`. Les variables `VITE_*` sont publiques ; aucune clé secrète ne doit y figurer.

Le mode (`mock` ou `real`) contrôle le bandeau, pas l’adresse : modifier les deux variables ensemble. Le délai frontend est provisoirement de 60 secondes. Vérifier le contrat, les erreurs et les CORS avec Data avant le branchement réel.

Le [fichier OpenAPI](openapi.yaml) décrit `/health` et `/ask`. Les codes HTTP d’erreur de Data restent à confirmer ; le mock utilise localement 422 pour la validation, 413 pour un corps trop grand, 503 pour `[erreur]` et 500 pour une erreur interne. Ces choix de simulation ne définissent pas les codes du service distant.

## Composants shadcn/ui

shadcn/ui est configuré dans `web/` avec Tailwind CSS et l’alias `@/` vers `web/src/`, selon le [guide officiel Vite](https://ui.shadcn.com/docs/installation/vite). Les composants sont ajoutés comme fichiers source dans le projet, pas comme un service Docker.

Depuis le terminal du Dev Container, à la racine du dépôt, ajouter uniquement les composants nécessaires, par exemple :

```shell
npx shadcn@latest add button -c web
```

La configuration se trouve dans `web/components.json`, les styles dans `web/src/index.css` et l’utilitaire `cn` dans `web/src/lib/utils.ts`. `npm ci` installe les dépendances au prochain démarrage du Dev Container ; aucun service supplémentaire n’est requis.

## Structure et décisions

| Chemin                                         | Rôle                                                       |
| ---------------------------------------------- | ---------------------------------------------------------- |
| `web/src/pages/NewBriefPage.tsx`               | Formulaire, validation, envoi et états de la requête       |
| `web/src/schemas/new-brief.ts`                 | Validation Zod du formulaire                               |
| `web/src/services/data-api.ts`                 | Conversion vers le contrat Data et validation des réponses |
| `web/src/components/recommendation-result.tsx` | Produit recommandé ou absence de résultat                  |
| `tools/data-mock/app.mjs`                      | Routes Express et données simulées                         |
| `Dockerfile`, `compose.yaml`                   | Images et lancement complet                                |
| `.devcontainer/`                               | Poste de développement VS Code                             |
| `docs/adr/`                                    | Décisions, dont ADR-0004 pour le mock                      |

## Vérifications

Depuis `/workspace`, dans le Dev Container :

```shell
npm run lint
npm run format:check
npm test
npm run build
```

La CI exécute ces contrôles après `npm ci`. Les tests couvrent le schéma du formulaire, le client HTTP et le contrat du mock (santé, parfum/arôme, absence de résultat, validation et CORS). Le build vérifie TypeScript et construit Vite ; il ne valide pas la qualité de l’IA. `npm run format` corrige la mise en forme.
