# ADIA Présence - Recette finale V1 testable

## Décision de périmètre

La V1 testable couvre l'objectif principal : savoir qu'un patient est arrivé, le rendre visible à l'équipe, suivre sa prise en charge, puis exploiter la journée.

Elle ne couvre pas encore :

- intégration réelle Julie ;
- OCR réel de document ;
- authentification multi-utilisateur ;
- base de données serveur ;
- synchronisation temps réel SaaS multi-postes.

Ces sujets relèvent de la version SaaS complète.

## Critères d'acceptation

### 1. Administration

- Le secrétariat dispose d'un écran Accueil dédié au travail quotidien.
- Le secrétariat peut rechercher un patient par nom, code, heure, praticien ou motif.
- Le cabinet peut personnaliser le nom, le titre et le message de la borne.
- Le secrétariat peut créer un rendez-vous manuellement.
- Le secrétariat peut importer plusieurs rendez-vous par copier-coller.
- Le secrétariat peut sauvegarder puis restaurer un scénario de test.
- L'adresse de test iPad est visible depuis l'application.
- Le cabinet voit un score de préparation pilote avant une séance de test.
- Le cabinet peut télécharger un guide pilote avec checklist et déroulé recommandé.
- Le cabinet voit une supervision iPad avec guide d'installation tablette.
- Le cabinet peut enregistrer des observations terrain pendant le pilote.
- Le cabinet peut télécharger un bilan pilote avec indicateurs et retours terrain.
- Le cabinet peut exporter un backlog post-pilote au format CSV exploitable dans Trello.
- Le cabinet peut consulter un centre RGPD pilote et télécharger un registre RGPD.
- Le secrétariat peut générer une fiche rendez-vous imprimable pour un patient.
- Le secrétariat peut préparer une feuille d'accueil du jour avec les codes borne.
- Le secrétariat peut exporter les codes d'accueil en CSV.
- Le secrétariat peut prévisualiser un import de rendez-vous et télécharger un modèle.
- Le secrétariat peut saisir une présence manuellement.
- Le secrétariat peut enregistrer une visite sans rendez-vous depuis l'écran Accueil.
- Le secrétariat peut annuler un rendez-vous.
- Le secrétariat peut marquer un patient absent.

### 2. Borne patient

- Un patient avec rendez-vous peut confirmer sa présence.
- Un patient peut choisir la personne du cabinet avec de grands cadres visuels.
- La borne peut présenter cinq praticiens sur la première ligne.
- Les cartes patient sont organisées en trois lignes : praticiens, secrétariat par praticien, assistantes cliniques par praticien.
- Le nom du patient est obligatoire avant confirmation.
- En mode iPad paysage, la borne tient sur un écran sans colonne gauche.
- La structure d'équipe prépare l'ajout, la suppression ou le masquage d'emplacements photos par cabinet.
- Un patient peut confirmer son arrivée sans scanner de carton de rendez-vous.
- Un patient peut être retrouvé par nom ou code si nécessaire.
- Un patient non retrouvé automatiquement peut confirmer sa présence sans être bloqué.
- L'accueil reçoit une alerte de vérification pour ce patient.
- Une demande secrétariat peut être enregistrée.
- Une livraison ou visite externe peut être enregistrée.
- Le mode plein écran peut être demandé sur la borne.
- Le mode borne masque le menu latéral pour présenter un écran patient dédié.
- Après confirmation en mode borne, l'interface revient automatiquement à l'accueil.

### 3. Pilotage cabinet

- Le pilotage affiche une checklist de test guidée pour savoir quoi vérifier.
- Une arrivée est visible immédiatement dans le tableau.
- Une arrivée déclenche une notification visuelle.
- Le signal sonore peut être activé ou désactivé.
- Les patients non retrouvés automatiquement sont visibles dans une file de vérification accueil.
- Les rendez-vous encore attendus sont visibles directement dans le pilotage.
- Les actions prioritaires affichent automatiquement les vérifications, attentes longues et prochains rendez-vous.
- Le secrétariat peut marquer une présence, préparer la borne ou noter une absence depuis le pilotage.
- L'équipe peut appeler un patient et conserver une trace des derniers appels.
- Le secrétariat peut filtrer le pilotage par praticien, salle et statut.
- L'équipe voit l'occupation des salles : libre, à préparer ou occupée.
- L'équipe peut filtrer la file par nom, praticien, motif, salle ou horaire.
- L'équipe peut simuler l'évolution de l'attente et voir les alertes.
- L'équipe peut transférer un patient vers un autre praticien ou une autre salle et voir l'occupation se mettre à jour.
- L'équipe peut envoyer un message interne visible dans le journal partagé.
- L'équipe peut passer un patient en prise en charge.
- L'équipe peut terminer un patient.
- Une note interne peut être ajoutée à un patient.
- Le journal temps réel garde les événements importants.

