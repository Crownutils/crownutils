import { icons } from '@/discord/icons.js';
import { md } from '@/discord/markdown.js';
import type { CommandLang } from './types.js';

/**
 * Full text of the privacy policy, shown in the `/legal` viewer. Section
 * headings are inlined with Markdown so the whole document fits in a single
 * text component (Components V2 has a per-message character budget).
 */
const privacyBody = [
  `**1. Responsable du traitement**`,
  `Crownutils est un projet open source à but non lucratif, édité par Ntalcme. Pour exercer vos droits, utilisez les commandes ${md.code('data')} et ${md.code('delete-data')}.`,
  ``,
  `**2. Données collectées**`,
  `Nous conservons uniquement : votre identifiant Discord et celui des salons concernés, le contenu des rappels que vous créez, les accusés de lecture des mails, les dates de certaines actions (calcul d'itinéraire, demande d'accès) et votre acceptation des présents documents. Nous ne lisons pas vos messages et ne collectons aucune donnée sensible.`,
  ``,
  `**3. Finalités**`,
  `Ces données servent exclusivement à faire fonctionner les fonctionnalités du bot (rappels, mails, limites anti-abus) et à respecter vos choix.`,
  ``,
  `**4. Base légale**`,
  `Le traitement repose sur votre consentement (votre acceptation) et sur l'exécution du service que vous demandez.`,
  ``,
  `**5. Durée de conservation**`,
  `Les rappels sont conservés jusqu'à leur envoi ou leur annulation ; les mails sont supprimés automatiquement après 14 jours ; les autres données sont conservées jusqu'à leur suppression par vos soins ou la disparition de leur finalité.`,
  ``,
  `**6. Partage des données**`,
  `Vos données ne sont jamais vendues. Elles transitent par Discord, soumis à sa propre politique de confidentialité. Les données du jeu Crownicles sont lues de manière publique, sans transmission de vos données personnelles.`,
  ``,
  `**7. Vos droits**`,
  `Conformément au RGPD, vous disposez d'un droit d'accès (commande ${md.code('data')}, limitée à une demande tous les 31 jours) et d'un droit à l'effacement (commande ${md.code('delete-data')}). L'effacement supprime également votre acceptation : vous devrez accepter de nouveau les documents pour réutiliser le bot. Vous pouvez introduire une réclamation auprès de la CNIL.`,
  ``,
  `**8. Sécurité**`,
  `Les données sont stockées sur l'infrastructure hébergeant le bot, avec un accès restreint.`,
  ``,
  `**9. Modifications**`,
  `Ces documents peuvent être modifiés à tout moment, sans notification préalable. La version applicable est celle affichée par cette commande.`,
  ``,
  `**10. Droit applicable**`,
  `Les présentes dispositions sont régies par le droit français.`,
].join('\n');

/** Full text of the terms of service, shown in the `/legal` viewer. */
const termsBody = [
  `**1. Objet**`,
  `Crownutils est un bot utilitaire non officiel et indépendant. Il n'est ni affilié, ni partenaire, ni approuvé par le jeu Crownicles ou ses auteurs.`,
  ``,
  `**2. Acceptation**`,
  `L'utilisation du bot suppose l'acceptation préalable des présentes conditions ainsi que de la politique de confidentialité.`,
  ``,
  `**3. Utilisation**`,
  `Le bot est destiné à un usage personnel. Sont notamment interdits : le spam, l'automatisation abusive, toute tentative de contournement ou de détournement, et tout usage illicite. Vous devez respecter les conditions d'utilisation de Discord et du jeu Crownicles.`,
  ``,
  `**4. Disponibilité**`,
  `Le service est fourni « en l'état », sans aucune garantie de disponibilité, de continuité ou d'absence d'erreurs. Il peut être suspendu, modifié ou arrêté à tout moment, notamment pour maintenance.`,
  ``,
  `**5. Responsabilité**`,
  `Dans les limites permises par la loi, l'éditeur ne peut être tenu responsable des dommages, directs ou indirects, résultant de l'utilisation ou de l'impossibilité d'utiliser le bot.`,
  ``,
  `**6. Données personnelles**`,
  `Le traitement de vos données est décrit dans la politique de confidentialité.`,
  ``,
  `**7. Modifications**`,
  `Les présentes conditions peuvent être modifiées à tout moment, sans notification préalable. La poursuite de l'utilisation vaut acceptation de la version en vigueur.`,
  ``,
  `**8. Résiliation**`,
  `Vous pouvez cesser d'utiliser le bot et supprimer vos données à tout moment via la commande ${md.code('delete-data')}. L'accès au bot peut être restreint en cas de non-respect des présentes conditions.`,
  ``,
  `**9. Propriété intellectuelle**`,
  `Le jeu Crownicles et ses contenus demeurent la propriété de leurs auteurs respectifs. Le code de Crownutils est distribué sous licence PolyForm Noncommercial.`,
  ``,
  `**10. Droit applicable**`,
  `Les présentes conditions sont régies par le droit français. À défaut de résolution amiable, les tribunaux français sont compétents.`,
].join('\n');

/** Strings for the `/legal` command and the acceptance gate. */
export const legal = {
  commandDescription:
    "Consulter la politique de confidentialité et les conditions d'utilisation, puis les accepter.",
  messages: {
    title: `${icons.scroll} Documents légaux`,
    intro:
      "En utilisant Crownutils, vous acceptez la politique de confidentialité et les conditions d'utilisation ci-dessous.",
    version: ({ version }: { version: string }): string => `Version ${version}`,
    privacyTab: 'Confidentialité',
    termsTab: "Conditions d'utilisation",
    privacyHeading: `${icons.shield} Politique de confidentialité`,
    termsHeading: `${icons.scroll} Conditions d'utilisation`,
    privacyBody,
    termsBody,
    acceptButton: "J'accepte",
    status: {
      accepted: ({ when }: { when: string }): string =>
        `${icons.check} Vous avez accepté ces documents ${when}.`,
      notAccepted: `${icons.warning} Vous n'avez pas encore accepté ces documents.`,
    },
    acceptedConfirmation: `${icons.check} Merci, votre acceptation a bien été enregistrée. Vous pouvez désormais utiliser le bot.`,
    gate: {
      title: `${icons.lock} Acceptation requise`,
      body: `Avant d'utiliser Crownutils, vous devez accepter la politique de confidentialité et les conditions d'utilisation. Vous pouvez les consulter à tout moment avec la commande ${md.code('legal')}.`,
      acceptButton: "J'accepte",
      accepted: `${icons.check} Merci ! Votre acceptation est enregistrée. Vous pouvez relancer votre commande.`,
    },
  },
} as const satisfies CommandLang;
