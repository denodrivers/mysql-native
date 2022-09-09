import { Connection } from "../../mod.ts";

const db = new Connection();
db.connect({
  unixSocket: "/tmp/mysql.sock",
  database: "test",
  user: "root",
  password: "12345",
});

db.execute(`CREATE TABLE IF NOT EXISTS test ( id INT, name VARCHAR(255) )`);

try {
  db.execute(`TRUNCATE TABLE test`);
} catch {}

const x = db.query(`SELECT * FROM test`).all();
if (x.length !== 0) throw new Error("Table is not empty");

Deno.bench("select", () => {
  db.query(`SELECT * FROM test`).all();
});
Deno.bench("insert", () => {
  db.execute(`INSERT INTO test VALUES (1, "test")`);
});
