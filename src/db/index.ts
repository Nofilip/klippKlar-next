import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "klippklar.db");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(dbPath);

const schemaPath = path.join(process.cwd(), "src", "db", "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");
db.exec(schema);