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

// This adapter covers the D1 methods used by the ingest code and API. A failing
// statement rejects, as D1 does.
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
    const { changes } = this.db.prepare(this.sql).run(...this.values);
    return { meta: { changes: Number(changes) } };
  }

  run() {
    return this.settle(() => this.exec());
  }

  all() {
    return this.settle(() => ({ results: this.db.prepare(this.sql).all(...this.values) }));
  }

  private settle<T>(work: () => T): Promise<T> {
    try {
      return Promise.resolve(work());
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

export function d1(db: DatabaseSync): D1Database {
  return {
    prepare: (sql: string) => new Statement(db, sql),
    batch: (statements: Statement[]) => {
      try {
        return Promise.resolve(statements.map((statement) => statement.exec()));
      } catch (err) {
        return Promise.reject(err);
      }
    },
  } as unknown as D1Database;
}
