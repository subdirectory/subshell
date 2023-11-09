import "https://deno.land/x/polkadot@0.2.43/api-augment/mod.ts";
import {
  ApiPromise,
  WsProvider,
} from "https://deno.land/x/polkadot@0.2.43/api/mod.ts";
import { GearApi } from "https://gear-js.deno.dev/api/src/index.ts";
import { Client } from "https://deno.land/x/subshell@0.2.43-8/client/mod.ts";
// import { VerboseSigner } from "https://deno.land/x/subshell@0.2.43-8/signer/mod.ts";
import { fromPng } from "npm:@rgba-image/png";
import * as sixel from "npm:sixel";
import { stringToU8a } from "https://deno.land/x/polkadot@0.2.43/util/mod.ts";
import {
  ImageMagick,
  initializeImageMagick,
  MagickGeometry,
} from "https://deno.land/x/imagemagick_deno@0.0.14/mod.ts";

await initializeImageMagick();

const GEAR = !!Deno.env.get("GEAR");
const DEFAULT_PROVIDER = GEAR
  ? "wss://rpc.vara-network.io"
  : "wss://rpc.polkadot.io";
const SESSION_ID = Deno.env.get("SESSION_ID") ?? "";
const PROVIDER = Deno.env.get("PROVIDER") ?? DEFAULT_PROVIDER;
const TYPES = JSON.parse(Deno.env.get("TYPES") ?? "null");
const HUB = Deno.env.get("HUB") ?? `ws://localhost:8000`;

async function image2sixel(imageBuffer: Uint8Array): Uint8Array {
  let resizedBuffer = await new Promise<Uint8Array>((resolve) => {
    ImageMagick.read(imageBuffer, (image) => {
      // console.log(image.width, image.height);
      let scaleFactor = 160.0 / image.height;
      const sizingData = new MagickGeometry(
        image.width * scaleFactor,
        image.height * scaleFactor,
      );
      image.resize(sizingData);
      image.write((data) => resolve(data));
    });
  });

  let s = await fromPng(resizedBuffer);

  return stringToU8a(sixel.image2sixel(s.data, s.width, s.height));
}

export async function showBanner() {
  const { columns } = Deno.consoleSize(0); // --unstable
  if (columns <= 100) {
    return;
  }

  let SubshellBannerURL =
    "https://raw.githubusercontent.com/subdirectory/subshell/main/.github/SubshellBanner.png";
  let SubshellBannerImage = new Uint8Array(
    await (await fetch(SubshellBannerURL)).arrayBuffer(),
  );
  let SubshellBannerSixel = await image2sixel(SubshellBannerImage);

  let GearShellBannerURL =
    "https://raw.githubusercontent.com/subdirectory/subshell/main/.github/GearShellBanner.png";
  let GearShellBannerImage = new Uint8Array(
    await (await fetch(GearShellBannerURL)).arrayBuffer(),
  );
  let GearShellBannerSixel = await image2sixel(GearShellBannerImage);

  if (GEAR) {
    await Deno.stdout.write(GearShellBannerSixel);
  } else {
    await Deno.stdout.write(SubshellBannerSixel);
  }
}

function progInfo() {
  /* print program info from package.json */

  const info: { [key: string]: string } = {
    // "⚙️ v8 version ": Deno.version.v8,
    // "🇹 TypeScript version ": Deno.version.typescript,
    "🦕 Deno": Deno.version.deno,
    "📗 Wiki": "https://wiki.subshell.xyz",
    "🙋 Issues": "https://github.com/btwiuse/subshell/issues",
    // "⛓️ RPC Pprvider": PROVIDER,
    // "🪄 Custom types": JSON.stringify(TYPES) != '{}' ? 'Yes' : 'None',
    // "📖 Runtime api reference": 'https://substrate.rs',
  };

  Object.keys(info)
    .forEach((k) => {
      const prop = k;
      const value = info[k];
      console.log(`%c${prop} %c${value}`, "color: blue", "color: green");
    });
}

Deno.addSignalListener("SIGINT", () => {
  console.log("interrupted!");
});

await showBanner();

progInfo();

console.log();

