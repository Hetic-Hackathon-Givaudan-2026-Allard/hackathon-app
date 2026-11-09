# 0002. Nous examinons les options de stack et de répartition des responsabilités

- Statut : proposée
- Date : 2026-11-09
- Décideurs : Adrien ; prénoms des membres Data et Product à compléter

## Contexte

L’application vise à aider un commercial à préparer ses rendez-vous plus rapidement et efficacement. Le détail du parcours, les sources de données disponibles et les critères de qualité restent à préciser avec les membres Product et Data.

Le socle existant utilise TypeScript, Vite, Express et PostgreSQL. Son interface permet de poser une question et de consulter les réponses enregistrées. React n’est pas encore intégré au projet.

L’équipe Data prévoit d’utiliser Python et FastAPI pour la partie IA. Le Tech Lead envisage de conserver le socle applicatif actuel en ajoutant React au frontend. Le niveau de maîtrise de React par les contributeurs reste à confirmer. Aucun budget d’hébergement ni objectif chiffré de latence n’est défini à ce stade ; l’échéance précise de livraison reste à renseigner.

L’architecture doit permettre aux contributeurs de développer l’interface, la logique applicative et les traitements IA avec des responsabilités explicites. Elle doit aussi limiter le travail d’intégration pendant le hackathon.

## Options

1. **React avec Vite, une API Express et un service IA FastAPI, avec PostgreSQL.** Avantages : réutilisation du backend existant, interface structurée en composants et séparation du développement applicatif et des traitements Python. Inconvénients : deux backends à lancer, intégrer et déployer ; contrats HTTP à maintenir ; gestion supplémentaire des délais et des erreurs entre services.
2. **React avec Vite et un backend FastAPI unique, avec PostgreSQL.** Avantages : un seul backend pour les routes métier, la persistance et l’IA ; suppression de l’appel intermédiaire entre Express et FastAPI. Inconvénients : migration de la logique Express vers Python et prise en charge de l’ensemble du backend par les contributeurs Python, ou montée en compétence des autres contributeurs.
3. **Conserver l’interface TypeScript sans React, avec Express et FastAPI, et PostgreSQL.** Avantages : aucun framework frontend supplémentaire à intégrer et réutilisation de l’interface existante. Inconvénients : gestion manuelle du DOM et des états de formulaire, de génération et de modification si ces interactions sont retenues dans le parcours Product ; même complexité d’intégration des deux backends que dans l’option 1.

## Décision

Aucune option n’est retenue à ce stade. Ce document rassemble des suggestions pour préparer la discussion avec l’équipe ; le statut « proposée » ne signifie pas que l’option 1 est privilégiée ou validée.

L’option 1 pourrait permettre de réutiliser Express et de séparer les traitements IA en Python. L’option 2 pourrait réduire le travail d’intégration en regroupant les responsabilités dans FastAPI. L’option 3 pourrait éviter l’ajout de React si le parcours reste simple. Le choix dépendra du parcours Product, des compétences disponibles et du temps nécessaire pour livrer une première version complète.

À titre d’exemple, si l’option 1 était retenue, la répartition pourrait être la suivante :

| Composant                 | Responsabilités                                                                                                                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| React, Vite et TypeScript | Afficher les informations utiles au rendez-vous, recueillir les saisies, présenter les états de chargement et les erreurs, permettre la consultation et la modification des préparations si ces fonctions sont retenues. |
| Express et TypeScript     | Exposer l’API utilisée par le frontend, valider les demandes applicatives, gérer les clients, rendez-vous et préparations selon le périmètre retenu, appeler FastAPI et enregistrer les données métier.                  |
| FastAPI et Python         | Préparer et traiter les données utiles à l’IA, accéder aux sources convenues avec Data et Product, appeler le modèle et retourner une préparation structurée accompagnée des références disponibles.                     |
| PostgreSQL                | Conserver les données applicatives et les préparations enregistrées, sous la responsabilité de l’API Express.                                                                                                            |

Dans cette hypothèse, le flux pourrait être : **React → Express → FastAPI → Express → PostgreSQL**, puis retour du résultat au frontend. Express pourrait également lire les données enregistrées sans appeler FastAPI. Le navigateur aurait Express comme point d’entrée applicatif.

Express pourrait gérer la persistance métier tandis que FastAPI recevrait le contexte nécessaire et retournerait le résultat du traitement. La responsabilité des données et les éventuels besoins de stockage Data resteraient à discuter pour éviter la duplication des règles métier et des écritures.

Si deux backends sont retenus, il serait utile de définir ensemble un contrat HTTP avant leur développement indépendant : exemples de requêtes et de réponses JSON, champs obligatoires, références des sources, format des erreurs et comportement en cas de dépassement du délai d’attente. Le schéma OpenAPI de FastAPI pourrait servir de référence et une réponse simulée permettrait d’avancer sans attendre le traitement IA.

Pour éclairer le choix, Product pourrait préciser les informations attendues dans une préparation et ses critères d’utilité. Data et le Tech Lead pourraient estimer le travail d’intégration et vérifier un premier parcours. La distinction entre faits sourcés et suggestions générées serait également à discuter.

Cet ADR ne sélectionne ni fournisseur ni modèle IA. Il ne décide pas non plus de l’ajout d’un RAG, d’une base vectorielle, d’une file de tâches ou d’un hébergement particulier.

## Conséquences

- Positives : si l’option 1 était retenue, le backend existant pourrait être réutilisé et les responsabilités applicatives et IA séparées ; un contrat partagé faciliterait le travail en parallèle. React pourrait structurer les interactions si le parcours le justifie. L’option 2 permettrait plutôt de réduire le nombre de backends, et l’option 3 éviterait l’ajout d’un framework frontend.
- Négatives, à accepter : aucun compromis n’est encore accepté. Les options 1 et 3 impliqueraient deux backends, des appels réseau supplémentaires et des dépendances Node.js et Python à intégrer à l’environnement. L’option 2 demanderait de déplacer la logique Express vers FastAPI. Les options avec React ajouteraient une dépendance et un apprentissage éventuel ; l’option sans React conserverait la gestion manuelle du DOM.
- À revoir si : le parcours Product, les sources de données, les compétences ou le temps disponible évoluent. Avant de retenir une option, vérifier notamment si Express aurait une logique applicative propre, si React répondrait à des interactions identifiées et si les temps de traitement seraient compatibles avec un appel HTTP synchrone. La décision devra être renseignée dans cet ADR après discussion avec l’équipe.
