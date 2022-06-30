#!/usr/bin/env -S deno run -A

const status = await Deno.run({ cmd: ["subshell", "repl", "--unstable", "--compat", "--eval-file=https://deno.land/x/subshell@0.0.2/init.ts"] }).status();
