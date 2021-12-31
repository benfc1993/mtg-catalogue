export function sortById(data) {
  let multiverseId = 0;
  let chosen;
  data.forEach((v) => {
    if (v.multiverseid > multiverseId) {
      multiverseId = v.multiverseid;
      chosen = v;
    }
  });
  return { ...chosen, found: true };
}

export function processCardName(text) {
  let match = "";
  let lines = text.split(/\n/);
  lines.map((line) => {
    let lineSplit = line.replace(/\s\s+/g, " ").split(/\s/);
    lineSplit.map((s) => {
      if (s.length > 2 && s.match(/^[A-Z][a-z]+/)) {
        match = line.replace(/\s\s+/g, " ");
      }
    });
  });
  let cardName = match
    .split(/\n/)[0]
    .replace(/[^A-Za-z\s]/g, "")
    .split(/\s/);
  cardName = cardName.reduce((arr, word) => {
    if (word !== "" && word.length > 1) arr.push(word);
    return arr;
  }, []);
  return cardName;
}
