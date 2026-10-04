import database from "../server/db/database.json" with { type: "json" };

// The cf CLI migration command requires the database ID, not its name or binding.
const cf = Bun.spawn(
  [
    "cf",
    "d1",
    "migrations",
    "apply",
    database.id,
    "--dir",
    "server/db/migrations",
    ...Bun.argv.slice(2),
  ],
  { stdio: ["inherit", "inherit", "inherit"] },
);

process.exit(await cf.exited);
