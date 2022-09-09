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

A non-blocking async API is planned but for now use the battle tested
[`denodrivers/mysql`](https://deno.land/x/mysql) module.

- [x] Performance
- [x] Prepared statements
- [ ] Bind parameters
- [ ] Non blocking API
- [ ] SSL
- [ ] Connection pooling

### Benchmarks

`mysql_native` dispatches almost zero-overhead calls to `libmysqlclient` using
Deno FFI.

![image](https://user-images.githubusercontent.com/34997667/189265801-b77a77e1-a5e2-44e9-b308-09bde03f3d42.png)

[View source](bench/02)

### Low-level API

`sys.ts` provides direct access to _unsafe_ `libmysqlcient` API.

```ts
import { mysql_stmt_init } from "https://deno.land/x/mysql_native/sys.ts";

const handle = mysql_stmt_init(null);
mysql_real_connect(
  handle,
  encode("host\0"),
  encode("user\0"),
  encode("password\0"),
  encode("db\0"),
  port,
  socket ? encode("socketPath\0") : null,
  0,
);

mysql_real_query(handle, encode("SELECT * FROM test"), 18);
```
