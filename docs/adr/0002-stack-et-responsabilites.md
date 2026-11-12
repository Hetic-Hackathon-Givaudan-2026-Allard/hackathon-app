# 0002. Nous construisons le MVP avec React et le service FastAPI de l’équipe Data

- Statut : proposée
- Date : 2026-11-12
- Décideurs : Adrien ;

## Contexte

Le commercial choisit entre parfum et arôme, saisit le brief du client et règle cinq préférences de 0 à 10 : Gourmand, Premium, Naturel, Audace et Bien-être. Le résultat attendu est un produit existant dans le catalogue, un score de correspondance, son nom, sa description et les raisons de sa recommandation.

Le MVP ne comporte pas d’historique ni de comptes utilisateurs. L’équipe Data développe un service Python avec FastAPI dans un dépôt séparé, accessible via un tunnel ngrok, sans authentification. Le contrat convenu avec Data est `POST /ask` : type de produit, brief, cinq préférences et région (`region`, par exemple `Europe`). Les réponses prévues sont `success` avec une recommandation, `no_match` sans résultat et une enveloppe `error`. Les codes HTTP des erreurs restent à confirmer.

Le socle initial contenait un frontend TypeScript avec Vite, Express et PostgreSQL pour un parcours question-réponse avec persistance. Le frontend a été migré vers React et Express retiré. La responsabilité de l’hébergement du catalogue reste à confirmer. Aucun budget d’hébergement ni objectif chiffré de latence n’est défini ici.

## Options

1. **React, TypeScript et Vite appelant directement FastAPI.** Avantages : un seul backend, séparation entre interface et traitements Data, composants pour le formulaire et ses états. Inconvénients : dépendance à la disponibilité du service Data, configuration CORS et intégration de React nécessaires.
2. **React avec Express comme intermédiaire vers FastAPI.** Avantages : possibilité de porter ultérieurement une logique applicative ou des secrets serveur. Inconvénients : deux backends à maintenir alors que le MVP ne demande ni historique ni authentification et qu’aucune responsabilité propre à Express n’est identifiée.
3. **Frontend TypeScript sans React appelant FastAPI.** Avantages : réutilisation directe de Vite et du DOM existant, sans framework supplémentaire. Inconvénients : gestion manuelle des états liés aux cinq sliders, à la saisie, à l’attente, aux erreurs et au résultat.

## Décision

Nous choisissons l’option 1 comme proposition de stack pour le MVP, parce qu’elle limite le nombre de services applicatifs tout en structurant l’interface interactive avec React. La validation d’équipe reste à renseigner avant de passer le statut à « acceptée ».

Le frontend utilisera React, TypeScript et Vite. shadcn/ui et Tailwind CSS sont ajoutés pour limiter le temps consacré aux composants d’interface ; leurs sources restent dans `web/` et seront intégrées au fur et à mesure. Ce choix ajoute des dépendances et des composants à maintenir dans le dépôt. Un module dédié centralisera les appels HTTP, l’URL configurable du service Data et le délai maximal. Il enverra le type de produit, le brief, les cinq préférences et la région à `POST /ask`, puis affichera la recommandation, le score, les arguments et les limites. Le navigateur ne contiendra pas de secret serveur.

FastAPI restera dans le dépôt Data. Ce service validera les entrées, recherchera les produits du catalogue et construira la réponse. La méthode du score devra être définie avec Data ; le modèle ne devra pas inventer un pourcentage. Le nom et la description du produit proviendront du catalogue. Le sens métier des préférences, le calcul du score, les valeurs de région et leur utilisation restent à préciser avec Product et Data ; le format des réponses est documenté dans le contrat.

Express et la persistance des questions sont retirés du parcours MVP. Aucune base applicative ne sera ajoutée pour anticiper l’historique. Le stockage du catalogue reste nécessaire côté service Data ; son hébergement reste à clarifier. Cet ADR ne choisit ni le moteur de recherche du catalogue ni le fournisseur ou le modèle IA.

Le développement conserve VS Code et Dev Containers. Le formulaire validé appelle un service configurable et affiche le résultat, l’absence de correspondance ou une erreur. L’[ADR-0004](0004-service-data-simule.md) ajoute Express uniquement comme mock local dans un conteneur dédié, sans modifier le choix d’un appel direct à FastAPI en mode réel. `docker compose up` démarre le frontend et le mock ; le conteneur de travail reste optionnel. Les anciennes données locales ne sont pas effacées.

Le fichier [openapi.yaml](../../openapi.yaml) décrit le contrat convenu pour `POST /ask` avec ses exemples. Data conserve également `GET /health`, qui retourne HTTP 200 avec `{"status":"ok"}` pour vérifier que le service répond, sans garantir une recommandation complète. Le format d’erreur utilise une réponse OpenAPI `default`, car aucun code HTTP d’erreur n’a été précisé. Ces routes sont simulées localement ; la conformité du service FastAPI distant reste à vérifier.

## Conséquences

- Positives : absence d’intermédiaire Express sans responsabilité propre ; réutilisation de TypeScript et Vite ; séparation entre interface et service Data ; interface développable progressivement ; ajout ultérieur d’un historique possible sans le développer maintenant.
- Négatives, à accepter : React doit être pris en main ; le frontend dépend du contrat Data et les scripts ainsi que la documentation doivent rester synchronisés avec les évolutions ; les requêtes directes nécessitent une configuration CORS dans FastAPI. Le service réel dépend de la machine Data et du tunnel ngrok. Sans authentification, toute personne pouvant joindre l’API peut l’appeler. Le parcours est vérifiable avec des données fictives ; le raccordement Data réel reste à vérifier.
- À revoir si : des comptes ou un historique deviennent nécessaires, une clé serveur doit être conservée, le service Data ne peut pas être appelé depuis le navigateur ou les générations exigent un traitement asynchrone. Une persistance dans FastAPI ou une API applicative distincte seront alors comparées selon les responsabilités réelles.
