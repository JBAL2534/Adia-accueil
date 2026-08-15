# ADIA Accueil

Application d'accueil et de présence patient pour cabinet dentaire.
Version pilote locale, testable en cabinet, sans backend.

## Contenu

```
demo-visible/
  index.html          Application complète (7 espaces)
  script.js           Logique métier, état, exports
  styles.css          Design system ADIA (tokens + composants)
  adia-accueil-mark.svg
  serve-demo.mjs      Serveur local avec état partagé entre postes
  check-demo.mjs      Contrôle d'intégrité de la démo
  MANUEL_TEST.md      Manuel de test cabinet
  RECETTE_FINALE_V1.md Recette V1
```

## Lancer en local

Ouverture simple (état par navigateur) :

```bash
open demo-visible/index.html
```

Mode multi-postes (borne iPad + secrétariat + pilotage sur le même état) :

```bash
node demo-visible/serve-demo.mjs
# puis http://<ip-du-poste>:4173
```

Variables : `HOST` (défaut 0.0.0.0), `PORT` (défaut 4173).

## Les sept espaces

| Espace | Rôle |
| --- | --- |
| Pilotage | Vue temps réel : file, salles, actions prioritaires, journal |
| Accueil | Console secrétariat : recherche, RDV minute, demandes, carnet terrain |
| Borne accueil | Écran patient tablette : choix de la personne, saisie du nom, confirmation |
| Praticien | File clinique personnelle, prise en charge, fin de soin |
| Assistante | Préparations patients par agenda |
| Administration | Paramétrage cabinet, équipe, marque, RGPD, recette, liens postes |
| Exploitation | Statistiques, ponctualité, clôture, audit, exports CSV |

## Paramétrage cabinet

Tout est configurable depuis Administration, sans toucher au code :

- **Identité** : nom du cabinet, logo, couleur principale, couleur accent.
- **Confort borne** : taille du texte (standard / grand / très grand), contraste renforcé, boutons larges, mode senior, durée de confirmation (4–20 s), retour automatique, aide à la saisie du nom, bouton d'aide et son libellé.
- **Profils borne** prédéfinis : standard, senior, affluence, premium.
- **Textes patient** : titre de bienvenue, message, consignes avant et après validation, avec variables `{nom}`, `{praticien}`, `{cible}`.
- **Structure d'équipe** : effectifs praticiens / secrétaires / assistantes (0 à 12 chacun), noms, photos, agenda géré par chaque secrétaire ou assistante, secrétariat mutualisé possible.
- **Intitulés des postes** renommables (hygiéniste, coordinatrice, prothésiste…), propagés partout.
- **Modèles de structure** : une secrétaire par praticien, secrétaires + assistante par agenda, cabinet solo, secrétariat mutualisé, grand cabinet 5 praticiens.
- **Mode discrétion** des noms sur les écrans équipe.

## Données et persistance

- État complet dans `localStorage`, clé `adia-presence-visible-demo` : rendez-vous, patients, journal, paramétrage cabinet.
- En mode serveur, état partagé dans `demo-visible/.demo-state.json`.
- Sauvegarde et restauration JSON depuis Administration (format `adia-presence-demo-v1`).
- Statuts patient : `scheduled`, `arrived`, `waiting`, `in_care`, `completed`, `no_show`.
- Import de planning au format `Patient;Code;Heure;Praticien;Salle;Motif`.

## Design system

Tokens dans `styles.css` (`:root`) : fonds ivoire (`#f4f1ea`), encres neutres,
bleu institutionnel `#163d6e`, teal `#0f766e`, signature ADIA Accueil `#d9629c`,
accent champagne `#d6b56d`. Typographies Hanken Grotesk (interface) et
Newsreader (titres de page uniquement).

## Limites de la V1

Pas de comptes utilisateurs, pas d'authentification, pas de base de données,
pas de dossier médical. RGPD au niveau pilote. Les connecteurs métier
(Julie, Doctolib, Logos, Visiodent) restent à réaliser.
