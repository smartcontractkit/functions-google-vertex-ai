const supportedChains = ["polygonMumbai"];

const polygonMumbai = {
  router: "0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C",
  link: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
  donId: "fun-polygon-mumbai-1",
  gatewayUrls: [
    "https://01.functions-gateway.testnet.chain.link/",
    "https://02.functions-gateway.testnet.chain.link/",
  ],
  explorerUrl: "https://mumbai.polygonscan.com",
};

const getNeworkConfig = (chain) => {
  switch (chain) {
    case "polygonMumbai":
      return polygonMumbai;
    default:
      throw new Error("Unknown chain: " + chain);
  }
};

module.exports = {
  getNeworkConfig,
  supportedChains,
};
