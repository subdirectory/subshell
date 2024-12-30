#!/usr/bin/env -S deno run --allow-read --allow-run --allow-write --allow-env
// Copyright 2017-2022 @polkadot/deno authors & contributors
// SPDX-License-Identifier: Apache-2.0

// execute with
//   deno run --allow-read --allow-run --allow-write --allow-env ci-release.ts

import { stringCamelCase } from "npm:@polkadot/util";

// tighter specification for git arguments
type GitArgs =
  | ["add", "--all", "."]
  | ["checkout", "main"]
  | ["commit", "--no-status", "--quiet", "-m", string]
  | [
    "config",
    "merge.ours.driver" | "push.default" | `user.${"email" | "name"}`,
    string,
  ]
  | ["config", "--unset", string]
  | ["push", string]
  | ["push", string, "--tags"]
  | ["tag", string];

// regex for matching `deno.land/x/subshell[@<version>]/
const RE_PKG = /deno\.land\/x\/subshell(@\d*\.\d*\.\d*(-\d*)?)?\//g;

// regex for matching `ENV SUBSHELL_VERSION <version>
const RE_SUBSHELL_VERSION = /ENV\ SUBSHELL_VERSION\ .*/g;

// regex for matching `deno.land/x/polkadot[@<version>]/
const RE_PKG_POLKADOT = /deno\.land\/x\/polkadot(@\d*\.\d*\.\d*(-\d*)?)?\//g;

const POLKADOT_VERSION = (await Deno.readTextFile("POLKADOT_VERSION")).trim();

// execute a command
async function exec(...cmd: string[]): Promise<void> {
  const shortCmd = `'${cmd[0]} ${cmd[1]} ...'`;

  console.log(`+ ${shortCmd}`);

  const status = await Deno.run({ cmd }).status();

  if (!status.success) {
    throw new Error(`FATAL: ${shortCmd} returned ${status.code}`);
  }
}

// shortcut for exec('git', ...string[])
function git(...args: GitArgs): Promise<void> {
  return exec("git", ...args);
}

// retrieve the current version from CHANGELOG.md
async function getVersion(): Promise<string> {
  const contents = await Deno.readTextFile("CHANGELOG.md");
  const vermatch = contents.match(/# CHANGELOG\n\n## (\d*.\d*.\d*(-\d*)?) /);

  if (!vermatch || !vermatch[1]) {
    throw new Error(
      "FATAL: Unable to extract expected version from CHANGELOG.md",
    );
  }

  return vermatch[1];
}

async function setSubshellVersion(
  regexp: RegExp,
  version: string,
  dockerfile: string,
): Promise<void> {
  const contents = await Deno.readTextFile(dockerfile);
  if (regexp.test(contents)) {
    await Deno.writeTextFile(
      dockerfile,
      contents.replace(regexp, `ENV SUBSHELL_VERSION ${version}`),
    );
  }
}

async function setPkgVersion(
  regexp: RegExp,
  pkg: string,
  version: string,
  dir: string,
): Promise<void> {
  for await (const entry of Deno.readDir(dir)) {
    if (entry.isDirectory) {
      await setPkgVersion(regexp, pkg, version, `${dir}/${entry.name}`);
    } else if (
      entry.name.endsWith(".ts") || entry.name.endsWith(".md") ||
      entry.name.startsWith("subsh")
    ) {
      const path = `${dir}/${entry.name}`;
      const contents = await Deno.readTextFile(path);

      if (regexp.test(contents)) {
        await Deno.writeTextFile(
          path,
          contents.replace(regexp, `${pkg}@${version}/`),
        );
      }
    }
  }
}

// sets up git, username, merge & latest
async function gitSetup(): Promise<void> {
  const USER = "subshell";
  const MAIL = "subshell@subshell.xyz";

  await git("config", "user.name", USER);
  await git("config", "user.email", MAIL);
  await git("config", "push.default", "simple");
  await git("config", "merge.ours.driver", "true");
  // await git("config", "--unset", "http.https://github.com/.extraheader");
  await git("checkout", "main");
}

// commit and push the changes to git
async function gitPush(version: string): Promise<void> {
  const REPO = `https://${Deno.env.get("GH_PAT")}@github.com/${
    Deno.env.get("GITHUB_REPOSITORY")
  }.git`;

  await git("add", "--all", ".");
  await git(
    "commit",
    // "--no-status",
    // "--quiet",
    "-m",
    // `[CI Skip] deno.land/x/subshell@${version}`,
    `deno.land/x/subshell@${version}`,
  );
  await git("push", REPO);
  await git("tag", version);
  await git("push", REPO, "--tags");
}

// creates a new mod.ts file with all the available imports
async function createModTs(): Promise<void> {
  const imports: string[] = [];

  for await (const entry of Deno.readDir(".")) {
    if (entry.isDirectory && !entry.name.startsWith(".")) {
      imports.push(
        `export * as ${
          stringCamelCase(entry.name)
        } from './${entry.name}/mod.ts';`,
      );
    }
  }

  await Deno.writeTextFile(
    "mod.ts",
    `// Copyright 2017-${
      new Date().getFullYear()
    } subshell authors & contributors\n// SPDX-License-Identifier: MIT\n\n// auto-generated via ci-release.ts, do not edit\n\n${
      imports.sort().join("\n")
    }\n`,
  );
}

const version = await getVersion();

await gitSetup();
await createModTs();
// sets the version to Dockerfile env SUBSHELL_VERSION
await setSubshellVersion(RE_SUBSHELL_VERSION, version, "Dockerfile");
// sets the version globally to all deno.land/x/subshell imports
await setPkgVersion(RE_PKG, "deno.land/x/subshell", version, ".");
// sets the version globally to all deno.land/x/polkadot imports
await setPkgVersion(
  RE_PKG_POLKADOT,
  "deno.land/x/polkadot",
  POLKADOT_VERSION,
  ".",
);
// await gitPush(version);
