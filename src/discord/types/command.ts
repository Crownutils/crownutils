import type {
  ChatInputCommandInteraction,
  Message,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from 'discord.js';
import type { CommandRequirements } from '@/core/permissions/types.js';

/** Usage hint shown in `/help`; exactly one of `usageSlash`/`usagePrefix` is set. */
export type CommandHelp =
  | {
      usageSlash: string;
      usagePrefix?: never;
    }
  | {
      usageSlash?: never;
      usagePrefix: string;
    };

/** A slash command module, loaded by `slash-handler.ts`. */
export interface SlashCommand {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  requirements?: CommandRequirements;
  help: CommandHelp;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

/** A prefix command module, loaded by `prefix-handler.ts`. */
export interface PrefixCommand {
  name: string;
  description: string;
  aliases?: string[];
  requirements?: CommandRequirements;
  help: CommandHelp;
  execute(interaction: Message, args: string[]): Promise<void>;
}
