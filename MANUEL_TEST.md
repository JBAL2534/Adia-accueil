# ADIA Présence - Manuel de test V1

## Objectif

Cette V1 permet de tester le parcours complet d'accueil patient dans un cabinet :

- création ou import de rendez-vous par le secrétariat ;
- validation d'arrivée sur tablette ;
- notification visible dans le pilotage ;
- prise en charge par l'équipe ;
- statistiques, exports et rapport de fin de journée.

## Lancer sur le Mac

Depuis le dossier du projet :

```bash
node demo-visible/serve-demo.mjs
```

Puis ouvrir :

```text
http://localhost:4173
```

En ouvrant l'application par cette adresse, la synchronisation multi-écrans est active. La borne iPad et le poste de pilotage partagent alors les mêmes données via le serveur local.

Si le port `4173` est déjà occupé, le serveur affiche automatiquement un autre port, par exemple `http://localhost:4174`.

## Tester sur iPad

1. Mettre le Mac et l'iPad sur le même Wi-Fi.
2. Lancer le serveur avec `node demo-visible/serve-demo.mjs`.
3. Trouver l'adresse IP du Mac.
4. Sur l'iPad, ouvrir Safari avec :

```text
http://ADRESSE-IP-DU-MAC:4173
```

Exemple :

```text
http://192.168.1.25:4173
```

Adapter le port si le serveur affiche `4174`, `4175`, etc.

Dans **Administration**, le panneau **Test iPad** affiche aussi l'adresse à ouvrir. Si l'application affiche `Mode local`, elle est ouverte en `file://` et chaque appareil garde ses propres données.

Le bloc **Supervision iPad** vérifie les points essentiels avant de poser la tablette à l'entrée :

- ouverture réseau active ;
- adresse à saisir sur l'iPad ;
- mode borne disponible ;
- planning chargé ;
- retour automatique après validation.

Le bouton **Guide iPad** télécharge une fiche d'installation rapide pour le cabinet.

## Préparer un pilote cabinet

Dans **Administration**, le bloc **Feu vert de test** indique si la V1 est prête pour une séance de test cabinet.

- Le score augmente quand l'application est ouverte en adresse réseau, les rendez-vous sont chargés, la borne est personnalisée et les premiers événements sont enregistrés.
- **Télécharger guide pilote** génère une fiche texte avec l'adresse de test, la checklist et le déroulé recommandé.
- Le guide rappelle que cette V1 est une version pilote locale, distincte d'une version SaaS commercialisable.

Le bloc **Observations du pilote** permet de noter les retours terrain pendant un essai :

- amélioration ;
- point bloquant ;
- question équipe ;
- retour patient ;
- incident iPad.

Chaque observation est ajoutée au journal et reste visible dans les derniers retours.

Le bouton **Télécharger bilan pilote** génère un compte rendu avec les indicateurs du jour, la préparation pilote et les retours terrain enregistrés.

Le bouton **Exporter backlog Trello** génère un fichier CSV pour transformer les retours et chantiers post-pilote en cartes de suivi.

## Parcours de test principal

Sur **Pilotage**, la checklist de test indique les étapes déjà validées :

- planning prêt ;
- borne testée ;
- pilotage actif ;
- journée exploitable.

Chaque étape propose un raccourci vers l'écran concerné.

1. Aller dans **Administration**.
2. Cliquer **Charger exemple**.
3. Cliquer **Importer les rendez-vous**.
4. Sur un rendez-vous, cliquer **Fiche patient** pour générer une fiche test.
5. Fermer la fiche, puis cliquer **Tester borne**.
6. Sur la borne, cliquer **Mode borne**.
7. Cliquer **Confirmer mon arrivée**.
8. Vérifier l'arrivée dans **Pilotage**.
9. Ajouter une **note interne**.
10. Cliquer **Prendre en charge**, puis **Terminer**.
11. Aller dans **Exploitation**.
12. Télécharger le rapport ou exporter les CSV.
13. Retourner dans **Administration**.
14. Sauvegarder le scénario de test.
15. Restaurer la sauvegarde pour vérifier que les données reviennent correctement.

## Actions secrétariat

L'écran **Accueil** est le poste quotidien du secrétariat. Il permet de :

- voir la situation immédiate de l'accueil ;
- rechercher rapidement un patient par nom, code, heure, praticien ou motif ;
- marquer rapidement un patient présent ;
- préparer la borne sur un rendez-vous précis ;
- marquer un patient absent ;
- vérifier un patient non retrouvé automatiquement ;
- enregistrer une visite sans rendez-vous ;
- accéder à la feuille d'accueil et à l'export des codes.

Dans **Administration**, chaque rendez-vous permet aussi :

