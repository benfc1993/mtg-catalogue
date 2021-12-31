import sharp from "sharp";

export async function processImages(imagePaths, callback) {
  for (let image of imagePaths) {
    let processedFileName = `processed/${image.split(".")[0]}-processed.jpg`;

    await sharp(`cards/${image}`)
      .resize({ width: 640, height: 480, fit: "cover", position: "left top" })
      .extract({ width: 630, height: 200, left: 10, top: 5 })
      .toColorspace("b-w")
      .sharpen(10, 4, 5)
      .gamma(3)
      .clahe({ height: 200, width: 630 })
      .normalise()
      .flatten()
      .median()
      .toFile(processedFileName)
      .then((info) => callback(info, processedFileName, image));
  }
}
