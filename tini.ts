import {
  ApiPromise,
  ApiRx,
  WsProvider,
} from "https://deno.land/x/polkadot@0.2.31/api/mod.ts";

async function initApi() {
  const PROVIDER = Deno.env.get("PROVIDER") ?? "wss://rpc.polkadot.io";
  const provider = new WsProvider(PROVIDER);
  return {
    api: await ApiPromise.create({ provider }),
    $api: new ApiRx({ provider }),
  };
}

console.log("api is initializing. Please hold on...");

const { api, $api } = await initApi();
