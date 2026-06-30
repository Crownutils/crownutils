import {
  Container,
  Separator,
  Text,
  Title,
} from '@/discord/components/index.js';
import { lang } from '@/discord/lang/index.js';
import { buildNavSelect } from '../nav.js';
import type { HelpPage } from '../page.js';

const PETS_PAGE_ID = 'pets';

const PETS_ICON = '🐾';

const { name, description, messages } = lang.commands.crowniclesHelp.pages.pets;

/** Pets help page: placeholder until the pets feature is implemented. */
export const petsPage = {
  id: PETS_PAGE_ID,
  name,
  description,
  icon: PETS_ICON,
  requiredAuthorization: 'public',

  render: (_state, ctx) =>
    new Container()
      .color('info')
      .add(
        new Title(`${PETS_ICON} ${name}`),
        new Separator(),
        new Text(messages.comingSoon).size('subtle'),
        new Separator(),
        buildNavSelect(ctx),
      ),

  reduce: (_interaction, state) => state,
} satisfies HelpPage;
