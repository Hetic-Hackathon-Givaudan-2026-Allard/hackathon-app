# Projet HETIC — Hackathon Givaudan 2026

## Description

Projet réalisé dans le cadre du hackathon Givaudan 2026 par une équipe réunissant les mastères CTO/Tech Lead, Product et Data de HETIC.

Le socle actuel permet de poser une question à une IA et de consulter les derniers échanges enregistrés en base. Le cas d'usage métier sera développé en équipe.

Pour en savoir plus sur le challenge : [Hackathon Givaudan 2026](https://ai-challenge-givaudan.base44.app/).

## Lancer le projet

### 1. Préparer sa machine

- **Git** et un compte GitHub ayant accès au dépôt si celui-ci est privé.
- **Docker Desktop** démarré (macOS, Windows), ou Docker Engine avec Docker Compose v2 (Linux). Sous Windows, utiliser les conteneurs Linux.
- **VS Code** et l'extension [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers).
- **[Ollama](https://ollama.com/download)** installé et démarré sur votre machine.

Node.js, npm et PostgreSQL sont fournis par les conteneurs : inutile de les installer sur votre machine pour suivre ce parcours. Prévoir une connexion Internet pour télécharger les images, les dépendances et le modèle lors de la première installation.

Pour contribuer, configurer son identité Git sur la machine :

```shell
git config --global user.name "Prénom Nom"
git config --global user.email "votre-adresse@example.com"
```

VS Code reprend votre configuration Git dans le conteneur. Le clonage ci-dessous utilise HTTPS : une clé SSH n'est pas obligatoire.

### 2. Préparer le modèle IA

Dans un terminal de votre machine, avec Ollama démarré :

```shell
ollama pull gemma3:1b
ollama list
```

Vérifier que `gemma3:1b` apparaît dans la liste. Ollama doit rester démarré pendant l'utilisation des questions à l'IA.

### 3. Cloner et ouvrir le projet

Utiliser l'URL du dépôt de l'organisation :

```shell
git clone https://github.com/Hetic-Hackathon-Givaudan-2026-Allard/hackathon-app.git
cd hackathon-app
```

Ouvrir le dossier `hackathon-app` dans VS Code, puis lancer la commande **Dev Containers: Reopen in Container** depuis la palette (`F1`).

Attendre la fin de la création du conteneur et de l'installation des dépendances. Cette étape :

- démarre PostgreSQL et initialise le schéma avec deux échanges de démonstration au premier démarrage ;
- installe les dépendances avec `npm ci` ;
- crée `api/.env` à partir de `api/.env.example` si le fichier n'existe pas déjà.

Le fichier `api/.env` contient la configuration locale et est ignoré par Git. Ne pas y remplacer `db` ou `host.docker.internal` par `localhost` : ces adresses sont utilisées depuis le conteneur.

### 4. Démarrer l'application

Dans le terminal intégré de VS Code, **à l'intérieur du conteneur**, depuis `/workspace` :

```shell
npm run dev
```

Cette commande démarre l'API et le frontend. Garder ce terminal ouvert.

- **Application :** [http://localhost:5173](http://localhost:5173).
- **État de l'API et de PostgreSQL :** [http://localhost:3000/api/health](http://localhost:3000/api/health), qui doit renvoyer un JSON avec `"status": "ok"`.

Si un port local est déjà occupé, consulter l'onglet **Ports** de VS Code pour retrouver l'adresse transférée.

### 5. Vérifier que tout fonctionne

1. Ouvrir l'application : la mention `API OK` et les deux échanges de démonstration doivent apparaître sur une base neuve.
2. Saisir une question et cliquer sur **Envoyer**. La première réponse peut prendre un peu de temps pendant le chargement du modèle.
3. Vérifier que la question et la réponse apparaissent dans la liste, puis recharger la page : l'échange doit toujours être présent.

Le contrôle `/api/health` vérifie la base de données, mais ne vérifie pas Ollama. L'envoi d'une question valide le parcours complet.

### Arrêter et reprendre le travail

- Arrêter l'API et le frontend avec `Ctrl+C` dans leur terminal.
- Fermer la fenêtre VS Code attachée au conteneur arrête la stack Docker configurée pour ce projet.
- Pour reprendre, rouvrir le projet dans son Dev Container, démarrer Ollama sur la machine et relancer `npm run dev`.

Les données PostgreSQL sont conservées dans `db/data/`, ignoré par Git. Les scripts `db/init/` ne sont exécutés qu'à l'initialisation d'une base vide.

## En cas de problème

| Symptôme                                             | Vérification                                                                                                                                             |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Le dépôt est introuvable ou le clonage est refusé    | Vérifier l'URL et l'accès de votre compte GitHub à l'organisation et au dépôt.                                                                           |
| Le Dev Container ne démarre pas                      | Vérifier que Docker est démarré. Consulter **Dev Containers: Show Container Log** dans la palette VS Code.                                               |
| La page reste sur « Connexion à l'API… »             | Vérifier que `npm run dev` tourne dans le conteneur et lire les erreurs dans son terminal. Tester `/api/health`.                                         |
| Les échanges s'affichent, mais l'IA ne répond pas    | Vérifier qu'Ollama est démarré sur la machine et que `ollama list` contient `gemma3:1b`. Lire les erreurs de l'API dans le terminal.                     |
| L'API ne parvient pas à joindre Ollama depuis Docker | Vérifier la connexion depuis le terminal du conteneur avec la commande ci-dessous. Selon le système, adapter l'adresse d'écoute d'Ollama et le pare-feu. |
| `api/.env` manque                                    | Dans le terminal du conteneur, depuis `/workspace`, exécuter `cp api/.env.example api/.env`, puis relancer `npm run dev`.                                |

Test de connexion à Ollama **depuis le conteneur** :

```shell
node -e "fetch('http://host.docker.internal:11434/api/tags').then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(console.log).catch(e => { console.error(e); process.exitCode = 1; })"
```

Si le serveur n'est pas joignable, consulter les [instructions officielles Ollama](https://github.com/ollama/ollama/blob/main/docs/faq.mdx#how-do-i-configure-ollama-server) pour configurer `OLLAMA_HOST` selon votre système. Ollama écoute par défaut sur `127.0.0.1` ; une écoute sur `0.0.0.0:11434` peut être nécessaire pour l'accès depuis Docker, notamment sous Linux. Cette configuration rend aussi le service accessible au réseau : limiter cet accès avec le pare-feu.

## Se repérer dans le projet

| Dossier ou fichier | Rôle                                                 |
| ------------------ | ---------------------------------------------------- |
| `web/`             | Interface web en TypeScript, servie par Vite.        |
| `api/`             | API Express en TypeScript et appels au modèle IA.    |
| `db/init/`         | Schéma PostgreSQL et données de démonstration.       |
| `compose.yaml`     | Services Docker de développement et base de données. |
| `.devcontainer/`   | Environnement VS Code partagé par l'équipe.          |

## Vérifications avant une contribution

Depuis `/workspace`, dans le conteneur :

```shell
npm run lint
npm run format:check
npm run build
```

Pour corriger la mise en forme, utiliser `npm run format`. Ces trois vérifications sont également exécutées par la CI GitHub. Le projet ne comporte pas encore de suite de tests automatisés.
