import type {
  ChatInputCommandInteraction,
  Message,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from 'discord.js';

export type CommandAuthorization = 'owner' | 'privileged' | 'public';
export type CommandScope = 'main_guild_only' | 'global' | 'everywhere';
export type ExecutionContext = 'dm' | 'main_guild' | 'other_guild';
export type CommandPermission = CommandScope | CommandAuthorization;

export interface CommandRequirements {
  scope?: CommandScope;
  authorization?: CommandAuthorization;
}

export interface CommandValidation {
  canBeExecuted: boolean;
  missingPermissions: CommandPermission[];
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
