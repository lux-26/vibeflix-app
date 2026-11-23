# VibeFlix 🎬

VibeFlix est une application web de découverte de films qui utilise l'API [TMDb](https://www.themoviedb.org/). Elle permet de consulter les films populaires, de rechercher un titre et d'affiner les résultats.

## Fonctionnalités

- Affichage des films populaires
- Recherche de films par titre
- Filtrage par genre
- Tri par popularité, note, date de sortie ou titre
- Affichage des affiches, notes et informations des films
- Interface en français et états de chargement/erreur

## Technologies

- HTML5
- CSS3
- JavaScript (Vanilla)
- API REST TMDb

## Lancer le projet

Le projet est une application frontend statique. Vous pouvez ouvrir `index.html` dans un navigateur ou utiliser l'extension Live Server de VS Code.

Une connexion Internet est nécessaire pour charger les données et les affiches depuis TMDb.

## Configuration TMDb

L'application utilise une clé API TMDb dans `app.js`. Pour votre propre utilisation :

1. Créez un compte sur [TMDb](https://www.themoviedb.org/).
2. Demandez une clé API depuis les paramètres de votre compte.
3. Configurez la clé selon votre environnement de développement.
4. Ne publiez jamais une clé privée ou un secret personnel dans un dépôt public. Si une clé a déjà été publiée, révoquez-la et générez-en une nouvelle.

> Une clé utilisée dans le navigateur reste visible par les visiteurs. Pour une application en production, privilégiez un backend qui contrôle les appels à l'API ou appliquez les restrictions disponibles auprès du fournisseur.

## Aperçu du dépôt

```text
vibeflix-app/
├── app.js
├── index.html
├── index.css
├── styles.css
└── readme.md
```

## Objectif pédagogique

Projet personnel à but éducatif et non commercial, réalisé pour pratiquer JavaScript, la manipulation du DOM, les appels API et la création d'interfaces web.

## Auteur

**Ablaye Tamba** — [GitHub @lux-26](https://github.com/lux-26)

Les données de films et les images sont fournies par TMDb. VibeFlix n'est ni affilié à TMDb ni approuvé par TMDb.
