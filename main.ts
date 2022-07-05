#!/usr/bin/env -S deno run -A

const status = await Deno.run({
  cmd: [
    "deno",
    "repl",
    "--unstable",
    "--compat",
    "--eval-file=https://deno.land/x/subshell@0.0.4/init.ts",
  ],
}).status();
