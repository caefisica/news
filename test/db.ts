import { readdirSync, readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import type { SQLInputValue } from "node:sqlite";

const dir = new URL("../server/db/migrations/", import.meta.url);

export const files = readdirSync(dir).toSorted();

export function apply(db: DatabaseSync, names: string[]) {
  for (const name of names) {
    db.exec(readFileSync(new URL(name, dir), "utf8"));
  }
}

export function migrate(): DatabaseSync {
  const db = new DatabaseSync(":memory:");
  apply(db, files);
  return db;
}

// The part of D1Database that processSource uses, backed by a real SQLite
// database.
class Statement {
  constructor(
    private readonly db: DatabaseSync,
    private readonly sql: string,
    private readonly values: SQLInputValue[] = [],
  ) {}

  bind(...values: SQLInputValue[]) {
    return new Statement(this.db, this.sql, values);
  }

  exec() {
    this.db.prepare(this.sql).run(...this.values);
  }

  run() {
    this.exec();
    return Promise.resolve();
  }
}

export function d1(db: DatabaseSync): D1Database {
  return {
    prepare: (sql: string) => new Statement(db, sql),
    batch: (statements: Statement[]) => {
      for (const statement of statements) {
        statement.exec();
      }
      return Promise.resolve();
    },
  } as unknown as D1Database;
}
