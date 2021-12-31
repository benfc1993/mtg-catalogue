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
  await processImages(imagePaths, async (info, processedFileName, image) => {
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
    await search(card);
  }
}

async function main() {
  fs.mkdirSync("processed", { recursive: true });
  await runWorker();
  await findCards();
  console.log(
    `Processed ${cardNames.length}, with an accuracy of ${
      (cards.length / cardNames.length).toFixed(2) * 100
    }`
  );
  cards.map((card) => {
    if (!card.found)
      console.log(`not found for: ${card.name}, image: ${card.rawImage}`);
  });
  fs.appendFileSync("cards.json", JSON.stringify(cards));
  fs.rmSync("processed", { recursive: true });
}

await main();
