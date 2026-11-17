# Étude de cas : CV Generator

## Le problème

Au Bénin, beaucoup d'étudiants envoient des CV faits dans Word ou copiés d'un modèle trouvé sur WhatsApp : mise en page cassée à l'ouverture sur un autre appareil, PDF flou, pas d'aide pour rédiger le profil. Les générateurs étrangers ne prévoient pas les usages locaux (photo, état civil, références). Cette description est une hypothèse de départ, à confirmer par quelques entretiens avec des étudiants et des recruteurs.

## Ce que j'ai fait

1. Audit de la première version : PDF par capture d'image (texte non sélectionnable), aperçu caché sur mobile, aucune sauvegarde, validation faible, styles en ligne.
2. Recherche sur ce que lisent les recruteurs (lecture rapide, une page pour un débutant, sections attendues), avec le niveau de fiabilité de chaque source.
3. Conception de 5 écrans, puis de 5 modèles décrits par configuration.
4. Réécriture en composants React et CSS Modules, avec une interface bilingue.
5. Export PDF par impression CSS plutôt que par capture : texte réel, 1 page A4.
6. Assistant d'écriture sans coût : constructeur d'accroche, formules, correcteur du navigateur, vérification optionnelle.
7. Passe de finition : dates en mois/année, système de mouvement, correction d'un défaut d'extraction du PDF et d'un défaut d'accessibilité du fil d'étapes.

## Décisions et raisons

| Décision                                | Raison                                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------- |
| Impression CSS au lieu de html2pdf      | Texte sélectionnable, fichier léger, bibliothèque en moins                            |
| Modèles par configuration               | Un seul modèle de données, cinq mises en page, tests faciles                          |
| Assistant local plutôt qu'IA hébergée   | Pas de coût, pas d'envoi de texte, fonctionne hors connexion                          |
| Données gardées sur l'appareil          | Pas de compte, pas de base de données à protéger                                      |
| Mode Bénin / International              | Les attentes diffèrent selon l'employeur                                              |
| Dates par mois + année, jamais libres   | Format MM/AAAA lisible par les logiciels de tri, et rien à deviner pour l'utilisateur |
| Mouvement limité à transform et opacity | Composé par le GPU : pas de recalcul de mise en page sur un téléphone modeste         |

## Trois défauts trouvés en vérifiant, pas en relisant

**Les titres de section sortaient cassés du PDF.** L'interlettrage de 0,12 em des titres
était assez large pour que la couche texte du PDF insère des espaces : `FORMATION`
s'extrayait en `F O R M AT I O N`. Un logiciel de tri qui cherche les intitulés
standards ne reconnaissait donc plus aucune section. Le seuil a été mesuré en
générant des PDF à huit valeurs différentes ; à 0,06 em les sept intitulés testés
ressortent intacts, et le titre garde son allure.

**Le fil d'étapes n'avait pas de nom sur téléphone.** Sous 700 px le libellé passait
en `display: none` et l'icône de validation est décorative : une étape terminée
n'avait plus aucun nom accessible. Le libellé est maintenant masqué visuellement
mais conservé dans l'arbre d'accessibilité.

**Choisir le mois avant l'année effaçait le mois.** Un mois sans année n'est pas une
date et ne pouvait pas être stocké, donc le sélecteur se vidait. Le champ garde
désormais le mois en attente. Le test a été écrit dans cet ordre exprès.

## Passe de design

Une relecture avec un œil de designer a trouvé des problèmes qu'aucun test ne signalait,
parce qu'ils ne cassaient rien.

