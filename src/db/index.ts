import Database from "better-sqlite3";
import fs from "node:fs";

const DBDir = './src/db'

export const db = new Database(`${DBDir}/klippklar.db`);

db.exec(fs.readFileSync(`${DBDir}/schema.sql`, "utf8"));