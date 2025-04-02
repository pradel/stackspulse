import type { Dapp } from "~/routes/api/chainhook/webhook.post";
import { alexDapp } from "./alex";
import { arkadikoDapp } from "./arkadiko";
import { hermeticaDapp } from "./hermetica";
import { stackswapDapp } from "./stackswap";

export const dapps: Dapp[] = [
  alexDapp,
  arkadikoDapp,
  hermeticaDapp,
  stackswapDapp,
];
