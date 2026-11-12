# 0002. Nous construisons le MVP avec React et le service FastAPI de l’équipe Data

- Statut : proposée
- Date : 2026-11-12
- Décideurs : Adrien ;

## Contexte

Le commercial choisit entre parfum et arôme, saisit le brief du client et règle cinq préférences de 1 à 10 : Gourmand, Premium, Naturel, Audace et Bien-être. Le résultat attendu est un produit existant dans le catalogue, un score de correspondance, son nom, sa description et les raisons de sa recommandation.

Le MVP ne comporte pas d’historique ni de comptes utilisateurs. L’équipe Data développe un service Python avec FastAPI dans un dépôt séparé, accessible via un tunnel ngrok, sans authentification. La route de recommandation est `/ask`. Les champs du contrat proposés dans les échanges restent à valider avec Data.

Le dépôt actuel contient un frontend TypeScript avec Vite, une API Express et PostgreSQL pour un socle question-réponse avec persistance. React n’est pas encore installé. La responsabilité de l’hébergement du catalogue reste à confirmer. Aucun budget d’hébergement ni objectif chiffré de latence n’est défini ici.

## Options

1. **React, TypeScript et Vite appelant directement FastAPI.** Avantages : un seul backend, séparation entre interface et traitements Data, composants pour le formulaire et ses états. Inconvénients : dépendance à la disponibilité du service Data, configuration CORS et intégration de React nécessaires.
2. **React avec Express comme intermédiaire vers FastAPI.** Avantages : possibilité de porter ultérieurement une logique applicative ou des secrets serveur. Inconvénients : deux backends à maintenir alors que le MVP ne demande ni historique ni authentification et qu’aucune responsabilité propre à Express n’est identifiée.
3. **Frontend TypeScript sans React appelant FastAPI.** Avantages : réutilisation directe de Vite et du DOM existant, sans framework supplémentaire. Inconvénients : gestion manuelle des états liés aux cinq sliders, à la saisie, à l’attente, aux erreurs et au résultat.

## Décision

Nous choisissons l’option 1 comme proposition de stack pour le MVP, parce qu’elle limite le nombre de services applicatifs tout en structurant l’interface interactive avec React. La validation d’équipe reste à renseigner avant de passer le statut à « acceptée ».

Le frontend utilisera React, TypeScript et Vite. Un module dédié centralisera les appels HTTP, l’URL configurable du service Data et le délai maximal. Il enverra le type de produit, le brief et les cinq préférences à `POST /ask`, puis affichera la recommandation, le score, les arguments et les limites. Le navigateur ne contiendra pas de secret serveur.

FastAPI restera dans le dépôt Data. Ce service validera les entrées, recherchera les produits du catalogue et construira la réponse. La méthode du score devra être définie avec Data ; le modèle ne devra pas inventer un pourcentage. Le nom et la description du produit proviendront du catalogue. Le sens des préférences, le cas sans correspondance et les erreurs restent à convenir avec Product et Data.

Express et la persistance des questions seront retirés du parcours MVP lors de l’implémentation. Aucune base applicative ne sera ajoutée pour anticiper l’historique. Le stockage du catalogue reste nécessaire : PostgreSQL ne sera retiré de l’infrastructure qu’après clarification de son hébergement avec Data. Cet ADR ne choisit ni le moteur de recherche du catalogue ni le fournisseur ou le modèle IA.

Le développement conservera VS Code et Dev Containers. Un service simulé conforme au contrat validé permettra de travailler sans la machine Data. Un ticket d’implémentation adaptera Docker Compose pour démarrer le frontend et cette simulation sans VS Code. La simulation sera explicitement identifiée.

Le fichier [openapi.yaml](../../openapi.yaml) décrit encore l’API Express existante. Il ne constitue pas le contrat de FastAPI. Sa mise à jour ou son remplacement accompagnera la validation du nouveau contrat et la migration du code, afin de ne pas présenter des routes non implémentées comme disponibles.

## Conséquences

- Positives : absence d’intermédiaire Express sans responsabilité propre ; réutilisation de TypeScript et Vite ; séparation entre interface et service Data ; développement possible avec une simulation ; ajout ultérieur d’un historique possible sans le développer maintenant.
- Négatives, à accepter : React doit être intégré et pris en main ; l’ancien socle Express doit être retiré et les scripts, la CI et la documentation adaptés ; les requêtes directes nécessitent une configuration CORS dans FastAPI. Le service réel dépend de la machine Data et du tunnel ngrok. Sans authentification, toute personne pouvant joindre l’API peut l’appeler. La migration n’est pas encore réalisée.
- À revoir si : des comptes ou un historique deviennent nécessaires, une clé serveur doit être conservée, le service Data ne peut pas être appelé depuis le navigateur ou les générations exigent un traitement asynchrone. Une persistance dans FastAPI ou une API applicative distincte seront alors comparées selon les responsabilités réelles.
