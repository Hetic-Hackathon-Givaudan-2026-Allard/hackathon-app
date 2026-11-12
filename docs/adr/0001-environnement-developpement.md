# 0001. Nous partageons l’environnement de développement avec VS Code et Dev Containers

- Statut : proposée
- Date : 2026-11-08
- Décideurs : Adrien Allard

## Contexte

Le projet hackathon réunit des étudiants des mastères CTO/Tech Lead, Product et Data de HETIC. Le professeur demande un dépôt GitHub qui facilite l’installation des nouveaux membres et l’exécution du projet sur leur machine.

Lors de la rédaction initiale, le sujet métier n’était pas encore connu. La stack MVP est maintenant décrite dans l’ADR-0002 ; le modèle IA reste à définir avec Data. Les compétences techniques et les configurations matérielles de l’ensemble des participants ne sont pas encore recensées. Aucun budget d’hébergement ni délai précis d’installation n’est documenté à ce stade.

Le dépôt contient déjà une configuration VS Code Dev Containers et Docker Compose. Le parcours VS Code fournit un conteneur de travail, installe les dépendances avec `npm ci` et démarre le mock Data séparément. Le frontend est lancé avec `npm run dev`. Le parcours autonome `docker compose up` lance le frontend et le mock sans VS Code, selon l’ADR-0004. PostgreSQL reste retiré.

## Options

1. **Installer les outils directement sur chaque machine.** Avantages : liberté de l’éditeur et absence de conteneur de travail. Inconvénients : installation et maintenance de chaque outil sur chaque poste, avec des différences possibles de versions et de configuration.
2. **Conteneuriser uniquement les services, dont PostgreSQL.** Avantages : configuration commune des services et liberté de l’éditeur. Inconvénients : les outils de développement, dont Node.js et npm dans le socle actuel, restent à installer et à configurer sur chaque poste.
3. **Utiliser VS Code avec Dev Containers et Docker Compose.** Avantages : configuration de développement versionnée dans le dépôt, outils regroupés dans le conteneur et installation automatisée des dépendances. Inconvénients : installation préalable de VS Code, de l’extension Dev Containers et de Docker, consommation de ressources et téléchargement initial des images.

## Décision

Nous choisissons l’option 3, VS Code avec Dev Containers et Docker Compose, parce qu’elle permet de partager la configuration de développement dans le dépôt et d’automatiser les étapes d’installation pour les nouveaux membres.

Cette décision concerne l’environnement de développement. Le contenu du conteneur et les services Compose évolueront avec les besoins de l’équipe ; elle ne rend pas définitifs les choix actuels de stack applicative ou d’IA.

## Conséquences

- Positives : les membres disposent d’une configuration commune et versionnée ; le parcours documenté n’impose pas d’installer Node.js et PostgreSQL directement sur leur machine ; la préparation des dépendances est automatisée.
- Négatives, à accepter : Docker et VS Code sont nécessaires au parcours retenu ; les images et dépendances doivent être téléchargées ; les conteneurs consomment des ressources ; les éventuels services sur l’hôte restent à configurer séparément. Les images ne sont pas épinglées par digest, ce qui limite la reproductibilité exacte.
- À revoir si : les machines des participants ne peuvent pas exécuter Docker, les restrictions réseau empêchent l’installation, les besoins Data ou Product ne sont pas couverts par cet environnement ou un environnement distant devient nécessaire.
