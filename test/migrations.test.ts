import { DatabaseSync } from "node:sqlite";

import { describe, expect, it } from "vitest";

import { apply, files, migrate } from "./db";

interface Row {
  name: string;
  parser: string;
  category: string;
  language: string;
}

function sources(db: DatabaseSync): Row[] {
  return db
    .prepare("SELECT name, parser, category, language FROM sources ORDER BY name")
    .all() as unknown as Row[];
}

describe("migrations", () => {
  it("renames the pronabec parser to gobpe", () => {
    const rows = sources(migrate());

    expect(rows.filter((row) => row.parser === "pronabec")).toEqual([]);
    expect(rows.find((row) => row.name === "PRONABEC")?.parser).toBe("gobpe");
  });

  it("removes stored gob.pe collection pages but keeps dated articles", () => {
    const db = new DatabaseSync(":memory:");
    apply(db, files.slice(0, 3));
    const insert = db.prepare(
      "INSERT INTO articles (source_id, guid, title, link, published_at) VALUES (2, ?, ?, ?, ?)",
    );
    insert.run(
      "c",
      "Nota de prensa",
      "https://www.gob.pe/institucion/pronabec/colecciones/1",
      null,
    );
    insert.run("a", "Beca", "https://www.gob.pe/institucion/pronabec/noticias/2", 1_790_000_000);
    apply(db, files.slice(3));

    const titles = db.prepare("SELECT title FROM articles").all();
    expect(titles).toEqual([{ title: "Beca" }]);
  });
});

describe("source migrations", () => {
  it("adds the research sources with their language", () => {
    const rows = sources(migrate());
    const byName = Object.fromEntries(rows.map((row) => [row.name, row]));

    for (const name of ["IPEN", "IGP", "CONCYTEC"]) {
      expect(byName[name]?.parser).toBe("gobpe");
    }
    expect(byName["CONCYTEC"]?.category).toBe("becas");
    expect(byName["CERN"]).toMatchObject({ category: "ciencia", language: "en" });
    expect(byName["Quanta Magazine"]?.language).toBe("en");
    expect(byName["Naukas"]?.language).toBe("es");
  });

  it("leaves the expected set of sources", () => {
    expect(sources(migrate()).map((row) => row.name)).toEqual([
      "CERN",
      "CONCYTEC",
      "IGP",
      "IPEN",
      "Naukas",
      "OGCRI-UNMSM",
      "PRONABEC",
      "Quanta Magazine",
      "REPU Program",
    ]);
  });
});
