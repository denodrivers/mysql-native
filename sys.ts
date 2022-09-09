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

let lib: Deno.DynamicLibrary<typeof symbols>["symbols"];
const filename = Deno.env.get("DENO_MYSQL_PATH") || {
  windows: "mysqlclient",
  darwin: "libmysqlclient.dylib",
  linux: "libmysqlclient.so",
}[Deno.build.os];

if (!filename) {
  throw new Error(`Unsupported platform: ${Deno.build.os}`);
}

try {
  lib = Deno.dlopen(filename, symbols).symbols;
} catch (e) {
  if (e instanceof Deno.errors.PermissionDenied) {
    throw e;
  }
  console.log(
    "%clibmysqlclient not found. Please install libmysqlclient and try again or set the DENO_MYSQL_PATH environment variable to the path of the library.",
    "color: green;",
  );
  throw e;
}

export default lib;
