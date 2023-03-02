#!/usr/bin/env -S deno run -A

const status = await Deno.run({
  cmd: [
    "deno",
    "repl",
    "--allow-net",
    "--allow-env",
    "--no-prompt",
    "--unstable",
    "--eval-file=https://deno.land/x/subshell@0.2.28-2/init.ts",
  ],
}).status();
