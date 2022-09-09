import mysql from "mysql2/promise";
import { bench, run } from "mitata";
const connection = await mysql.createConnection({
  socketPath: "/tmp/mysql.sock",
  database: "test",
  user: "root",
  password: "12345",
});

await connection.connect();
try {
  await connection.execute(`TRUNCATE TABLE test`);
} catch {}
const [x] = await connection.query({
  sql: `SELECT * FROM test`,
  rowsAsArray: true,
});
if (x.length !== 0) throw new Error("Table is not empty");

bench("select", async function () {
  await connection.query({ sql: `SELECT * FROM test`, rowsAsArray: true });
});

bench("insert", async function () {
  await connection.execute(`INSERT INTO test VALUES (1, "test")`);
});

await run();

await connection.end();
