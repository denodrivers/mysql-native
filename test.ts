import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { Connection } from "./mod.ts";

const db = new Connection();

Deno.test("connect unix sock", () => {
  db.connect({
    unixSocket: "/tmp/mysql.sock",
    database: "test",
    user: "root",
    password: "12345",
  });

  try {
    db.execute(`TRUNCATE TABLE test2`);
  } catch {}
});

Deno.test("execute", () => {
  db.execute(`CREATE TABLE IF NOT EXISTS test2 ( id INT, name VARCHAR(255) )`);
});

Deno.test("query all", () => {
  const result = db.query(`SELECT * FROM test2`);
  assertEquals(result.all(), []);
});

Deno.test("query iter", () => {
  const result = db.query(`SELECT * FROM test2`);
  assertEquals([...result], []);
});
