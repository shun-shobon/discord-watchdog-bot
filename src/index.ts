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

dotenv.config();
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
if (DISCORD_TOKEN == null) {
  throw new Error("DISCORD_TOKEN is not defined.");
}

const client = new Discord.Client();

client.on("ready", () => {
  console.log("ready.");
});

client.on("message", async (message) => {
  if (message.author.bot) return;
  if (message.content === "!ping") {
    await message.channel.send("pong");
  }
});

client.login(DISCORD_TOKEN).catch(console.error);
