import { ApiPromise, WsProvider } from "npm:@polkadot/api";

async function initApi() {
  const PROVIDER = Deno.env.get("PROVIDER") ?? "wss://rpc.polkadot.io";
  const provider = new WsProvider(PROVIDER);
  return await ApiPromise.create({ provider });
}

console.log("api is initializing. Please hold on...");

const api = await initApi();
