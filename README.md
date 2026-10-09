# baptistecourtachon.com

Site de Baptiste Courtachon, joueur pro et enseignant de golf au Golf de Marcilly (Loiret).

La nouvelle version garde l'identité d'origine : logo Courtach', bleu nuit `#103045`, jaune `#FEED01`, police Titillium Web, surlignages jaunes et photos de Baptiste.

## Structure

- `index.html` : le site complet, en une page.
- `img/` : photos, logo et logos partenaires, optimisés en WebP.
- `fonts/` : police Titillium Web hébergée sur le site (licence OFL), sans appel à Google Fonts.
- `js/main.js` : les animations du site.
- `js/` : GSAP et ScrollTrigger (animations au défilement) et Lenis (défilement fluide), hébergés sur le site.

Les animations sont désactivées automatiquement pour les visiteurs qui ont réglé leur appareil sur « réduire les animations ».

Le site est statique, sans dépendance ni étape de build. Il est publié avec GitHub Pages depuis la branche `main`, dossier racine.

## Modifier les contenus

Tout se trouve dans `index.html` :

- les tarifs sont dans la section `#lecons` ;
- les stages sont dans `#stages` ;
- les partenaires sont dans `#partenaires` ;
- les coordonnées sont dans `#contact`.

## Nom de domaine

1. Dans Settings → Pages, renseigne `baptistecourtachon.com` comme domaine personnalisé.
2. Fais pointer le DNS du domaine vers GitHub Pages.
