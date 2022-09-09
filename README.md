# mysql-native

The fastest [[1]](#benchmarks) JavaScript MySQL client.

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

const tx = conn.tx((conn) => {
  conn.execute("...");
  return conn.query("...");
});
```

### Features

It exposes a synchronous & minimal API.

A non-blocking async API is planned but for now use the battle tested [`denodrivers/mysql`](https://deno.land/x/mysql) module.

- [x] Performance
- [x] Prepared statements
- [ ] Bind parameters
- [ ] Non blocking API 
- [ ] SSL
- [ ] Connection pooling

### Benchmarks

`mysql_native` dispatches almost zero-overhead calls to `libmysqlclient` using Deno FFI. 

