import type {
  ChatInputCommandInteraction,
  Message,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from 'discord.js';
import type { CommandRequirements } from '@/core/permissions/types.js';

export interface SlashCommand {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  requirements?: CommandRequirements;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export interface PrefixCommand {
  name: string;
  description: string;
  aliases?: string[];
  requirements?: CommandRequirements;
  execute(interaction: Message, args: string[]): Promise<void>;
}
