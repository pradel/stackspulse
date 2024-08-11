export const protocols = [
  "alex",
  "arkadiko",
  "stackswap",
  "velar",
  "bitflow",
  "stackingdao",
  "zest",
] as const;

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
    contracts: [
      "SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-pool-v2-01",
      // Contracts before hack
      "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.amm-swap-pool-v1-1",
      "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.swap-helper-v1-01",
      "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.swap-helper-v1-02",
      "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.swap-helper-v1-03",
    ],
  },
  arkadiko: {
    name: "Arkadiko",
    description:
      "Arkadiko is a decentralized, non-custodial liquidity protocol where users can collateralize their assets and mint a stablecoin called USDA.",
    website: "https://arkadiko.finance/",
    x: "https://twitter.com/ArkadikoFinance",
    contracts: [
      "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-swap-v2-1",
      "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-multi-hop-swap-v1-1",
    ],
  },
  bitflow: {
    name: "Bitflow",
    description: "The Decentralized Exchange for Bitcoiners.",
    website: "https://www.bitflow.finance/",
    x: "https://twitter.com/Bitflow_Finance",
    contracts: [
      "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-abtc-xbtc-v-1-2",
      "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-aeusdc-susdt-v-1-2",
      "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-stx-ststx-v-1-2",
      "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-usda-aeusdc-v-1-2",
      "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-usda-susdt-v-1-2",
    ],
  },
  stackingdao: {
    name: "StackingDAO",
    description: "Liquid stacking on Stacks.",
    website: "https://www.stackingdao.com/",
    x: "https://twitter.com/StackingDao",
    contracts: [
      "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v1",
    ],
  },
  stackswap: {
    name: "StackSwap",
    description:
      "Stackswap is a combination of DEX and token launchpad on Stacks blockchain.",
    website: "https://app.stackswap.org/",
    x: "https://twitter.com/Stackswap_BTC",
    contracts: ["SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.stackswap-swap-v5k"],
  },
  velar: {
    name: "Velar",
    description: "DeFi Liquidity Protocol on Bitcoin.",
    website: "https://www.velar.co/",
    x: "https://twitter.com/VelarBTC",
    contracts: [
      "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-router",
      "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-path2",
    ],
  },
  zest: {
    name: "Zest",
    description: "Zest Protocol is a BTC and Bitcoin L2 lending protocol.",
    website: "https://www.zestprotocol.com/",
    x: "https://twitter.com/ZestProtocol",
    contracts: [
      "SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.pool-borrow",
      "SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.borrow-helper-v1-0",
      "SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.borrow-helper-v1-1",
      "SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.borrow-helper-v2-1",
      "SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.borrow-helper-v2-2",
      "SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.borrow-helper-v1-2",
      "SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.borrow-helper-v1-3",
    ],
  },
} as const;
