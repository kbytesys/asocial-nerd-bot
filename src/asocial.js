const fetch = require("node-fetch");
const speech = require("@google-cloud/speech");
const vision = require("@google-cloud/vision");

const gcpSpeechClient = new speech.SpeechClient();
const gcpVisionClient = new vision.ImageAnnotatorClient();

const defaultSpeechToTextConfig = {
  languageCode: "it-IT",
  encoding: "OGG_OPUS",
  sampleRateHertz: 48000,
};

const initBot = (bot) => {
  bot.start((ctx) =>
    ctx.reply(
      "Mandami un vocale e io lo trascriverò, mandami una foto e cercherò di capire le sue emozioni, Tutto con il potere di Google Cloud!"
    )
  );

  bot.on("voice", async (ctx) => {
    const voiceFileContent = await getTelegramFileData(
      ctx.message.voice.file_id,
      ctx
    );

    const audio = {
      content: voiceFileContent,
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

  bot.on("photo", async (ctx) => {
    const photoFileContent = await getTelegramFileData(
      ctx.message.photo[ctx.message.photo.length - 1].file_id,
      ctx
    );

    const request = { image: { content: photoFileContent } };
    const [faces] = await gcpVisionClient.faceDetection(request);

    if (!faces.faceAnnotations.length) {
      return ctx.reply(
        "Sei veramente asociale, non ho trovato nessuna persona!"
      );
    } else {
      let result = `Ho trovato ${faces.faceAnnotations.length} persone!\n`;
      faces.faceAnnotations.forEach((face, index) => {
        result += buildPersonString(face, index);
      });
      return ctx.reply(result);
    }
  });

  bot.catch((err, ctx) => {
    console.error("[Bot] Error", err);
    return ctx.reply(
      `Si è verificato un errore mentre elaboravo ${ctx.updateType}`,
      err
    );
  });
};

const buildPersonString = (face, index) => {
  const angerEmotion = showEmotion(face.angerLikelihood);
  const joyRmotion = showEmotion(face.joyLikelihood);
  const sorrowEmotion = showEmotion(face.sorrowLikelihood);
  const surpriseEmotion = showEmotion(face.surpriseLikelihood);
  const noEmotions =
    !angerEmotion && !joyRmotion && !sorrowEmotion && !surpriseEmotion;

  return `Persona ${index + 1} -->${angerEmotion ? " 😠" : ""}${
    joyRmotion ? " 😂" : ""
  }${sorrowEmotion ? " 😢" : ""}${surpriseEmotion ? " 😯" : ""}${
    noEmotions ? " nessuna emozione" : ""
  }\n`;
};

const getTelegramFileData = async (fileId, ctx) => {
  const fileUrl = (
    await ctx.telegram.getFileLink(await ctx.telegram.getFile(fileId))
  ).href;

  return new Uint8Array(
    await (await (await fetch(fileUrl)).blob()).arrayBuffer()
  );
};

const showEmotion = (likelihood) => {
  return ["POSSIBLE", "LIKELY", "VERY_LIKELY"].includes(likelihood);
};

module.exports = {
  initBot,
};
