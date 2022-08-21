import {
  ApiPromise,
  WsProvider,
} from "https://deno.land/x/polkadot@0.2.2/api/mod.ts";

async function initApi() {
  const PROVIDER = Deno.env.get("PROVIDER") ?? "wss://rpc.polkadot.io";
  const provider = new WsProvider(PROVIDER);
  return await ApiPromise.create({ provider });
}

console.log("api is initializing. Please hold on...");

const api = await initApi();
