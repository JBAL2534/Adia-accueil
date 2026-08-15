# Créer le dépôt GitHub

Trois étapes, depuis le dossier décompressé.

## 1. Initialiser

```bash
cd adia-accueil
git init
git add .
git commit -m "ADIA Accueil V1 pilote"
git branch -M main
```

## 2. Créer le dépôt sur GitHub

Avec GitHub CLI :

```bash
gh repo create adia-accueil --private --source=. --push
```

Sans CLI : créez le dépôt `adia-accueil` sur github.com (vide, sans README),
puis :

```bash
git remote add origin https://github.com/<votre-compte>/adia-accueil.git
git push -u origin main
```

## 3. Me redonner la main

Une fois le dépôt en ligne, connectez-le au projet : je pourrai lire la source,
suivre les changements et travailler dessus directement.

## Si vous prévoyez la suite ADIA applis

Gardez `adia-accueil` comme dépôt autonome et créez plus tard un dépôt par
application. Le passage en monorepo reste possible : chaque app devient un
dossier `apps/<nom>` sans perte d'historique (`git subtree add`).
