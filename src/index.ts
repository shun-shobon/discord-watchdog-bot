import * as Discord from "discord.js";
import * as dotenv from "dotenv";

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
