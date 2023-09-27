require("@chainlink/env-enc").config();

const getProviderRpcUrl = (chain) => {
  let rpcUrl;

  switch (chain) {
    case "polygonMumbai":
      rpcUrl = process.env.POLYGON_MUMBAI_RPC_URL;
      break;
    default:
      throw new Error("Unknown chain: " + chain);
  }

  if (!rpcUrl)
    throw new Error(
      `rpcUrl empty for chain ${chain} - check your environment variables`
    );
  return rpcUrl;
};

const getPrivateKey = () => {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey)
    throw new Error(
      "private key not provided - check your environment variables"
    );
  return privateKey;
};

const getGithubApiToken = () => {
  const githubApiToken = process.env.GITHUB_API_TOKEN;
  if (!githubApiToken)
    throw new Error(
      "githubApiToken not provided - check your environment variables"
    );
  return githubApiToken;
};

module.exports = {
  getPrivateKey,
  getProviderRpcUrl,
  getGithubApiToken,
};
