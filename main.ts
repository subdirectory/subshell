#!/usr/bin/env -S deno run -A

const status = await Deno.run({
  cmd: [
    "deno",
    "repl",
    "--allow-net",
    "--allow-env",
    "--no-prompt",
    "--eval-file=https://deno.land/x/subshell@0.2.45-4/init.ts",
  ],
}).status();
