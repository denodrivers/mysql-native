const symbols = {
  mysql_init: {
    parameters: ["pointer"],
    result: "pointer",
  },
  mysql_real_connect: {
    parameters: [
      "pointer",
      "buffer",
      "buffer",
      "buffer",
      "buffer",
      "u32",
      "buffer",
      "u32",
    ],
    result: "void",
  },
  mysql_real_query: {
    parameters: ["pointer", "buffer", "u32"],
    result: "void",
  },
  mysql_stmt_init: {
    parameters: ["pointer"],
    result: "pointer",
  },
  mysql_stmt_prepare: {
    parameters: ["pointer", "buffer", "u32"],
    result: "void",
  },
  mysql_stmt_execute: {
    parameters: ["pointer"],
    result: "void",
  },
  mysql_stmt_close: {
    parameters: ["pointer"],
    result: "void",
  },
  mysql_close: {
    parameters: ["pointer"],
    result: "void",
  },
  mysql_stmt_error: {
    parameters: ["pointer"],
    result: "pointer",
  },
  mysql_error: {
    parameters: ["pointer"],
    result: "pointer",
  },
  mysql_free_result: {
    parameters: ["pointer"],
    result: "void",
  },
  mysql_store_result: {
    parameters: ["pointer"],
    result: "pointer",
  },
  mysql_num_rows: {
    parameters: ["pointer"],
    result: "u32",
  },
  mysql_num_fields: {
    parameters: ["pointer"],
    result: "u32",
  },
  mysql_fetch_row: {
    parameters: ["pointer"],
    result: "pointer",
  },
} as const;

const {
  mysql_init,
  mysql_real_connect,
  mysql_real_query,
  mysql_stmt_init,
  mysql_stmt_prepare,
  mysql_stmt_execute,
  mysql_stmt_close,
  mysql_close,
  mysql_stmt_error,
  mysql_error,
  mysql_free_result,
  mysql_num_rows,
  mysql_store_result,
  mysql_num_fields,
  mysql_fetch_row,
} = Deno.dlopen(
  "/opt/homebrew/opt/mysql-client/lib/libmysqlclient.dylib",
  symbols,
).symbols;

const encode = Deno.core?.encode || ((s) => new TextEncoder().encode(s));
function cstr(str?: string) {
  return str ? encode(str + "\0") : null;
}

class Statement {
  #stmt;
  constructor(handle) {
    this.#stmt = mysql_stmt_init(handle);
  }

  prepare(query: string) {
    const q = encode(query);
    mysql_stmt_prepare(this.#stmt, q, q.byteLength);
  }

  execute() {
    mysql_stmt_execute(this.#stmt);
  }

  close() {
    mysql_stmt_close(this.#stmt);
  }
}

function getCString(v) {
  return Deno.UnsafePointerView.getCString(v);
}

function unwrapErr(e) {
  const str = getCString(e);
  if (str) throw new Error(str);
}

export class Connection {
  #handle;
  constructor() {
    this.#handle = mysql_init(null);
  }

  connect({ host, user, password, database, port, unixSocket, flags }) {
    mysql_real_connect(
      this.#handle,
      cstr(host),
      cstr(user),
      cstr(password),
      cstr(database),
      port || 0,
      cstr(unixSocket),
      flags || 0,
    );
    unwrapErr(mysql_error(this.#handle));
  }

  #lastResult = null;
  #clearResult() {
    if (this.#lastResult) {
      mysql_free_result(this.#lastResult);
      this.#lastResult = null;
    }
  }

  execute(query: string) {
    this.#clearResult();
    mysql_real_query(this.#handle, cstr(query), query.length);
    unwrapErr(mysql_error(this.#handle));
  }

  prepare(query: string) {
    const stmt = new Statement(this.#handle);
    stmt.prepare(query);
    return stmt;
  }

  query(query: string) {
    this.#clearResult();
    mysql_real_query(this.#handle, cstr(query), query.length);
    unwrapErr(mysql_error(this.#handle));
    this.#lastResult = mysql_store_result(this.#handle);
    return new Result(this.#lastResult);
  }

  close() {
    mysql_close(this.#handle);
  }
}

class Result {
  #handle;
  constructor(result) {
    this.#handle = result;
  }

  #rowCount = null;
  get rowCount() {
    if (this.#rowCount === null) {
      this.#rowCount = mysql_num_rows(this.#handle);
    }
    return this.#rowCount;
  }

  #fieldCount = null;
  get fieldCount() {
    if (this.#fieldCount === null) {
      this.#fieldCount = mysql_num_fields(this.#handle);
    }
    return this.#fieldCount;
  }

  all() {
    let data = new Array(this.rowCount);
    let row;
    while(true) {
      row = mysql_fetch_row(this.#handle);
      if (row === 0) break;

      const rowData = new Array(this.fieldCount);
      const b = Deno.UnsafePointerView.getArrayBuffer(row, rowData.length * 8);
      const vui = new Uint32Array(b);
      let j = 0;
      for (let i = 0; i < rowData.length; i++) { 
        const n1 = vui[j] + 2 ** 32 * vui[j + 1];
        rowData[i] = getCString(n1);
        j += 2; 
      }      
      data.push(rowData);
    }
  
    return data;
  }
}
