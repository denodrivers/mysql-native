# mysql-native

The fastest [[1]](#speed) JavaScript MySQL client.

```js
import { Connection } from "https://deno.land/x/mysql_native/mod.ts";
const conn = new Connection();

conn.connect({
  unixSocket: "/tmp/mysql.sock",
  // ...
  //
  // setup connection pool
  // pool: 3,
});

// -- Connection methods

conn.execute("INSERT INTO test VALUES (1, 'deno')");

const result = conn.query("SELECT * FROM test");
result.all(); // [ [ 1, "deno" ] ]

const iter = conn.query("SELECT * FROM test");
for (const row of iter) {
  row; // [1, "deno"]
}

conn.close();

// -- Prepared statements

const stmt = conn.prepare("INSERT INTO test2 VALUES (?, ?)");

stmt.run(2, "deno");
stmt.all();

stmt.close();

// -- Transactions

const tx = conn.tx(conn => {
  conn.execute("...");
  return conn.query("...")
});
```