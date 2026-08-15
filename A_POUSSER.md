# À pousser sur le dépôt

Le dépôt `JBAL2534/Adia-accueil` contient déjà l'application. Il manque deux
fichiers et le README décrit une arborescence `demo-visible/` qui n'existe pas
en ligne. Ce dossier contient les trois fichiers corrigés, à copier à la racine
du dépôt.

| Fichier | Action |
| --- | --- |
| `serve-demo.mjs` | ajout — mode multi-postes (borne iPad + secrétariat sur le même état) |
| `check-demo.mjs` | ajout — contrôle d'intégrité avant démo |
| `README.md` | remplacement — aligné sur la structure à plat, sans `demo-visible/` |

## Commandes

```bash
cd <votre-clone-de-Adia-accueil>
cp <chemin>/a-pousser/serve-demo.mjs .
cp <chemin>/a-pousser/check-demo.mjs .
cp <chemin>/a-pousser/README.md .

node check-demo.mjs        # doit afficher: vérification OK
git add serve-demo.mjs check-demo.mjs README.md
git commit -m "Ajout serveur multi-postes et contrôle d'intégrité, README aligné"
git push
```

Si `check-demo.mjs` échoue, il nomme précisément l'élément manquant : c'est le
signe que la version en ligne d'`index.html`, `script.js` ou `styles.css` est
plus ancienne que celle du projet.

## Recommandé ensuite

Ajoutez un `.gitignore` à la racine du dépôt s'il n'y en a pas :

```
.demo-state.json
.DS_Store
node_modules/
```

`.demo-state.json` est l'état de démo du serveur local, il ne doit pas être
versionné.
