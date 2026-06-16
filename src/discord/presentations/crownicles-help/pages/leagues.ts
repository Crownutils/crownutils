import {
  ActionRow,
  Button,
  Container,
  Modal,
  Select,
  Separator,
  Text,
  TextInput,
  Title,
} from '@/discord/components/index.js';
import {
  CROWNICLES_LEAGUES,
  computeLeagueBonusScore,
} from '@/core/crownicles/index.js';
import { buildErrorContainer, safeDiscord } from '@/discord/errors.js';
import { lang } from '@/discord/lang/index.js';
import { crowniclesIcons } from '../icons.js';
import { buildNavSelect } from '../nav.js';
import type { HelpPage, HelpRenderContext, HelpState } from '../page.js';

export const LEAGUES_PAGE_ID = 'leagues';

const LEAGUES_ICON = '🏆';
const LEAGUES_SELECT_ID = 'crownicles-help-leagues-select';
const LEAGUES_CALC_BUTTON_ID = 'crownicles-help-leagues-calc';
const LEAGUES_RANK_INPUT_ID = 'crownicles-help-leagues-rank';
const LEAGUES_MODAL_ID = 'crownicles-help-leagues-modal';

const { name, description, messages } =
  lang.commands.crowniclesHelp.pages.leagues;

/** Builds the rank input modal opened by the calculate button. */
function buildRankModal(): Modal {
  return new Modal(LEAGUES_MODAL_ID, messages.modal.title).add(
    new TextInput(LEAGUES_RANK_INPUT_ID, messages.modal.rankLabel)
      .placeholder(messages.modal.rankPlaceholder)
      .minLength(1)
      .maxLength(5),
  );
}

/** Renders the leagues page from `state`; named so `reduce` can reuse it. */
function renderLeagues(state: HelpState, ctx: HelpRenderContext): Container {
  const leagueSelect = new Select(LEAGUES_SELECT_ID).placeholder(
    messages.selectPlaceholder,
  );
  for (const league of CROWNICLES_LEAGUES) {
    leagueSelect.option(league.name, league.id, undefined, league.icon);
  }
  if (ctx.disabled) leagueSelect.disabled();

  const calcButton = new Button(LEAGUES_CALC_BUTTON_ID)
    .label(messages.calculateButton)
    .color('primary');
  if (!state.selectedLeagueId || ctx.disabled) calcButton.disabled();

  const selectedLeague = CROWNICLES_LEAGUES.find(
    (l) => l.id === state.selectedLeagueId,
  );

  const container = new Container()
    .color('info')
    .add(
      new Title(
        selectedLeague
          ? `${selectedLeague.icon} ${selectedLeague.name}`
          : `${LEAGUES_ICON} ${name}`,
      ),
      new Separator(),
      leagueSelect,
    );

  if (selectedLeague) {
    const bonusRows: { icon: string; label: string; value: number }[] = [
      {
        icon: crowniclesIcons.xp,
        label: messages.bonusLabels.xp,
        value: selectedLeague.xpBonus,
      },
      {
        icon: crowniclesIcons.money,
        label: messages.bonusLabels.money,
        value: selectedLeague.moneyBonus,
      },
    ];
    if (state.rankBonus !== undefined && state.rankBonus > 0) {
      bonusRows.push({
        icon: crowniclesIcons.points,
        label: messages.bonusLabels.rank,
        value: state.rankBonus,
      });
    }
    container.add(...bonusRows.map((row) => new Text(messages.bonusLine(row))));
  }

  return container.add(
    new ActionRow(calcButton),
    new Separator(),
    buildNavSelect(ctx),
  );
}

/** Leagues help page: pick a league, enter rank, get XP/money/rank bonus breakdown. */
export const leaguesPage = {
  id: LEAGUES_PAGE_ID,
  name,
  description,
  icon: LEAGUES_ICON,
  requiredAuthorization: 'public',

  render: renderLeagues,

  reduce: async (interaction, state, { handled }, renderCtx) => {
    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === LEAGUES_SELECT_ID
    ) {
      const leagueId = interaction.values[0];
      return leagueId !== undefined
        ? { ...state, selectedLeagueId: leagueId, rankBonus: undefined }
        : state;
    }

    if (
      interaction.isButton() &&
      interaction.customId === LEAGUES_CALC_BUTTON_ID
    ) {
      const league = CROWNICLES_LEAGUES.find(
        (l) => l.id === state.selectedLeagueId,
      );
      if (!league) return state;

      await interaction.showModal(buildRankModal().build());
      handled();

      try {
        const submit = await interaction.awaitModalSubmit({
          filter: (i) =>
            i.customId === LEAGUES_MODAL_ID &&
            i.user.id === interaction.user.id,
          time: 60_000,
        });

        const rank = parseInt(
          submit.fields.getTextInputValue(LEAGUES_RANK_INPUT_ID),
          10,
        );

        if (!Number.isInteger(rank) || rank < 1) {
          await submit.reply(
            buildErrorContainer(messages.invalidRank).build({
              ephemeral: true,
            }),
          );
          return state;
        }

        const newState = { ...state, rankBonus: computeLeagueBonusScore(rank) };
        // isFromMessage() is always true here since the modal opens from a button,
        // but the check is required for TypeScript to expose .update().
        if (submit.isFromMessage()) {
          await submit.update(renderLeagues(newState, renderCtx).build());
        }
        return newState;
      } catch {
        await safeDiscord(
          interaction.followUp(
            buildErrorContainer(messages.modalTimeout).build({
              ephemeral: true,
            }),
          ),
          'leagues.modalTimeout',
        );
      }

      return state;
    }

    return state;
  },
} satisfies HelpPage;
