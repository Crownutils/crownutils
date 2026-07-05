import { icons } from '@/discord/icons.js';
import type { CommandNode, LangNode } from '../types.js';
import { md } from '@/discord/markdown.js';

/**
 * Privacy-policy chapters, in display order. Each is a plain heading and body;
 * the viewer numbers and styles them. Command mentions use {@link md.code}.
 */
const privacy = {
  controller: {
    heading: 'Responsable du traitement',
    body: `Crownutils est un projet open source à but non lucratif, édité par Ntalcme. Pour exercer vos droits, utilisez les commandes ${md.code('data')} et ${md.code('delete-data')}.`,
  },
  dataCollected: {
    heading: 'Données collectées',
    body: "Nous conservons uniquement : votre identifiant Discord et celui des salons concernés, le contenu des rappels que vous créez, les accusés de lecture des mails, les dates de certaines actions (calcul d'itinéraire, demande d'accès) et votre acceptation des présents documents. Nous ne lisons pas vos messages et ne collectons aucune donnée sensible.",
  },
  purposes: {
    heading: 'Finalités',
    body: 'Ces données servent exclusivement à faire fonctionner les fonctionnalités du bot (rappels, mails, limites anti-abus) et à respecter vos choix.',
  },
  legalBasis: {
    heading: 'Base légale',
    body: "Le traitement repose sur votre consentement (votre acceptation) et sur l'exécution du service que vous demandez.",
  },
  retention: {
    heading: 'Durée de conservation',
    body: "Les rappels sont conservés jusqu'à leur envoi ou leur annulation ; les mails sont supprimés automatiquement après 14 jours ; les autres données sont conservées jusqu'à leur suppression par vos soins ou la disparition de leur finalité.",
  },
  sharing: {
    heading: 'Partage des données',
    body: 'Vos données ne sont jamais vendues. Elles transitent par Discord, soumis à sa propre politique de confidentialité. Les données du jeu Crownicles sont lues de manière publique, sans transmission de vos données personnelles.',
  },
  rights: {
    heading: 'Vos droits',
    body: `Conformément au RGPD, vous disposez d'un droit d'accès (commande ${md.code('data')}, limitée à une demande tous les 31 jours) et d'un droit à l'effacement (commande ${md.code('delete-data')}). L'effacement supprime également votre acceptation : vous devrez accepter de nouveau les documents pour réutiliser le bot. Vous pouvez introduire une réclamation auprès de la CNIL.`,
  },
  security: {
    heading: 'Sécurité',
    body: "Les données sont stockées sur l'infrastructure hébergeant le bot, avec un accès restreint.",
  },
  changes: {
    heading: 'Modifications',
    body: 'Ces documents peuvent être modifiés à tout moment, sans notification préalable. La version applicable est celle affichée par cette commande.',
  },
  law: {
    heading: 'Droit applicable',
    body: 'Les présentes dispositions sont régies par le droit français.',
  },
} as const;

/** Terms-of-service chapters, in display order. */
const terms = {
  purpose: {
    heading: 'Objet',
    body: "Crownutils est un bot utilitaire non officiel et indépendant. Il n'est ni affilié, ni partenaire, ni approuvé par le jeu Crownicles ou ses auteurs.",
  },
  acceptance: {
    heading: 'Acceptation',
    body: "L'utilisation du bot suppose l'acceptation préalable des présentes conditions ainsi que de la politique de confidentialité.",
  },
  use: {
    heading: 'Utilisation',
    body: "Le bot est destiné à un usage personnel. Sont notamment interdits : le spam, l'automatisation abusive, toute tentative de contournement ou de détournement, et tout usage illicite. Vous devez respecter les conditions d'utilisation de Discord et du jeu Crownicles.",
  },
  availability: {
    heading: 'Disponibilité',
    body: "Le service est fourni « en l'état », sans aucune garantie de disponibilité, de continuité ou d'absence d'erreurs. Il peut être suspendu, modifié ou arrêté à tout moment, notamment pour maintenance.",
  },
  liability: {
    heading: 'Responsabilité',
    body: "Dans les limites permises par la loi, l'éditeur ne peut être tenu responsable des dommages, directs ou indirects, résultant de l'utilisation ou de l'impossibilité d'utiliser le bot.",
  },
  personalData: {
    heading: 'Données personnelles',
    body: 'Le traitement de vos données est décrit dans la politique de confidentialité.',
  },
  changes: {
    heading: 'Modifications',
    body: "Les présentes conditions peuvent être modifiées à tout moment, sans notification préalable. La poursuite de l'utilisation vaut acceptation de la version en vigueur.",
  },
  termination: {
    heading: 'Résiliation',
    body: `Vous pouvez cesser d'utiliser le bot et supprimer vos données à tout moment via la commande ${md.code('delete-data')}. L'accès au bot peut être restreint en cas de non-respect des présentes conditions.`,
  },
  intellectualProperty: {
    heading: 'Propriété intellectuelle',
    body: 'Le jeu Crownicles et ses contenus demeurent la propriété de leurs auteurs respectifs. Le code de Crownutils est distribué sous licence PolyForm Noncommercial.',
  },
  law: {
    heading: 'Droit applicable',
    body: 'Les présentes conditions sont régies par le droit français. À défaut de résolution amiable, les tribunaux français sont compétents.',
  },
} as const;

const documents = { privacy, terms } satisfies LangNode;

export const legal = {
  cguButtonLabel: "Conditions d'utilisation",
  privacyButtonLabel: 'Confidentialité',
  cguTitle: `${icons.scroll} Conditions d'utilisation`,
  privacyTitle: `${icons.shield} Politique de confidentialité`,
  intro:
    "En utilisant Crownutils, vous acceptez la politique de confidentialité et les conditions d'utilisation ci-dessous.",
  documents,
} satisfies LangNode;

/** The `legal` command metadata; its content is the shared {@link legal} node. */
export const legalCommand = {
  description:
    "Consulter les conditions d'utilisation et la politique de confidentialité.",
} satisfies CommandNode;
