import { createWorker } from "tesseract.js";
import fs from "fs";
import { processImages } from "./preprocess.js";
import search from "./search.js";
import { processCardName } from "./utils.js";

const imagePaths = fs.readdirSync("cards/");

let cardNames = [];
export const cards = [];

const worker = createWorker();

async function runWorker() {
  await worker.load();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  await worker.setParameters({
    tessedit_char_whitelist:
      "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz ",
    preserve_interword_spaces: "1",
  });
  await processImages(imagePaths, async (buf, processedFileName, image) => {
    const { data } = await worker.recognize(processedFileName, {
      is_bold: true,
    });
    cardNames.push({
      name: processCardName(data.paragraphs[0]?.text || ""),
      path: `cards/${image}`,
    });
  });
  await worker.terminate();
}

async function findCards() {
  for (let card of cardNames) {
    await search(card.name);
  }
  console.log(cards);
}

async function main() {
  await runWorker();
  await findCards();
  console.log(cards.length / cardNames.length);
  cards.map((card) => {
    if (!card.found) console.log("not found for: ", card.name);
  });
}

await main();
