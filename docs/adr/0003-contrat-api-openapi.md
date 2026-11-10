# 0003. Nous documentons le contrat HTTP dans un fichier OpenAPI versionné

- Statut : proposée
- Date : 2026-11-10
- Décideurs : Adrien ;

## Contexte

L’API Express actuelle expose trois routes : `GET /api/health`, `GET /api/questions` et `POST /api/questions`. Elles permettent de vérifier la connexion à PostgreSQL, de consulter les derniers échanges et de poser une question à l’IA.

Le projet réunit des membres des mastères CTO/Tech Lead, Product et Data. L’équipe Data développe son service Python dans un dépôt distinct.

Le fichier `openapi.yaml` existe à la racine du dépôt et décrit le comportement actuel de l’API Express.

## Options

1. **Documenter les routes uniquement dans le README.** Avantages : rédaction simple et lecture directe dans GitHub. Inconvénients : absence de contrat structuré exploitable par les outils OpenAPI ; cette option seule ne répond pas à l’exigence d’un fichier OpenAPI.
2. **Conserver uniquement une documentation interactive hébergée.** Avantages : consultation et essais depuis un navigateur. Inconvénients : dépendance à la disponibilité du service ; une page Swagger seule ne fournit pas de contrat versionné dans notre dépôt et ne répond pas à la consigne.
3. **Conserver un fichier OpenAPI versionné avec le code.** Avantages : contrat structuré, historique Git, consultation avec des outils compatibles et validation du format. Inconvénients : maintenance nécessaire pour éviter un écart entre le contrat et l’implémentation.

## Décision

Nous choisissons l’option 3 comme proposition à valider, parce qu’elle permet de partager et de versionner le contrat HTTP avec le code sans dépendre de la disponibilité d’un service.

Le fichier de référence est [openapi.yaml](../../openapi.yaml). Il décrit les routes, les corps de requête, les réponses et les erreurs de l’API Express actuelle. Il ne constitue pas le contrat du futur service Data et ne fige pas le choix du framework backend.

Toute modification d’une route, d’une requête ou d’une réponse devra être accompagnée de la mise à jour du contrat dans la même pull request. La vérification portera sur la validité OpenAPI du fichier et sur sa correspondance avec le code. La validation du format ne garantit pas à elle seule cette correspondance.

Le README sert de point d’entrée vers le fichier. Une documentation interactive pourra le compléter sans remplacer la copie versionnée.

## Conséquences

- Positives : le contrat est accessible dans le dépôt sans démarrer l’API ; il est consultable avec des outils compatibles OpenAPI ; ses évolutions peuvent être relues en pull request et comparées dans Git ; il fournit une référence commune pour préparer les appels et les réponses simulées.
- Négatives, à accepter : le fichier actuel est maintenu manuellement ; chaque évolution de l’API demande une vérification documentaire supplémentaire ; un document valide peut néanmoins décrire un comportement différent de celui du serveur. Cet ADR ne met pas en place de contrôle automatique de conformité.
- À revoir si : le contrat est généré automatiquement depuis le code, une autre source de référence est adoptée avec l’équipe ou les frontières entre les API évoluent. Dans le cas d’une génération, le maintien d’un fichier OpenAPI dans le dépôt devra rester compatible avec les consignes d’évaluation.
