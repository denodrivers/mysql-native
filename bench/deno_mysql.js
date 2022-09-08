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
Deno.bench("insert", async () => {
  await db.execute(`INSERT INTO test VALUES (1, "test")`);
});

Deno.bench("select", async () => {
  await db.query(`SELECT * FROM test`);
});
await db.execute(`TRUNCATE TABLE test`);
