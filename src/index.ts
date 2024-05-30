import { ApiPromise, WsProvider } from "@polkadot/api";
import { LightClient } from "./client/LightClient";


function main() {
  const wsProvider = new WsProvider("wss://rpc.polkadot.io");
  const api = new ApiPromise({ provider: wsProvider });


    const lightClient = new LightClient (api, 10);
    lightClient.init();
}

main();