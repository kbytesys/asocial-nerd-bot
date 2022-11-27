const { Telegraf } = require("telegraf");
const functions = require("@google-cloud/functions-framework");
const { initBot } = require("./bot-initializer");

const bot = new Telegraf(process.env.TELEGRAM_BOT_AUTHENTICATION_TOKEN);

const PUBLIC_ENDPOINT = process.env.PUBLIC_ENDPOINT;
const secretPath = `/${bot.secretPathComponent()}`;
bot.telegram.setWebhook(`${PUBLIC_ENDPOINT}${secretPath}`);

initBot(bot);

const botMiddleware = bot.webhookCallback(secretPath);
functions.http("asocialNerdBot", async (req, res) => {
  await botMiddleware(req, res);
});
