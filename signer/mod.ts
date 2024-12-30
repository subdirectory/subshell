import { ApiPromise, WsProvider } from "npm:@polkadot/api";
import type { Signer, SignerResult } from "npm:@polkadot/api/types";
import type {
  Registry,
  SignerPayloadJSON,
  SignerPayloadRaw,
} from "npm:@polkadot/types/types";
import { Keyring } from "npm:@polkadot/api";
import { createTestPairs } from "npm:@polkadot/keyring";

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
