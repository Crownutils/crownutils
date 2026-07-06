import { icons } from '@/discord/theme/icons.js';
import type { CommandNode, LangNode } from '../types.js';
import { md } from '@/discord/theme/markdown.js';

/**
 * Privacy-policy chapters, in display order. Each is a plain heading and body;
 * the viewer numbers and styles them. Command mentions use {@link md.code}.
 */
const privacy = {
  controller: {
    heading: 'Data controller',
    body: `Crownutils is a non-profit open source project maintained by Ntalcme. To exercise your rights, use the ${md.code('data')} and ${md.code('delete-data')} commands.`,
  },
  dataCollected: {
    heading: 'Data collected',
    body: 'We only keep: your Discord id and those of the relevant channels, the content of the reminders you create, mail read receipts, the dates of certain actions (route calculation, access request) and your acceptance of these documents. We do not read your messages and collect no sensitive data.',
  },
  purposes: {
    heading: 'Purposes',
    body: 'This data is used solely to run the bot features (reminders, mails, anti-abuse limits) and to respect your choices.',
  },
  legalBasis: {
    heading: 'Legal basis',
    body: 'Processing is based on your consent (your acceptance) and on the performance of the service you request.',
  },
  retention: {
    heading: 'Retention period',
    body: 'Reminders are kept until they are sent or cancelled; mails are deleted automatically after 14 days; other data is kept until you delete it or its purpose no longer applies.',
  },
  sharing: {
    heading: 'Data sharing',
    body: 'Your data is never sold. It passes through Discord, which is subject to its own privacy policy. Crownicles game data is read publicly, without any transfer of your personal data.',
  },
  rights: {
    heading: 'Your rights',
    body: `Under the GDPR, you have a right of access (${md.code('data')} command, limited to one request every 31 days) and a right to erasure (${md.code('delete-data')} command). Erasure also removes your acceptance: you will have to accept the documents again to use the bot. You may lodge a complaint with the CNIL, the French data protection authority.`,
  },
  security: {
    heading: 'Security',
    body: 'Data is stored on the infrastructure hosting the bot, with restricted access.',
  },
  changes: {
    heading: 'Changes',
    body: 'These documents may be changed at any time, without prior notice. The applicable version is the one shown by this command.',
  },
  law: {
    heading: 'Governing law',
    body: 'These provisions are governed by French law.',
  },
} as const;

/** Terms-of-service chapters, in display order. */
const terms = {
  purpose: {
    heading: 'Purpose',
    body: 'Crownutils is an unofficial, independent utility bot. It is neither affiliated with, partnered with, nor endorsed by the Crownicles game or its authors.',
  },
  acceptance: {
    heading: 'Acceptance',
    body: 'Using the bot requires prior acceptance of these terms and of the privacy policy.',
  },
  use: {
    heading: 'Use',
    body: 'The bot is intended for personal use. The following are prohibited in particular: spam, abusive automation, any attempt to circumvent or misuse it, and any unlawful use. You must comply with the terms of service of Discord and of the Crownicles game.',
  },
  availability: {
    heading: 'Availability',
    body: 'The service is provided "as is", without any warranty of availability, continuity or freedom from errors. It may be suspended, changed or shut down at any time, in particular for maintenance.',
  },
  liability: {
    heading: 'Liability',
    body: 'To the extent permitted by law, the maintainer cannot be held liable for any damages, direct or indirect, arising from the use of, or inability to use, the bot.',
  },
  personalData: {
    heading: 'Personal data',
    body: 'The processing of your data is described in the privacy policy.',
  },
  changes: {
    heading: 'Changes',
    body: 'These terms may be changed at any time, without prior notice. Continued use constitutes acceptance of the version in force.',
  },
  termination: {
    heading: 'Termination',
    body: `You may stop using the bot and delete your data at any time with the ${md.code('delete-data')} command. Access to the bot may be restricted if these terms are not respected.`,
  },
  intellectualProperty: {
    heading: 'Intellectual property',
    body: 'The Crownicles game and its content remain the property of their respective authors. The Crownutils code is distributed under the PolyForm Noncommercial license.',
  },
  law: {
    heading: 'Governing law',
    body: 'These terms are governed by French law. Failing an amicable resolution, the French courts have jurisdiction.',
  },
} as const;

const documents = { privacy, terms } satisfies LangNode;

export const legal = {
  cguButtonLabel: 'Terms of Service',
  privacyButtonLabel: 'Privacy',
  cguTitle: `${icons.scroll} Terms of Service`,
  privacyTitle: `${icons.shield} Privacy Policy`,
  intro:
    'By using Crownutils, you accept the privacy policy and the terms of service below.',
  documents,
} satisfies LangNode;

/** The `legal` command metadata; its content is the shared {@link legal} node. */
export const legalCommand = {
  description: 'View the terms of service and privacy policy.',
} satisfies CommandNode;
