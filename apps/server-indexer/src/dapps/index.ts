import type { Dapp } from "~/routes/api/chainhook/webhook.post";
import { alexDapp } from "./alex";
import { arkadikoDapp } from "./arkadiko";
import { bitflowDapp } from "./bitflow";
import { hermeticaDapp } from "./hermetica";
import { stackingdaoDapp } from "./stackingdao";
import { stackswapDapp } from "./stackswap";

export const dapps: Dapp[] = [
  alexDapp,
  arkadikoDapp,
  bitflowDapp,
  hermeticaDapp,
  stackingdaoDapp,
  stackswapDapp,
];
