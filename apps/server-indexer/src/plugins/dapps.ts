import { alexDapp } from "~/dapps/alex";
import { consola } from "~/lib/consola";

export default defineNitroPlugin(async () => {
  await alexDapp.init();
  consola.success("Plugin: dapps registered");
});
