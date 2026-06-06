import type {
  ChatInputCommandInteraction,
  Message,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from 'discord.js';

type CommandAuthorization = 'owner' | 'privileged' | 'public';
type CommandScope = 'main_guild_only' | 'global';

export interface SlashCommand {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  authorization?: CommandAuthorization;
  scope?: CommandScope;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export interface PrefixCommand {
  name: string;
  description: string;
  aliases?: string[];
  authorization?: CommandAuthorization;
  scope?: CommandScope;
  execute(interaction: Message, args: string[]): Promise<void>;
}
