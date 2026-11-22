import {db} from "./db";

const characters = [

      { name: "Greg", gender: "male", description: "cool guy"},
      { name: "Damon",  gender: "male", description: "bad boy"},
      { name: "Tom",  gender: "male", description: "chill guy"},
      { name: "Laura", gender: "female", description: "cool girl"},
      { name: "Lily", gender: "female", description: "bad girl"},
      { name: "Stella",  gender: "female", description: "chill girl"},
] as const;


for (const c of characters) {
    const existing = await db.orm.public.Character.first({name:c.name});
    if (!existing) {
        await db.orm.public.Character.create(c);
        console.log("created: ", c.name);
    } else {
        console.log("skip: ", c.name);
    }
}

const levels = [
  {
    code: "PraterScene",
    title: "Prater Carnival Throw",
    district: "Leopoldstadt",
    totalRounds: 3,
    isActive: true,
  },
  {
    code: "AlbertinaScene",
    title: "Albertina Art Puzzle",
    district: "Innere Stadt",
    totalRounds: 4,
    isActive: true,
  },
  {
    code: "StephanScene",
    title: "St. Stephen's Spire Rush",
    district: "Innere Stadt",
    totalRounds: 3,
    isActive: true,
  },
  {
    code: "SchonbrunScene",
    title: "Schönbrunn Palace Gardens",
    district: "Hietzing",
    totalRounds: 5,
    isActive: true,
  },
  {
    code: "BelvedereScene",
    title: "Belvedere Courtyard Challenge",
    district: "Landstraße",
    totalRounds: 4,
    isActive: true,
  },
] as const;

for (const lvl of levels) {
  const existing = await db.orm.public.Level.first({ code: lvl.code });
  if (!existing) {
    await db.orm.public.Level.create(lvl);
    console.log("created: ", lvl.code);
  } else {
    console.log("skip: ", lvl.code);
  }
}


process.exit(0);