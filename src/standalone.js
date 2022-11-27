const { Telegraf } = require("telegraf");
const speech = require("@google-cloud/speech");
const fetch = require("node-fetch");

const gcpSpeechClient = new speech.SpeechClient();
const bot = new Telegraf(process.env.BOT_TOKEN);

const defaultSpeechToTextConfig = {
  languageCode: "it-IT",
  encoding: "OGG_OPUS",
  sampleRateHertz: 48000,
};

bot.start((ctx) =>
  ctx.reply(
    "Mandami un vocale e io lo trascriverò con il potere di Google Cloud"
  )
);

bot.on("voice", async (ctx) => {
  const voiceFileId = ctx.message.voice.file_id;
  const fileUrl = (
    await ctx.telegram.getFileLink(await ctx.telegram.getFile(voiceFileId))
  ).href;

  const audioContent = await (
    await (await fetch(fileUrl)).blob()
  ).arrayBuffer();

  const audio = {
    content: new Uint8Array(audioContent),
  };

  const request = {
    audio,
    config: defaultSpeechToTextConfig,
  };

  // Detects speech in the audio file
  const [response] = await gcpSpeechClient.recognize(request);
  const transcription = response.results
    .map((result) => result.alternatives[0].transcript)
    .join("\n");
  return ctx.reply(`Contenuto del messaggio 🎙:\n${transcription}`);
});

bot.catch((err, ctx) => {
  console.error("[Bot] Error", err);
  return ctx.reply(
    `Si è verificato un errore mentre elaboravo ${ctx.updateType}`,
    err
  );
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
