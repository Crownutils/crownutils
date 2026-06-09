import type {
  ChatInputCommandInteraction,
  Message,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from 'discord.js';

export type CommandAuthorization = 'owner' | 'privileged' | 'public';
export type CommandScope = 'everywhere' | 'global' | 'main_guild';

export interface CommandRequirements {
  scope?: CommandScope;
  authorization?: CommandAuthorization;
}

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