| Problème                                                                                                                                                                  | Correction                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| L'accueil promettait « remplissez à gauche, voyez le résultat à droite » et l'étape finale disait « relisez le CV à droite ». Sur téléphone il n'y a ni gauche ni droite. | Textes réécrits sans référence spatiale.                                           |
| L'étape finale demandait de corriger ce que la vérification signale, alors que celle-ci se trouvait sous une feuille A4 entière, hors écran.                              | La liste des manques remonte à gauche, sous la phrase qui la mentionne.            |
| Deux boutons intitulés « Construire mon accroche » faisaient deux choses différentes.                                                                                     | « M'aider à écrire mon accroche » ouvre, « Proposer 3 accroches » exécute.         |
| Même action, deux traitements : le téléchargement était noir en en-tête, bleu dans l'étape.                                                                               | Le bleu est l'action principale partout ; le noir ne sert plus qu'à « Continuer ». |
| Deux formulaires dépliés en permanence faisaient de l'étape Expériences la page la plus longue du parcours, y compris pour un étudiant qui n'a rien à y mettre.           | Formulaires fermés par défaut, états vides qui disent quoi mettre.                 |
| Quatre cibles de 36 px collées, la suppression au bout, sans annulation.                                                                                                  | 44 px, suppression détachée et en rouge, confirmation dans la ligne.               |
| L'aperçu montrait une page A4 vide aux deux tiers.                                                                                                                        | Une jauge indique la part de page occupée.                                         |
| Le compteur affichait « 92 / 400 » alors que le minimum attendu est 60.                                                                                                   | « 92 caractères — visez entre 60 et 400 », en alerte sous le seuil.                |
| L'accent bleu servait à sept choses à la fois.                                                                                                                            | Une couleur, un rôle : le bleu ne désigne plus que ce sur quoi on clique.          |

## Résultats mesurés

- 130 tests unitaires et de composants passent ; ESLint et Prettier sont propres.
- Contrôle d'accessibilité automatique (axe, règles WCAG 2 A, AA et bonnes pratiques) :
  aucune violation sur l'accueil, le choix du modèle et l'éditeur, en écran large
  et à 390 px.
- Parcours au clavier : 30 arrêts dans l'éditeur, tous avec un nom accessible et un
  indicateur de focus visible.
- 10 PDF générés (5 modèles dans les deux modes) : 1 page A4 chacun, texte réel,
  intitulés de section extraits intacts, état civil et références présents ou absents
  selon le mode.
- JavaScript de l'accueil : environ 65 Ko compressés (budget : 150 Ko).
- Contraste : aucun texte sous le seuil WCAG, interface et CV compris, après le changement
  de palette.
- Cibles tactiles : actions de ligne et boutons principaux à 44 px.
- Aucun défilement horizontal à 360 px, 390 px, 900 px et 1440 px, y compris quand
  l'aperçu est agrandi.

## Ce qui reste à vérifier

- Le rendu sur de vrais téléphones Android d'entrée de gamme.
- La lecture des PDF par de vrais logiciels de tri et par des recruteurs.
- Le fonctionnement de la vérification de grammaire en conditions réelles (testée seulement avec des réponses simulées).
- Les obligations légales de protection des données au Bénin.
- Le comportement réel des logiciels de tri : les intitulés ressortent intacts de
  `pdftotext`, ce qui est un indice sérieux mais pas une preuve. Un envoi test dans
  un vrai ATS reste à faire.
- L'utilité de la vérification « au moins un chiffre » auprès de vrais utilisateurs :
  le conseil est solide, son taux d'adoption est inconnu.

## Présentation orale

30 secondes : j'ai construit un générateur de CV gratuit pour les étudiants béninois. Le CV s'affiche en direct, cinq modèles s'adaptent à la situation, et le PDF garde un texte sélectionnable. Tout reste sur l'appareil.

2 minutes : ajouter le choix technique le plus défendable (l'impression CSS à la place de la capture d'image), la preuve (10 PDF vérifiés, 130 tests, accessibilité contrôlée), un défaut que seule la vérification pouvait trouver (les titres de section qui sortaient en `F O R M AT I O N` du PDF et redevenaient illisibles pour un logiciel de tri) et la limite honnête (pas encore testé avec des recruteurs locaux).
