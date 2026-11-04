import "dotenv/config";
import postgres from "@prisma/orm-postgres/runtime";
import { contractFromJson } from "@prisma/orm-postgres/static";
import "temporal-polyfill/global";

import type { Contract } from "./generated/contract.d.ts";
import contractJson from "./generated/contract.json" with { type: "json" };

export const contract = contractFromJson<Contract>(contractJson);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL не знайдено в змінних середовища (.env)");
}

export const db = postgres({ 
  contract, 
  url: process.env.DATABASE_URL 
});