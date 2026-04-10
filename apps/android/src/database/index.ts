/**
 * WatermelonDB Database Initialization
 * Sets up and exports the offline-first local database instance
 */

import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import { schema } from "./schema";
import Worker from "./models/Worker";
import HireRecord from "./models/HireRecord";

const adapter = new SQLiteAdapter({
  schema,
  dbName: "kaamsetu_app",
  // Migrations would go here if schema changes over time
  // migrations: [],
});

export const database = new Database({
  adapter,
  modelClasses: [Worker, HireRecord],
});

export default database;
