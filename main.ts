#!/usr/bin/env -S deno run -A

const status = await Deno.run({
  cmd: [
    "deno",
    "repl",
    "--allow-net",
    "--allow-env",
    "--no-prompt",
    "--unstable",
    "--eval-file=https://deno.land/x/subshell@0.2.43-5/init.ts",
  ],
}).status();