### 4. Confidentialité

- Le mode discrétion masque partiellement les noms sur les écrans équipe.
- Le rapport et les exports restent disponibles pour l'exploitation.

### 5. Exploitation

- Les statistiques du jour sont visibles.
- L'activité par praticien est lisible.
- Le rapport indique les rendez-vous encore attendus.
- Le rapport indique le nombre d'appels patients tracés.
- Le rapport indique les salles occupées et les salles à préparer.
- Le rapport indique le nombre de patients à vérifier par l'accueil.
- Le rapport de journée peut être téléchargé.
- Les arrivées et rendez-vous peuvent être exportés en CSV.
- Le journal d'audit peut être filtré et exporté.
- La journée peut être clôturée.

### 6. Test multi-écrans local

- L'application ouverte via `http://localhost:4173` indique que la synchronisation multi-écrans est active.
- Une arrivée validée sur la borne iPad est visible sur le pilotage Mac après quelques secondes.
- Une action effectuée sur le pilotage Mac est visible après rafraîchissement ou synchronisation sur l'autre écran.

## Parcours de validation rapide

1. Lancer `node demo-visible/serve-demo.mjs`.
2. Ouvrir `http://localhost:4173`.
3. Administration: charger et importer l'exemple.
4. Administration: prévisualiser l'import et télécharger le modèle.
5. Administration: personnaliser le cabinet.
6. Administration: vérifier le `Centre RGPD pilote` et télécharger le registre RGPD.
7. Administration: vérifier la feuille d'accueil du jour et exporter les codes.
8. Accueil: vérifier la console secrétariat.
9. Accueil: rechercher un patient par nom ou heure.
10. Accueil: marquer une présence depuis les résultats de recherche.
11. Accueil: enregistrer une visite sans rendez-vous.
12. Administration: générer une fiche patient sur un rendez-vous.
13. Administration: tester une présence manuelle sur un autre rendez-vous.
14. Administration: annuler un rendez-vous.
15. Administration: marquer un patient absent.
16. Administration: vérifier la `Supervision iPad` et télécharger le guide iPad.
17. Administration: vérifier le `Feu vert de test` et télécharger le guide pilote.
18. Administration: ajouter une observation dans `Observations du pilote`.
19. Administration: télécharger le `Bilan pilote`.
20. Administration: exporter le backlog Trello.
21. Administration: cliquer `Tester borne` sur un rendez-vous.
22. Borne: activer `Mode borne`.
23. Borne: confirmer la présence.
24. Pilotage: vérifier l'arrivée et ajouter une note.
25. Pilotage: utiliser `Rendez-vous attendus` pour marquer une présence.
26. Pilotage: utiliser `Rendez-vous attendus` pour préparer la borne ou marquer absent.
27. Pilotage: utiliser les filtres Praticien, Salle et Statut.
28. Pilotage: vérifier que `Actions prioritaires` propose les actions immédiates.
29. Pilotage: cliquer `Appeler` sur un patient et vérifier `Derniers appels`.
30. Borne: saisir un nom inconnu et confirmer la présence.
31. Pilotage: vérifier l'alerte accueil et cliquer `Marquer vérifié`.
32. Pilotage: vérifier l'occupation des salles, puis transférer un patient.
33. Pilotage: prendre en charge puis terminer.
34. Borne: tester une visite externe.
35. Exploitation: filtrer et exporter le journal d'audit.
36. Exploitation: télécharger rapport, exporter CSV, clôturer journée.
37. Administration: sauvegarder le scénario.
38. Administration: restaurer la sauvegarde.
39. Ouvrir l'adresse iPad indiquée dans Administration sur une tablette.
40. Valider une arrivée depuis la tablette.
41. Vérifier l'arrivée sur le pilotage Mac.

## Statut

Si tous les points ci-dessus fonctionnent, la V1 visible est validée pour démonstration cabinet et discussion produit.
