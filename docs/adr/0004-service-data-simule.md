# 0004. Nous simulons le service Data avec Express dans un conteneur dédié

- Statut : proposée
- Date : 2026-11-12
- Décideurs : Adrien ;

## Contexte

Le frontend doit afficher les recommandations sans dépendre de la machine Data ni du tunnel ngrok. Le contrat versionné dans [openapi.yaml](../../openapi.yaml) prévoit `GET /health` et `POST /ask`, avec les réponses `success`, `no_match` et une enveloppe d’erreur. Le lancement `docker compose up` doit permettre de parcourir la chaîne écran → API → données de démonstration → écran.

Les champs du contexte client supplémentaires restent locaux, car le contrat Data ne prévoit que le type de produit, le brief, les préférences et la région. Le contrat actuel et l’interface acceptent les préférences de 0 à 10. Le service Data réel et son calcul de pertinence restent sous la responsabilité de l’équipe Data.

## Options

1. Réponses fixes dans React : mise en place courte, mais absence de requête réseau et de service HTTP à vérifier.
2. Interception réseau dans le navigateur : frontend indépendant, mais pas de conteneur API dédié et configuration spécifique du navigateur.
3. Service Express simulé dans un conteneur : routes HTTP et erreurs vérifiables avec le frontend, au prix d’un service et de dépendances supplémentaires à maintenir.

## Décision

Nous choisissons l’option 3 pour le développement local. `tools/data-mock/app.mjs` expose les deux routes, valide les entrées avec Zod et retourne des produits fictifs adaptés au type parfum/arôme, avec un score fixe de 85 %. Il n’appelle ni IA ni base de données.

`compose.yaml` lance `data-mock` et `web` par défaut. Le frontend attend la santé du mock au démarrage. Le conteneur de travail `dev` reste disponible via son profil, et VS Code démarre `dev` et `data-mock` sans lancer un deuxième frontend.

Le frontend appelle directement l’URL `VITE_DATA_API_URL`. Passer au service réel consiste à modifier cette URL et le mode d’affichage, puis redémarrer Vite ; Express ne relaie pas les requêtes vers ngrok. Le service réel doit configurer CORS pour l’origine du frontend.

Les scénarios `[sans-resultat]`, `[erreur]` et `[lent]` (succès après environ 3 secondes) permettent de vérifier les états sans correspondance, indisponibilité et chargement. Le délai normal du mock est d’environ 600 ms ; le contrat des réponses est inchangé. Le mock choisit localement les codes HTTP 422, 413, 503 et 500 ; ces codes ne préjugent pas de ceux du service Data, qui restent à confirmer. Un bandeau identifie la simulation et les résultats contiennent une limite explicite.

## Conséquences

- Positives : développement et démonstration indépendants de Data ; même module HTTP pour le mock et le service réel ; cas succès, absence de résultat et erreur vérifiables ; lancement autonome avec Docker Compose.
- Négatives, à accepter : dépendances Express et CORS ainsi que schémas et exemples à synchroniser avec le contrat ; données et score simulés sans valeur de recommandation réelle ; besoin de libérer les ports 5173 et 8000 ou d’adapter la configuration. Aucun stockage ni historique n’est ajouté.
- À revoir si : le contrat Data évolue, un autre outil de simulation est adopté ou le service réel devient disponible de manière stable. Le mock reste un outil local et ne devient pas un backend applicatif sans nouvelle décision.
