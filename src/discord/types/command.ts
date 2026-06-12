import type {
  ChatInputCommandInteraction,
  Message,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from 'discord.js';
import type { CommandRequirements } from '@/core/permissions/types.js';

export type CommandHelp =
  | {
      usageSlash: string;
      usagePrefix?: never;
    }
  | {
      usageSlash?: never;
      usagePrefix: string;
    };

export interface SlashCommand {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  requirements?: CommandRequirements;
  help: CommandHelp;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export interface PrefixCommand {
  name: string;
  description: string;
  aliases?: string[];
  requirements?: CommandRequirements;
  help: CommandHelp;
  execute(interaction: Message, args: string[]): Promise<void>;
}
