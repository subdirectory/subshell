#!/usr/bin/env -S deno run -A

const status = await Deno.run({
  cmd: [
    "deno",
    "repl",
    "--unstable",
    "--eval-file=https://deno.land/x/subshell@0.2.13/init.ts",
  ],
}).status();
