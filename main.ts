#!/usr/bin/env -S deno run -A

const status = await Deno.run({
  cmd: [
    "deno",
    "repl",
    "--unstable",
    "--compat",
    "--eval-file=https://deno.land/x/subshell@0.1.0/init.ts",
  ],
}).status();
