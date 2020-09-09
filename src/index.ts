import * as Discord from "discord.js";
import * as dotenv from "dotenv";

dotenv.config();
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const TARGET_GUILD = process.env.TARGET_GUILD;
const LOG_CHANNEL = process.env.LOG_CHANNEL;
if (DISCORD_TOKEN == null || TARGET_GUILD == null || LOG_CHANNEL == null) {
  throw new Error("DISCORD_TOKEN or TARGET_GUILD or LOG_CHANNEL is not defined.");
}

const getBotsHasAnyPermissions = (
  guild: Discord.Guild,
  permissions: Discord.PermissionResolvable,
): Discord.Collection<Discord.Snowflake, Discord.GuildMember> => {
  return guild.members.cache.filter((member) => {
    if (!member.user.bot) return false;
    return member.permissions.any(permissions, false);
  });
};

const getBotsHasRole = (
  guild: Discord.Guild,
  role: Discord.Role,
): Discord.Collection<Discord.Snowflake, Discord.GuildMember> => {
  return guild.members.cache.filter((member) => {
    if (!member.user.bot) return false;
    return member.roles.cache.some((memberRole) => memberRole.equals(role));
  });
};

const sendBotLogWithEmbed = async (
  bot: Discord.GuildMember | Discord.PartialGuildMember,
  message: string,
): Promise<void> => {
  const embed = new Discord.MessageEmbed()
    .setTitle("Watch Dog警告")
    .setDescription(message)
    .setColor("RED")
    .setThumbnail(bot.user?.avatarURL() ?? "")
    .addField("Bot名", bot.nickname ?? bot.user?.username ?? "")
    .addField("現在付与されいてる権限", bot.permissions.toArray().join("\n"));
  const logChannel = bot.guild.channels.cache.get(LOG_CHANNEL) as Discord.TextChannel | undefined;
  await logChannel?.send(embed);
};

const WATCH_PERMISSIONS: Discord.PermissionResolvable = [
  "ADMINISTRATOR",
  "KICK_MEMBERS",
  "BAN_MEMBERS",
  "MANAGE_GUILD",
];

const client = new Discord.Client();

client.on("ready", () => {
  console.log("ready.");
});

client.on("guildMemberUpdate", async (_oldUser, newUser) => {
  if (newUser.guild.id !== process.env.TARGET_GUILD) return;
  if (!newUser.user?.bot) return;
  if (!newUser.permissions.any(WATCH_PERMISSIONS)) return;
  await sendBotLogWithEmbed(newUser, "破壊的な権限がBotに付与されました。");
});

client.on("roleCreate", async (newRole) => {
  if (newRole.guild.id !== process.env.TARGET_GUILD) return;
  if (!newRole.permissions.any(WATCH_PERMISSIONS)) return;
  const bots = getBotsHasRole(newRole.guild, newRole);
  const sendEmbedPromise = bots.map((bot) => {
    return sendBotLogWithEmbed(bot, "破壊的な権限がBotに付与されました。");
  });
  await Promise.all(sendEmbedPromise);
});

client.on("roleUpdate", async (_oldRole, newRole) => {
  if (newRole.guild.id !== process.env.TARGET_GUILD) return;
  if (!newRole.permissions.any(WATCH_PERMISSIONS)) return;
  const bots = getBotsHasRole(newRole.guild, newRole);
  const sendEmbedPromise = bots.map((bot) => {
    return sendBotLogWithEmbed(bot, "破壊的な権限がBotに付与されました。");
  });
  await Promise.all(sendEmbedPromise);
});

client.login(DISCORD_TOKEN).catch(console.error);
