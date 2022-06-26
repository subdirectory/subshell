import { ApiPromise, WsProvider } from 'https://deno.land/x/polkadot@0.0.1/api/mod.ts';
import type { Signer, SignerResult } from 'https://deno.land/x/polkadot@0.0.1/api/types';
import type {
  Registry,
  SignerPayloadJSON,
  SignerPayloadRaw,
} from 'https://deno.land/x/polkadot@0.0.1/types/types';

export class Client implements Signer {
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
  async signRaw({ address, data }: SignerPayloadRaw): Promise<SignerResult> {
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
  async signPayload(payload: SignerPayloadJSON): Promise<SignerResult> {
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
