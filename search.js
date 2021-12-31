import mtg from "mtgsdk";
import { sortById } from "./utils.js";
import { cards } from "./index.js";

const search = async (card) => {
  if (card.name.length === 0) return false;
  const fullName = card.name.join(" ");

  await mtg.card
    .where({ name: fullName })
    .then(async (response) => {
      let consistency = new Set();
      let exact = [];
      await response.map((r) => {
        if (r.name === fullName) {
          exact.push(r);
          return;
        }
        consistency.add(r.name);
      });
      if (exact.length > 0 || (response.length > 0 && consistency.size === 1)) {
        let toSort = exact.length > 1 ? exact : response;
        cards.push(sortById(toSort));
        return true;
      } else {
        await searchPerWord(card);
      }
    })
    .catch((err) => {
      console.error(err);
      return false;
    });
};

async function searchPerWord(card) {
  let name = card.name[0];
  let found = new Set();
  let duplicates = new Set();

  for (let i = 0; i < card.name.length; i++) {
    let word = card.name[i];
    if (i >= 1) name += ` ${word}`;
    if (name.length > 2) {
      let current = new Set();
      await mtg.card.where({ name: name }).then((data) => {
        if (data.length >= 1) {
          data.map((r) => {
            current.add(r.name);
            if (found.has(r.name)) {
              duplicates.add(r);
            }
          });
        }
      });
      current.forEach((v) => found.add(v));
    }
  }

  if (duplicates.size === 1) {
    cards.push({ ...duplicates.values(), found: true });
  } else if (duplicates.size > 0) {
    const chosen = sortById(duplicates);
    cards.push(chosen);
  } else {
    cards.push({
      name: card.name.join(" "),
      found: false,
      rawImage: card.path,
    });
  }
}

export default search;