// deno-lint-ignore no-explicit-any
function info(msg: any = "", prefix = "  ") {
  console.log(`%c${prefix} %c${msg}`, "color: yellow", "color: white");
}

info(`RPC Provider: ${PROVIDER}`, "🔗");
const customTypes = JSON.stringify(TYPES) != "{}" ? "Yes" : "None";
info(`Custom types: ${customTypes}`);
info("api is initializing. Please hold on...");

async function sleep(ms = 2000) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

const wsProvider = new WsProvider(
  PROVIDER,
);
let api;
if (GEAR) {
  api = await GearApi.create({ provider: wsProvider, types: TYPES });
} else {
  api = await ApiPromise.create({ provider: wsProvider, types: TYPES });
}

interface ISubshell {
  extension?: Client;
  showExamples(): Promise<void>;
}

const Subshell: ISubshell = {
  showExamples: async () => {
    info();
    info(`Hello and welcome! Here are some Subshell basic examples to try:`);
    info();
    info("get chain name", "💁");
    info("> api.runtimeChain.toHuman()");
    info(api.runtimeChain.toHuman());
    info();
    await sleep();
    info("get ss58 prefix", "💁");
    info("> api.consts.system.ss58Prefix.toHuman()");
    info(api.consts.system.ss58Prefix.toHuman());
    info();
    await sleep();
    info("get current block", "💁");
    info("> (await api.query.system.number()).toNumber()");
    // deno-lint-ignore no-explicit-any
    info((await api.query.system.number() as any).toNumber());
    info();
    await sleep();
    info("get runtime metadata version", "💁");
    info("> api.runtimeMetadata.version");
    info(api.runtimeMetadata.version);
    info();
    await sleep();
    info("get accounts in Polkadot.js extension wallet", "💁");
    info("> await Subshell.extension?.web3Accounts()");
    info(
      (await Subshell.extension?.web3Accounts()) ||
        "   No injected account was found. ¯_(ツ)_/¯ \n   You may want to install the Polkadot.js wallet extension and setup the keyring first.",
    );
    info();
    await sleep();
    info("sign a message with account.", "💁");
    info(
      "(You should see a signing request if you have the wallet extension installed and enabled. Feel free to click cancel)",
    );
    info("> await api.sign(ALICE, {data: 'Hello, Subshell!'})");
    info(`(skipped. Try it by replacing ALICE with your own address)`);
    info();
    await sleep();
    info("verify signature", "💁");
    info(`> import { signatureVerify } from "@polkadot/util-crypto"`);
    info(`> signatureVerify('Hello, Subshell!', Signature, ALICE)`);
    info(
      `(skipped. Try it by replacing Signature with output of previous example)`,
    );
    info();
    await sleep();
    info("sign and send a transaction.", "💁");
    info(
      "(You should see a signing request if you have the wallet extension installed and enabled. Feel free to click cancel)",
    );
    info(
      "> await api.tx.system.remarkWithEvent('Hello, Subshell!').signAndSend(BOB)",
    );
    info(`(skipped. Try it by replacing BOB with your own address)`);
    info();
    await sleep();
    info("For more information, visit https://wiki.subshell.xyz");
  },
};

if (SESSION_ID) {
  Subshell.extension = new Client(HUB, SESSION_ID);
}
info(`api has been injected into the global object.`);

if (Subshell.extension) {
  info(`Connecting to the Polkadot.js browser wallet extension...`);
  const accounts = await Subshell.extension?.web3Accounts();
  if (accounts.length > 0) {
    api.setSigner(Subshell.extension);
    info(`Polkadot.js extension signer bridge has been established.`, "✨");
  } else {
    info(`Polkadot.js extension is not properly setup.`, `🔴`);
    info(
      `Please install, enable, and add to it at least one keypair to explore all features of Subshell.`,
    );
  }
}

info();
info(
  `Now you can start exploring the Polkadot.js api in this Deno repl environment! For example:`,
  "💡",
);
info();
info(`check if the api is indeed connected:`, "💁");
info();
info(`  > api.isConnected`);
info(`  ${api.isConnected}`);
info();
info(
  `If it is your first time using Subshell, click the ❔ icon at the top-right corner of the screen`,
  `👉`,
);

console.log();
