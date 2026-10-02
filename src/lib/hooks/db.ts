import { SQLocal } from "sqlocal";

export const db = new SQLocal("database.sqlite3");

export async function initDb() {
  const response = await fetch("/database.db");
  const blob = await response.blob();
  await db.overwriteDatabaseFile(blob);
  return true;
}
