#!/usr/bin/env -S deno run -A

import { fromPng } from "npm:@rgba-image/png";
import * as sixel from "npm:sixel";
import { stringToU8a } from "npm:@polkadot/util";
import {
  ImageMagick,
  initializeImageMagick,
  MagickGeometry,
} from "https://deno.land/x/imagemagick_deno@0.0.31/mod.ts";

await initializeImageMagick();

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

let img = await fetch(
  "https://raw.githubusercontent.com/subdirectory/subshell/main/.github/SubshellBanner.png",
);
let imageBuffer = new Uint8Array(await img.arrayBuffer());
Deno.stdout.writeSync(await image2sixel(imageBuffer));

img = await fetch(
  "https://raw.githubusercontent.com/subdirectory/subshell/main/.github/GearShellBanner.png",
);
imageBuffer = new Uint8Array(await img.arrayBuffer());
Deno.stdout.writeSync(await image2sixel(imageBuffer));

// imageBuffer = Deno.readFileSync("./GearShell_vectorized.png");
// Deno.stdout.writeSync(await image2sixel(imageBuffer));

// Deno.stdout.writeSync(await image2sixel(Deno.readFileSync("./.github/SubshellBanner.png")));

// TODO: investigate: this line must be executed before the next line succeeds
await image2sixel(Deno.readFileSync("./.github/SubshellBanner.png"));
Deno.stdout.writeSync(
  await image2sixel(Deno.readFileSync("./.github/GearShellBanner.png")),
);