- **Imprimer feuille accueil** : prépare une liste du jour avec heures, patients, praticiens et codes borne.
- **Exporter codes** : télécharge les codes d'accueil au format CSV pour partage ou contrôle.
- **Présence** : marque le patient présent sans utiliser la borne.
- **Annuler** : annule le rendez-vous et le retire de la file active.
- **Absent** : marque un rendez-vous non honoré sans créer d'arrivée.
- **Fiche patient** : génère une fiche imprimable.
- **Tester borne** : prépare la borne avec ce rendez-vous.

Dans **Import rapide** :

- choisir une source d'import ;
- télécharger un modèle si besoin ;
- coller les rendez-vous ;
- cliquer **Prévisualiser** pour voir les lignes prêtes et les alertes ;
- cliquer **Importer les rendez-vous** pour charger uniquement les lignes valides.

## Confidentialité pilote

Dans **Administration**, le **Centre RGPD pilote** présente les contrôles de confidentialité disponibles :

- mode discrétion ;
- exports de données ;
- journal d'audit ;
- périmètre limité aux données d'accueil ;
- points à prévoir pour la version SaaS commerciale.

Le bouton **Télécharger registre RGPD** génère un registre pilote à relire avec le cabinet.

## Pilotage de la file

Dans **Pilotage** :

- **Son désactivé / Son activé** active un signal sonore discret lors des arrivées.
- Les arrivées, transferts et messages déclenchent une notification visuelle.
- **Patients non retrouvés automatiquement** affiche les personnes à vérifier par l'accueil.
- **Rendez-vous attendus** affiche les prochains patients non encore arrivés avec actions rapides.
- **Actions prioritaires** met en avant les patients à vérifier, les attentes longues et les prochains rendez-vous.
- **Derniers appels** trace les patients appelés depuis le pilotage, le praticien ou l'assistante.
- **Occupation des salles** indique les salles libres, à préparer ou occupées.
- **Envoyer un message interne** diffuse une information dans le journal partagé.
- Les modèles permettent de prévenir rapidement l'équipe sans ressaisie.
- **Rechercher dans la file** filtre les patients et rendez-vous par nom, praticien, motif, salle ou horaire.
- Les filtres **Praticien**, **Salle** et **Statut** permettent d'isoler rapidement une situation.
- **Effacer** retire la recherche et remet les filtres à zéro.
- **Avancer de 5 min** simule l'évolution de la file et déclenche des alertes d'attente.
- **Appeler** trace un appel patient et prévient l'équipe sans changer le statut clinique.
- **Transférer un patient** change le praticien et la salle d'un patient actif, puis met à jour l'occupation des salles.
- Dans **Rendez-vous attendus**, **Présence** marque le patient arrivé, **Borne** prépare la tablette, et **Absent** marque un rendez-vous non honoré.

## Parcours tablette

- **Je viens voir une personne du cabinet** : le patient choisit un portrait, indique son nom, puis confirme son arrivée.
- En mode iPad paysage, la borne est organisée comme un seul écran : titre en haut, choix du cabinet, nom obligatoire, confirmation.
- La première ligne affiche les praticiens.
- La deuxième ligne affiche le secrétariat rattaché à chaque praticien.
- La troisième ligne affiche les assistantes cliniques rattachées à chaque praticien.
- Le nom du patient est obligatoire avant validation.
- La structure d'équipe est préparée pour pouvoir ajouter, supprimer ou masquer des emplacements selon le cabinet.
- Si le rendez-vous n'est pas retrouvé, le patient peut quand même confirmer son arrivée et l'accueil reçoit une alerte.
- **Voir le secrétariat** : enregistre une demande accueil.
- **Livraison ou visite** : enregistre une visite externe.
- **Mode borne** : masque le menu et met l'écran en usage patient.
- Après validation en **Mode borne**, la tablette revient automatiquement à l'accueil.

## Fiche rendez-vous

Dans **Administration**, chaque rendez-vous possède un bouton **Fiche patient**.

Cette fiche peut être imprimée ou téléchargée. Elle sert à tester le parcours réel suivant :

1. Le secrétariat remet ou envoie la fiche au patient.
2. Le patient arrive au cabinet.
3. Le patient présente la fiche à la borne ou saisit le code.
4. La présence est validée et visible dans le pilotage.

## Vérification technique

```bash
node demo-visible/check-demo.mjs
```

Le résultat attendu est :

```text
ADIA Présence V1 testable: vérification OK.
```

## Recette finale

Le fichier `RECETTE_FINALE_V1.md` liste les critères d'acceptation à cocher avant de présenter la V1 à un cabinet.

## Audit et traçabilité

Dans **Exploitation**, le panneau **Audit des événements** permet :

- filtrer les événements par type ;
- relire les dernières actions importantes ;
- télécharger un journal d'audit texte.
