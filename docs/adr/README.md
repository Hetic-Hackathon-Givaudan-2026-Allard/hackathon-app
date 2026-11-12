# Décisions d'architecture

Un ADR (Architecture Decision Record) conserve le contexte d'une décision technique, les options envisagées, le choix retenu et ses conséquences. Il explique pourquoi le projet est construit ainsi, y compris les compromis acceptés.

Une décision structurante correspond à un fichier court, versionné avec le code. Une absence de fonctionnalité ne constitue pas automatiquement une exclusion décidée.

## Registre

| ADR                                         | Sujet                                                | Statut   |
| ------------------------------------------- | ---------------------------------------------------- | -------- |
| [0001](0001-environnement-developpement.md) | Environnement partagé avec VS Code et Dev Containers | proposée |
| [0002](0002-stack-et-responsabilites.md)    | MVP React et service FastAPI Data                    | proposée |
| [0003](0003-contrat-api-openapi.md)         | Contrat HTTP documenté avec OpenAPI                  | proposée |

L’[ADR-0002](0002-stack-et-responsabilites.md) propose React, TypeScript et Vite avec un appel direct au service FastAPI Data pour le MVP sans historique. Le socle React est installé, sans parcours métier ni simulation ; le contrat de `GET /health` et `POST /ask` avec région est défini avec Data et documenté dans `openapi.yaml`. Son implémentation distante, les statuts HTTP d’erreur et l’hébergement du catalogue restent à vérifier ou préciser.

L'ADR reste au statut « proposée » tant que sa validation n'a pas été formalisée. La présence de composants dans le socle actuel ne vaut pas décision définitive de les conserver.

## Comment les utiliser

1. Relire les contraintes et remplacer les hypothèses par les raisons réelles du projet.
2. Discuter la décision en pull request avec les personnes concernées. Pour l'IA et le périmètre métier, associer notamment les membres Data et Product.
3. Passer le statut à **acceptée** après validation et renseigner la date et les décideurs. Utiliser **rejetée** si la proposition n'est pas retenue.
4. Si une décision acceptée change, créer un nouvel ADR, puis marquer l'ancien **remplacée par [NNNN](NNNN-titre.md)**. Conserver l'historique et lier les deux documents.

Il n'est pas nécessaire d'écrire un ADR pour chaque bibliothèque. Privilégier les choix qui engagent le projet ou dont les alternatives ont des conséquences significatives.

## Modèle pour une nouvelle décision

```markdown
# NNNN. Titre : la décision, au présent

- Statut : proposée | acceptée | rejetée | remplacée par [NNNN](NNNN-titre.md)
- Date : AAAA-MM-JJ
- Décideurs : prénoms

## Contexte

Le problème, les contraintes (délai, budget, compétences). Des faits, pas des opinions.

## Options

1. Option A : avantages, inconvénients.
2. Option B : avantages, inconvénients.

## Décision

Nous choisissons l’option … parce que …

## Conséquences

- Positives : …
- Négatives, à accepter : …
- À revoir si : …
```
