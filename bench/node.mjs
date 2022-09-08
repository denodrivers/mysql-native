import mysql from "mysql2/promise";
import { bench, run } from "mitata";
const connection = await mysql.createConnection({
  socketPath: "/tmp/mysql.sock",
  database: "test",
  user: "root",
  password: "12345",
});

await connection.connect();

bench("insert", async function () {
  await connection.execute(`INSERT INTO test VALUES (1, "test")`);
});

bench("select", async function () {
  await connection.query({ sql: `SELECT * FROM test`, rowsAsArray: true });
});

await run();
await connection.end();
