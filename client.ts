#!/usr/bin/env -S deno run -A --import-map=https://subqns.github.io/subshell/import_map.json

// ws://127.0.0.1:8000

// import { ApiPromise, WsProvider } from "@polkadot/api";
import { ApiPromise, WsProvider } from 'https://deno.land/x/polkadot@0.0.0-9/api/mod.ts';

// import type { Signer, SignerResult } from "@polkadot/api/types";
import type { Signer, SignerResult } from 'https://deno.land/x/polkadot@0.0.0-9/api/types';
/*
import type {
  Registry,
  SignerPayloadJSON,
  SignerPayloadRaw,
} from "@polkadot/types/types";
*/
import type {
  Registry,
  SignerPayloadJSON,
  SignerPayloadRaw,
} from 'https://deno.land/x/polkadot@0.0.0-9/types/types';

// websocat --binary  'wss://btwiuse-k0s-44wpv764f6qr-8000.githubpreview.dev/api/agent/abcd/jsonl'

export class Client {
  private encoder = new TextEncoder();
  private decoder = new TextDecoder();
  private base: string;
  private id: string;

  constructor(base, id) {
    this.base = base;
    this.id = id;
  }

  async dial() {
    const WS_URL_ID = `${this.base}/api/agent/${this.id}/jsonl`;

    let isReady = false;

    let ws = new WebSocket(WS_URL_ID);

    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      isReady = true;
    };

    ws.onclose = (e) => {
      // console.log("closed", e);
    };

    ws.onerror = (e) => {
      // console.log("errord", e);
    };
    while (!isReady) await new Promise((resolve) => setTimeout(resolve, 200));
    return ws;
  }
  async selectAccount(): string | null {
    let ws = await this.dial();
    return new Promise((resolve, reject) => {
      ws.onmessage = (e) => {
        let cmd = this.decoder.decode(e.data);
        // console.log("received", cmd);
        if (cmd.startsWith("{")) {
          ws.close();
          resolve(JSON.parse(cmd).output);
        }
      };
      let line = '{"method": "selectAccount"}\n';
      // console.log("sending", line);
      ws.send(this.encoder.encode(line));
    });
  }
  async web3Accounts() {
    let ws = await this.dial();
    return new Promise((resolve, reject) => {
      ws.onmessage = (e) => {
        let cmd = this.decoder.decode(e.data);
        // console.log("received", cmd);
        if (cmd.startsWith("{")) {
          ws.close();
          resolve(JSON.parse(cmd).output);
        }
      };
      let line = '{"method": "web3Accounts"}\n';
      // console.log("sending", line);
      ws.send(this.encoder.encode(line));
    });
  }
  async signRaw({ address, data }) {
    let ws = await this.dial();
    const result = await new Promise((resolve, reject) => {
      ws.onmessage = (e) => {
        let cmd = this.decoder.decode(e.data);
        // console.log("received", cmd);
        if (cmd.startsWith("{")) {
          ws.close();
          resolve(JSON.parse(cmd));
        }
      };
      let line =
        JSON.stringify({ method: "signRaw", args: [{ address, data }] }) + `\n`;
      // console.log("sending", line);
      ws.send(this.encoder.encode(line));
    });
    // console.log(result)
    return result;
  }
  async signPayload(payload) {
    let ws = await this.dial();
    const result = await new Promise((resolve, reject) => {
      ws.onmessage = (e) => {
        let cmd = this.decoder.decode(e.data);
        // console.log("received", cmd);
        if (cmd.startsWith("{")) {
          ws.close();
          resolve(JSON.parse(cmd));
        }
      };
      let line = JSON.stringify({ method: "signPayload", args: [payload] }) +
        `\n`;
      // console.log("sending", line);
      ws.send(this.encoder.encode(line));
    });
    // console.log(result)
    return result;
  }
}

/*
const BASE = `wss://btwiuse-k0s-44wpv764f6qr-8000.githubpreview.dev`;
const ID = `abcd`; // Math.random();

let client = new Client(BASE, ID);

while (!client.isReady) {
  await new Promise((resolve) => {
    setTimeout(resolve, 300);
  });
}

let accounts = await client.web3Accounts();
console.log(accounts);
// let signature = await client.sign(accounts[0].address, "Hello");
// console.log(signature);

const provider = new WsProvider("wss://rpc.polkadot.io");
const api = await ApiPromise.create({ provider });
// api.setSigner({signRaw: (x)=>{console.log(x); return {signature: 'sig'}}})
api.setSigner(client);
for (let i of [1,2,3]) {
  const result = await api.sign(accounts[0].address, { data: i + "Hello" + new Date() });
  console.log(result)
}
*/
