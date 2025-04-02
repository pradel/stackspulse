import { dapps } from "~/dapps";
import { consola } from "~/lib/consola";

export default defineNitroPlugin(async () => {
  for (const dapp of dapps) {
    await dapp.init();
  }
  consola.success("Plugin: dapps registered");
});
