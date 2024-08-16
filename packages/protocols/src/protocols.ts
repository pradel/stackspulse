export const protocols = [
  "alex",
  "arkadiko",
  "stackswap",
  "velar",
  "bitflow",
  "stackingdao",
  "zest",
  "charisma",
  "lisa",
] as const;

export type Protocol = (typeof protocols)[number];

export const isProtocol = (value: string): value is Protocol =>
  protocols.includes(value as Protocol);

export const protocolsInfo: {
  [key in Protocol]: {
    name: string;
    description: string;
    website: string;
    x: string;
    contracts: string[];
  };
} = {
  alex: {
    name: "Alex",
    description:
      "Next Gen DeFi on Bitcoin via Stacks. Building Financial Infrastructure on Bitcoin through Stacks.",
    website: "https://alexgo.io/",
    x: "https://twitter.com/ALEXLabBTC",
    contracts: [
      "SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-pool-v2-01",
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
    // List of contract https://docs.bitflow.finance/bitflow-documentation/developers/deployed-contracts/stacks
    contracts: [
      // StableSwap Contracts
      "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-stx-ststx-v-1-2",
      "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-usda-susdt-v-1-2",
      "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-aeusdc-susdt-v-1-2",
      "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-usda-aeusdc-v-1-2",
      "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-usda-aeusdc-v-1-4",
      "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-abtc-xbtc-v-1-2",
      // Earn Contracts
      "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.earn-stx-ststx-v-1-2",
      "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.earn-usda-susdt-v-1-3",
      "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.earn-aeusdc-susdt-v-1-3",
      "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.earn-usda-aeusdc-v-1-3",
      "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.earn-usda-aeusdc-v-1-5",
      "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.earn-abtc-xbtc-v-1-3",
      // Router Contracts
      "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.router-stx-ststx-bitflow-arkadiko-v-1-1",
      "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.router-stx-ststx-bitflow-velar-v-1-2",
      "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.router-stx-ststx-bitflow-alex-v-1-1",
      "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.router-stx-ststx-bitflow-alex-v-2-1",
      "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.router-stx-ststx-bitflow-xyk-v-1-1",
      "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.router-stx-usda-arkadiko-alex-v-1-1",
      "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.router-xyk-arkadiko-v-1-1",
      "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.router-xyk-velar-v-1-1",
      "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.router-xyk-alex-v-1-1",
      "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.router-velar-alex-v-1-1",
    ],
  },
  stackingdao: {
    name: "StackingDAO",
    description:
      "Liquid stacking on Stacks. Earn 10% APY on STX with instant liquidity 📈",
    website: "https://www.stackingdao.com/",
    x: "https://twitter.com/StackingDao",
    contracts: [
      "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v1",
      "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v2",
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
  charisma: {
    name: "Charisma",
    description:
      "Charisma is a gamified Defi platform pushing the limits of innovation on Stacks. It specializes in liquid staking, yield farming, and arbitrage.",
    website: "https://charisma.rocks",
    x: "https://twitter.com/CharismaBTC",
    contracts: [
      "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dungeon-master",
      "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme001-proposal-voting",
      "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme002-proposal-submission",
      "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dme005-token-faucet-v0",
      "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.green-room",
      "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.creatures",
      "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.apple-orchard",
      "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.arbitrage-w-s-sw-w-zf",
      "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-stabilizer-v0",
      "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.icc-arb-2",
      "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.odins-raven",
    ],
  },
  lisa: {
    name: "Lisa",
    description: "Liquid Stacking Protocol on Stacks.",
    website: "https://www.lisalab.io/",
    x: "https://twitter.com/LisaLab_BTC",
    contracts: [
      "SM3KNVZS30WM7F89SXKVVFY4SN9RMPZZ9FX929N0V.lqstx-mint-endpoint-v2-01",
    ],
  },
} as const;
