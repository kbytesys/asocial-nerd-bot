const { Telegraf } = require("telegraf");
const { initBot } = require("./bot-initializer");

const bot = new Telegraf(process.env.TELEGRAM_BOT_AUTHENTICATION_TOKEN);

initBot(bot);

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
