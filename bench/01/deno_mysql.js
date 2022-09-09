import { Client } from "https://deno.land/x/mysql/mod.ts";
const db = await new Client().connect({
  socketPath: "/tmp/mysql.sock",
  username: "root",
  db: "test",
  password: "12345",
});

await db.execute(
  `CREATE TABLE IF NOT EXISTS test ( id INT, name VARCHAR(255) )`,
);
try {
  await db.execute(`TRUNCATE TABLE test`);
} catch {}
const x = await db.query(`SELECT * FROM test`);
if (x.length !== 0) throw new Error("Table is not empty");

Deno.bench("select", async () => {
  await db.query(`SELECT * FROM test`);
});

Deno.bench("insert", async () => {
  await db.execute(`INSERT INTO test VALUES (1, "test")`);
});
