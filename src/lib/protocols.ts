export const protocols = ["alex", "arkadiko", "stackswap", "velar"] as const;

export type Protocol = (typeof protocols)[number];

export const isProtocol = (value: string): value is Protocol =>
  protocols.includes(value as Protocol);

export const protocolsInfo = {
  alex: {
    name: "Alex",
    description:
      "Next Gen DeFi on Bitcoin via Stacks. Building Financial Infrastructure on Bitcoin through Stacks.",
    website: "https://alexgo.io/",
    x: "https://twitter.com/ALEXLabBTC",
  },
  arkadiko: {
    name: "Arkadiko",
    description:
      "Arkadiko is a decentralized, non-custodial liquidity protocol where users can collateralize their assets and mint a stablecoin called USDA.",
    website: "https://arkadiko.finance/",
    x: "https://twitter.com/ArkadikoFinance",
  },
  stackswap: {
    name: "StackSwap",
    description:
      "Stackswap is a combination of DEX and token launchpad on Stacks blockchain.",
    website: "https://app.stackswap.org/",
    x: "https://twitter.com/Stackswap_BTC",
  },
  velar: {
    name: "Velar",
    description: "DeFi Liquidity Protocol on Bitcoin.",
    website: "https://www.velar.co/",
    x: "https://twitter.com/VelarBTC",
  },
} as const;
