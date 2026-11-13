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

process.exit(0);