import {
  ApiPromise,
  WsProvider,
} from "https://deno.land/x/polkadot@0.2.45/api/mod.ts";
import type {
  Signer,
  SignerResult,
} from "https://deno.land/x/polkadot@0.2.45/api/types/index.ts";
import type {
  Registry,
  SignerPayloadJSON,
  SignerPayloadRaw,
} from "https://deno.land/x/polkadot@0.2.45/types/types/index.ts";
import { Keyring } from "https://deno.land/x/polkadot@0.2.45/api/mod.ts";
import { createTestPairs } from "https://deno.land/x/polkadot@0.2.45/keyring/mod.ts";

export function VerboseSigner(inner: Signer): Signer {
  async function signRaw(payload: SignerPayloadRaw): Promise<SignerResult> {
    console.log("[INFO] method: signRaw, args:", payload);
    let result = await inner.signRaw!(payload);
    console.log("[INFO] result:", result);
    return result;
  }
  async function signPayload(
    payload: SignerPayloadJSON,
  ): Promise<SignerResult> {
    console.log("[INFO] method: signPayload, args:", payload);
    let result = await inner.signPayload!(payload);
    console.log("[INFO] result:", result);
    return result;
  }
  return {
    signRaw,
    signPayload,
  };
}

// export const Alice = createTestPairs().alice;
