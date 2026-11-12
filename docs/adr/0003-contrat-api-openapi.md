# 0003. Nous documentons le contrat HTTP dans un fichier OpenAPI versionné

- Statut : proposée
- Date : 2026-11-10
- Décideurs : Adrien ;

## Contexte

Le frontend React devra appeler un service de recommandation recevant un type de produit, un brief, cinq préférences et une région. L’équipe Data développe FastAPI dans un dépôt distinct ; le contrat de `POST /ask` et `GET /health` a été défini ensemble.

Le fichier `openapi.yaml` décrit désormais le contrat convenu avec Data pour `GET /health` et `POST /ask`, incluant `region` et les exemples de succès, absence de correspondance et erreur. Il remplace la documentation de l’ancien socle Express retiré. Les consignes demandent un contrat versionné et un ADR qui le cite.

## Options

1. **Documenter les routes uniquement dans le README.** Avantages : rédaction simple et lecture directe dans GitHub. Inconvénients : absence de contrat structuré exploitable par les outils OpenAPI ; cette option seule ne répond pas à l’exigence d’un fichier OpenAPI.
2. **Conserver uniquement une documentation interactive hébergée.** Avantages : consultation et essais depuis un navigateur. Inconvénients : dépendance à la disponibilité du service ; une page Swagger seule ne fournit pas de contrat versionné dans notre dépôt et ne répond pas à la consigne.
3. **Conserver un fichier OpenAPI versionné avec le code.** Avantages : contrat structuré, historique Git, consultation avec des outils compatibles et validation du format. Inconvénients : maintenance nécessaire pour éviter un écart entre le contrat et l’implémentation.

## Décision

Nous choisissons l’option 3 comme proposition à valider, parce qu’elle permet de partager et de versionner le contrat HTTP avec le code sans dépendre de la disponibilité d’un service.

Le fichier de référence est [openapi.yaml](../../openapi.yaml). Il décrit `GET /health`, qui retourne HTTP 200 avec `{"status":"ok"}`, et le contrat convenu pour `POST /ask` : `product_type`, `brief`, `preferences` et `region`. Les deux résultats métier retournent HTTP 200 : `success` contient une recommandation et `no_match` contient `recommendation: null` et un message. L’erreur contient `error.code`, `error.message` et `error.details`. Les codes HTTP d’erreur n’étant pas précisés, le document utilise `default` sans inventer de statuts. Les routes sont simulées par `tools/data-mock/app.mjs`, selon l’ADR-0004 ; le fichier ne prouve pas la conformité du service FastAPI distant.

Les valeurs autorisées pour `region`, leur interprétation, la longueur maximale du brief et les autres codes d’erreur ne sont pas définis par cet accord. Ces points seront documentés lorsqu’ils seront précisés avec Data.

Toute modification d’une route, d’une requête ou d’une réponse devra être accompagnée de la mise à jour du contrat dans la même pull request. La vérification portera sur la validité OpenAPI du fichier et sur sa correspondance avec le code. La validation du format ne garantit pas à elle seule cette correspondance.

Le README sert de point d’entrée vers le fichier. Une documentation interactive pourra le compléter sans remplacer la copie versionnée.

## Conséquences

- Positives : le contrat est accessible dans le dépôt sans démarrer l’API ; il est consultable avec des outils compatibles OpenAPI ; ses évolutions peuvent être relues en pull request et comparées dans Git ; il fournit une référence commune pour préparer les appels et les réponses simulées.
- Négatives, à accepter : le fichier actuel est maintenu manuellement ; chaque évolution de l’API demande une vérification documentaire supplémentaire ; un document valide peut néanmoins décrire un comportement différent de celui du serveur. Cet ADR ne met pas en place de contrôle automatique de conformité.
- À revoir si : le contrat est généré automatiquement depuis le code, une autre source de référence est adoptée avec l’équipe ou les frontières entre les API évoluent. Dans le cas d’une génération, le maintien d’un fichier OpenAPI dans le dépôt devra rester compatible avec les consignes d’évaluation.
