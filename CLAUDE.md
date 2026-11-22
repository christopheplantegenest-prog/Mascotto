# Mascotto — à lire au début de CHAQUE session

Christophe développe seul le jeu Mascotto (PWA : `index.html` + `service-worker.js`, base Firestore),
uniquement depuis son téléphone. Tutoie-le. Écris-lui en français, court, l'action en première ligne,
une seule question par tour.

## Avant de créer du contenu (pièce, zone, personnage, objet, robot, plante, prompt d'image)

Lire, à chaque fois, sans qu'il ait à le rappeler :

1. **La méthode de conception** : `const METHODE_CONCEPTION` dans `index.html` (règles numérotées,
   toutes à respecter : caméra à hauteur d'homme, premiers plans dégagés, comptoirs dessinés dans la
   pièce en deux temps, couleurs communes d'un lieu, récolte bien visible, adversaires qui rapportent…).
2. **Les chartes** : `CHARTE_DECOR`, `CHARTE_PERSO`, `CHARTE_POSE`, `CHARTE_CONCEPTION_DEFAUT`.
3. **Sa Bible et sa base réelles** : les fiches (personnages, horaires, lieux, objets, recettes,
   robots) sont dans sa base, pas dans le dépôt. Lui demander l'export s'il ne l'a pas joint :
   📖 Bible → 🔁 Échanges avec Claude → 📤 Tout exporter pour Claude. Ne jamais travailler sur une
   vieille copie (le banc a une copie ancienne : elle contient des équipements obsolètes).
4. **Vérifier dans cet export** que chaque objet, personnage ou lieu cité EXISTE et a sa place dans
   l'univers (usage connu : fabriquer, cuisiner, réparer, vendu quelque part). Ne rien inventer qui
   sorte de nulle part ; réutiliser les personnages et objets existants.

Le contrôle de conception du jeu (`controleConceptionScene`, `controleConceptionPlanche`,
`controleConceptionStades`, tâches rouges du guide 🧰 À finir) bloque une partie des fautes.
Chaque fois qu'il te reprend sur une règle : l'écrire dans `METHODE_CONCEPTION` ET l'ajouter au contrôle.

## Ses règles de travail

- Demander confirmation avant de coder. Vérifier soi-même (banc Playwright) : ne jamais lui
  demander de relire ou de contrôler.
- Ses images ChatGPT sont comptées : jamais d'essai à l'aveugle ; valider la méthode d'abord
  (calques de contrôle, schémas), une seule demande.
- Les prompts vivent dans le guide 🧰 À finir, jamais dans un éditeur. Le contenu arrive par un
  fichier d'import dans `imports/` (listé dans `imports/lisezmoi.txt`), jamais envoyé dans la conversation.
- Standardiser : réutiliser les systèmes existants (palette 🎛, pièces communes, variantes de scène…).
- Interface en jeu : peu de texte, pas d'emojis, lisible en plein soleil, aucun écran noir.

## Livrer

1. Incrémenter `white-space:nowrap;">vNNN<` dans `index.html` ET `mascotto-vNNN` dans `service-worker.js`.
2. `node --check` sur chaque script inline.
3. Tester sur le banc (`/home/claude/banc`, Playwright + fakefb) si possible.
4. Pousser soi-même : `git push https://github.com/christopheplantegenest-prog/Mascotto.git HEAD:main`.
5. Finir par « FICHIERS À MANIPULER SUR LE TÉLÉPHONE » (REMPLACER / AJOUTER / SUPPRIMER / NE PAS TOUCHER).
