import mysql from "mysql2/promise";
const connection = await mysql.createConnection({
  socketPath: "/tmp/mysql.sock",
  database: "test",
  user: "root",
  password: "12345",
});

let [total, count] = typeof Deno !== "undefined"
  ? Deno.args
  : [process.argv[2], process.argv[3]];

total = total ? parseInt(total, 0) : 2;
count = count ? parseInt(count, 10) : 100000;

async function bench(fun) {
  const start = Date.now();
  for (let i = 0; i < count; i++) await fun();
  const elapsed = Date.now() - start;
  const rate = Math.floor(count / (elapsed / 1000));
  console.log(`time ${elapsed} ms rate ${rate}`);
  if (--total) process.nextTick(() => bench(fun));
  else await connection.end();
}

await connection.connect();
await bench(() =>
  connection.query({ sql: `SELECT * FROM test`, rowsAsArray: true })
);
