import { Connection } from "../../mod.ts";

const db = new Connection();
db.connect({
  unixSocket: "/tmp/mysql.sock",
  database: "test",
  user: "root",
  password: "12345",
});

db.execute(`CREATE TABLE IF NOT EXISTS test ( id INT, name VARCHAR(255) )`);

const queueMicrotask = globalThis.queueMicrotask || process.nextTick;
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
  if (--total) queueMicrotask(() => bench(fun));
}

await bench(async () => {
  (await db.query(`SELECT * FROM test`)).all();
});

// db.execute(`TRUNCATE TABLE test`);
