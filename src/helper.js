const ethers = require("ethers");
const { getProviderRpcUrl, getPrivateKey } = require("./config");

/**
 * Gets an Ethers.js provider for a given blockchain network chain.
 *
 * @param {string} chain - The name or identifier of the blockchain network.
 * @returns {ethers.providers.JsonRpcProvider} An Ethers.js provider for the specified blockchain network.
 */
const getEthersProvider = (chain) => {
  // Get the RPC URL for the chain
  const rpcUrl = getProviderRpcUrl(chain);
  // Initialize a provider using the obtained RPC URL
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

  return provider;
};

/**
 * Gets an Ethers.js signer for a given blockchain network chain.
 *
 * @param {string} chain - The name or identifier of the blockchain network.
 * @returns {ethers.Wallet} An Ethers.js signer (Wallet) connected to the specified blockchain network.
 */
const getEthersSigner = (chain) => {
  // fetch the signer privateKey
  const privateKey = getPrivateKey();

  // Initialize a provider using the obtained RPC URL
  const provider = getEthersProvider(chain);
  const wallet = new ethers.Wallet(privateKey);
  const signer = wallet.connect(provider);

  return signer;
};

/**
 * Validates the number of arguments passed to a function.
 *
 * @param {number} expectedCount - The expected minimum number of arguments.
 * @param {number} actualCount - The actual number of arguments passed.
 * @throws {Error} If the actual number of arguments is less than the expected minimum.
 */
const validateArgumentCount = (expectedCount, actualCount) => {
  if (actualCount < expectedCount) {
    throw new Error(
      `Insufficient arguments. Minimum required is ${expectedCount}, but got ${actualCount}`
    );
  }
};

/**
 * Handle and validate command-line arguments, then execute the relevant command.
 *
 * @param {Function} executeCommand - A function to execute the appropriate command.
 *                                    The function should accept a command string and an array of arguments.
 * @throws {Error} Throws an error if the command execution fails.
 * @returns {Promise<void>} A promise that resolves when the command has been executed.
 */
const handleArguments = async (executeCommand) => {
  // Get command-line arguments
  const args = process.argv;
  const command = args[2];
  // Execute the appropriate command based on user input
  await executeCommand(command, args);
};

module.exports = {
  getEthersSigner,
  getEthersProvider,
  validateArgumentCount,
  handleArguments,
};
