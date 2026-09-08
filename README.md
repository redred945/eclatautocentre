# Éclat Auto Centre — site vitrine

Site vitrine statique (une page) pour un atelier de carrosserie, peinture, réparation de jantes alu, vitrage et personnalisation à Cercottes (45).

Refonte inspirée de `eclatautocentre.fr` : même contenu métier, direction artistique retravaillée (thème sombre, accent doré « éclat », grille, animations au défilement).

## Stack

HTML / CSS / JS pur — **aucune étape de build**, aucune dépendance. Vercel sert les fichiers tels quels.

```
index.html          Page unique (hero, services, atelier, réalisations, sinistre, contact)
assets/styles.css   Design system + responsive
assets/main.js      Header sticky, menu mobile, filtres portfolio, reveal au scroll, formulaire
assets/favicon.svg
vercel.json         cleanUrls + cache des assets
```

## Développement local

Ouvrir `index.html` dans le navigateur, ou :

```bash
npx serve .
```

## Déploiement

Connecté à Vercel via l'intégration Git : chaque push sur `main` déclenche un déploiement.

## À personnaliser

- **Horaires** (`index.html`, section Contact) : valeurs supposées `Lun–Ven 8h30–18h00, samedi sur RDV` — à confirmer.
- **Réseaux sociaux** : liens `href="https://www.facebook.com/"` etc. à remplacer par les vraies URL (`index.html`, footer + section contact + JSON-LD).
- **Photos des réalisations** : cartes actuellement en dégradés CSS (pas de reprise des photos du site d'origine). Remplacer par de vraies images dans `assets/` et ajouter une balise `<img>` dans chaque `<figure class="shot">`.
- **Formulaire de contact** : sans backend, il ouvre le client mail pré-rempli. Pour un vrai envoi, créer un endpoint (Formspree / Basin / Vercel Function) et mettre son URL dans l'`action` du `<form>` + retirer le bloc `form.addEventListener("submit", …)` dans `main.js`.
- **Carte** : iframe OpenStreetMap centrée approximativement sur Cercottes — ajuster `bbox`/`marker` avec les coordonnées exactes de l'atelier.

## Coordonnées

3 Rue des Pinsons, 45520 Cercottes · 02 38 15 16 02 · contact@eclatautocentre.fr
