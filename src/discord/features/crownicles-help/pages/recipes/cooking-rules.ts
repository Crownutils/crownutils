import type { SupportedLocale } from '@/core/types.js';
import { type Container, Separator, Text } from '@/discord/components/index.js';
import { formatNumber, formatPercent } from '@/discord/lang/number.js';
import { withIcon } from '@/discord/theme/icons.js';
import { md } from '@/discord/theme/markdown.js';
import type { CookingGuide } from '../../data/recipes.js';
import { materialRarityIcons, recipeFactIcons } from '../../icons.js';
import { messages } from './shared.js';

/**
 * The two sections that explain the cooking mechanics rather than list recipes:
 * how a craft pays experience, and how its odds of failing are worked out. Both
 * read the game's own balance tables, down to the worked example, so nothing
 * here can drift from the game while the rest of the section updates.
 */

/** A cooking grade's level span, the top one being open-ended. */
function gradeSpan(
  locale: SupportedLocale,
  min: number,
  max: number | undefined,
): string {
  const t = messages(locale);
  return max === undefined ? t.gradeSpanOpen(min) : t.gradeSpan(min, max);
}

/** Section: what a craft pays in cooking experience, and when it pays nothing. */
export function appendCookingXpSection(
  container: Container,
  guide: CookingGuide,
  locale: SupportedLocale,
): void {
  const t = messages(locale);

  container.add(
    new Text(
      t.xp.formula(
        formatPercent(locale, guide.plantWeight),
        formatPercent(locale, guide.materialWeight),
      ),
    ),
  );
  container.add(
    new Text(t.xp.onFailure(guide.failureXpPerLevel)).size('subtle'),
    new Text(t.xp.noXp(guide.noXpLevelThreshold)).size('subtle'),
    new Separator(),
  );

  container.add(new Text(t.xp.plantsTitle).size('small'));
  const plants = new Text('');
  for (const plant of guide.plants) {
    plants.newLine(
      new Text(
        `${plant.name} - ${t.xp.amount(formatNumber(locale, plant.xp))}`,
      ).icon(plant.icon),
    );
  }
  container.add(plants, new Separator());

  container.add(new Text(t.xp.materialsTitle).size('small'));
  const rarities = new Text('');
  for (const rarity of guide.materialRarities) {
    rarities.newLine(
      new Text(
        `${rarity.name} - ${t.xp.amount(formatNumber(locale, rarity.xp))}`,
      ).icon(materialRarityIcons[rarity.rarity]),
    );
  }
  container.add(rarities);
}

/** Section: how the odds of botching a craft are worked out, grade by grade. */
export function appendFailureSection(
  container: Container,
  guide: CookingGuide,
  locale: SupportedLocale,
): void {
  const t = messages(locale);

  container.add(
    new Text(
      t.failure.formula(formatPercent(locale, guide.failureRatePerExtraLevel)),
    ),
  );
  container.add(new Text(t.failure.capped).size('subtle'), new Separator());

  container.add(new Text(t.failure.gradesTitle).size('small'));
  const grades = new Text('');
  for (const grade of guide.grades) {
    grades.newLine(
      new Text(
        `${md.bold(grade.name)} - ${gradeSpan(
          locale,
          grade.minCookingLevel,
          grade.maxCookingLevel,
        )} - ${t.failure.gradeStats(
          formatPercent(locale, grade.failureRate),
          grade.maxCleanDifficulty,
        )}`,
      ).size('subtle'),
    );
  }
  container.add(grades, new Separator());

  const example = guide.failureExample;
  if (example !== undefined) {
    container.add(
      new Text(
        withIcon(
          recipeFactIcons.level,
          t.failure.example(
            example.difficulty,
            example.gradeName,
            example.maxCleanDifficulty,
            formatPercent(locale, example.baseFailureRate),
            example.extraLevels,
            formatPercent(locale, guide.failureRatePerExtraLevel),
            formatPercent(locale, example.totalFailureRate),
          ),
        ),
      ).size('subtle'),
    );
  }
}
