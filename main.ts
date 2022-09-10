#!/usr/bin/env -S deno run -A

const status = await Deno.run({
  cmd: [
    "deno",
    "repl",
    "--unstable",
    "--compat",
    "--eval-file=https://deno.land/x/subshell@0.2.6-6/init.ts",
  ],
}).status();
