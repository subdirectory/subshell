#!/usr/bin/env -S deno run -A

const status = await Deno.run({ cmd: ["subshell", "repl", "--unstable", "--compat", "--eval-file=https://deno.land/x/subshell@0.0.1/init.ts"] }).status();
