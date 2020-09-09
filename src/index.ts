import * as Discord from "discord.js";
import * as dotenv from "dotenv";

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

dotenv.config();
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const TARGET_GUILD = process.env.TARGET_GUILD;
const LOG_CHANNEL = process.env.LOG_CHANNEL;
if (DISCORD_TOKEN == null || TARGET_GUILD == null || LOG_CHANNEL == null) {
  throw new Error("DISCORD_TOKEN or TARGET_GUILD or LOG_CHANNEL is not defined.");
}

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
  const embed = new Discord.MessageEmbed()
    .setTitle("Watch Dog警告")
    .setDescription("破壊的な権限がBotに付与されました。")
    .setColor("RED")
    .setThumbnail(newUser.user.avatarURL() ?? "")
    .addField("Bot名", newUser.nickname ?? newUser.user.username)
    .addField("現在付与されている権限", newUser.permissions.toArray().join("\n"));
  const logChannel = newUser.guild.channels.cache.get(LOG_CHANNEL) as
    | Discord.TextChannel
    | undefined;
  await logChannel?.send(embed);
});

client.login(DISCORD_TOKEN).catch(console.error);
