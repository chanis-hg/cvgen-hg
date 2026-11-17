# CV Generator

Générateur de CV en ligne pour les étudiants et jeunes diplômés du Bénin. Gratuit, sans compte, les données restent sur l'appareil.

Démo : https://cv-gen-hg.netlify.app

## Ce que fait le site

- Éditeur en 6 étapes (identité, profil, formation, expériences et projets, compétences et langues, finalisation), formulaire à gauche et CV en direct à droite. Sur téléphone : onglets Formulaire et Aperçu, plus un bouton pour afficher l'aperçu en taille réelle.
- Dates saisies en mois + année : rien à deviner sur le format, et le CV sort toujours en MM/AAAA, la seule écriture que les logiciels de tri lisent de façon fiable. Les anciennes dates en texte libre sont conservées telles quelles.
- 5 modèles : Premier stage, Chronologique, Hybride, Développeur, Vitrine. Le modèle choisi donne la même mise en page à l'aperçu et dans le PDF.
- Mode Bénin (photo, état civil, références) ou International (sobre, sans photo ni état civil).
- PDF A4 par impression du navigateur : texte réel et sélectionnable, fichier nommé CV_Prenom_Nom.
- Assistant d'écriture local : constructeur d'accroche, suggestions de formules plus soutenues, correcteur du navigateur. La vérification de grammaire LanguageTool est optionnelle et ne s'exécute que sur clic.
- Vérification du CV (contact, accroche, formation, longueur d'une page, présence d'au moins un chiffre dans les missions).
- Mouvement discret : transitions courtes sur `transform` et `opacity` uniquement, pour rester fluide sur un téléphone modeste, et entièrement neutralisées si le système demande de réduire les animations.
- Sauvegarde automatique dans le navigateur, export et import des données en fichier JSON.
- Français et anglais, hors connexion après la première visite (PWA).

## Stack

React 18, Vite 5, CSS Modules, Vitest et Testing Library, ESLint, Prettier. Polices : Wúrà mi by GemmaS (titres) et Google Sans Flex (texte), toutes deux sous licence SIL OFL et auto-hébergées.

## Lancer en local

```bash
npm install
npm run dev
```

Commandes utiles : `npm test`, `npm run lint`, `npm run format`, `npm run build`.

## Structure

```
src/
  components/   Landing, choix du modèle, feuille de CV, composants communs
  editor/       Éditeur, étapes, assistant d'écriture, vérifications
  data/         Modèle de données, configuration des modèles
  lib/          Validation, dates, compression d'image, formules, LanguageTool
  styles/       Jetons de couleur, jetons de mouvement, base, polices
  i18n/         Textes français et anglais, libellés du CV
  test/         Tests unitaires et de composants
```

Un modèle est une simple configuration (ordre des sections, une ou deux colonnes) dans `src/data/templates.js` : ajouter un modèle ne demande pas de nouveau composant.

## Variables d'environnement (facultatives)

- `VITE_PORTFOLIO_URL` : lien du pied de page (par défaut gaiuschanis.netlify.app)
- `VITE_WHATSAPP_URL` : active le lien de retour d'avis par WhatsApp

## Couleur

Trois rôles, et un seul usage par rôle.

| Rôle                 | Jetons                    | Usage                                                      |
| -------------------- | ------------------------- | ---------------------------------------------------------- |
| Action               | `--accent`                | Ce sur quoi on clique, et l'anneau de focus. Rien d'autre. |
| Avancer dans le flux | `--ink`                   | Le seul bouton « Continuer ».                              |
| Alerte               | `--attention`, `--danger` | Ce qui reste à faire, puis ce qui est irréversible.        |
| Document             | `--doc-*`                 | Le CV : jeu plus sobre, pensé pour l'impression.           |

L'accent servait auparavant de marque, d'action, de lien, de titre de section du CV, de
libellé d'intertitre, d'anneau de focus et de puce. Une couleur qui veut dire sept choses
n'en dit plus aucune. Les intertitres sont passés en gris et les titres de section du CV en
quasi-noir : le filet les sépare déjà, et le document tient mieux à l'impression en noir et
blanc. Pas de vert : « fait » est discret, seul « à faire » ressort.

## Vérifications

| Vérification              | Résultat                                                                     |
| ------------------------- | ---------------------------------------------------------------------------- |
| `npm test`                | 130 tests                                                                    |
| `npm run lint`            | propre                                                                       |
| Accessibilité (axe, A/AA) | 0 violation sur les 3 pages, en 1440 px et en 390 px                         |
| Contraste                 | aucun texte sous le seuil, interface et CV compris                           |
| Clavier                   | 30 arrêts dans l'éditeur, tous nommés et avec un indicateur de focus visible |
| Cibles tactiles           | actions de ligne et boutons principaux à 44 px, rien sous 36 px              |
| PDF                       | 5 modèles × 2 modes : 1 page A4, texte réel, intitulés extraits intacts      |
| Poids                     | ~65 Ko de JS compressé à l'accueil                                           |
| Largeurs                  | pas de défilement horizontal à 360, 390, 900 et 1440 px                      |

## Limites connues

- Le modèle Vitrine (2 colonnes) n'est pas garanti pour les logiciels de tri automatique ; les quatre autres sont à une colonne.
- Les intitulés de section ressortent intacts de `pdftotext`, mais aucun envoi test dans un vrai logiciel de tri n'a été fait.
- L'interlettrage des titres du CV est volontairement limité à 0,06 em : au-delà, la couche texte du PDF découpe les mots.
- Les usages locaux du CV (photo, état civil) viennent d'un guide, pas d'un sondage de recruteurs béninois.
- La vérification de grammaire envoie le texte à LanguageTool (service tiers) seulement quand l'utilisateur le demande.

## Licences

Code : voir le dépôt. Polices : SIL OFL 1.1 (textes dans `src/assets/fonts` et dans le paquet @fontsource).

Fait par [Gaïus Chanis HONTONWAKOU](https://gaiuschanis.netlify.app)
