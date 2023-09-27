const {
  SecretsManager,
  createGist,
  deleteGist,
} = require("@chainlink/functions-toolkit");

const {
  getEthersSigner,
  validateArgumentCount,
  handleArguments,
} = require("./helper");
const { getNeworkConfig, getGithubApiToken } = require("./config");
require("@chainlink/env-enc").config();

/**
 * Execute a command based on the user's input arguments.
 *
 * @param {string} command - The command to execute.
 * @param {Array<string>} args - The command line arguments.
 */
const executeCommand = async (command, args) => {
  switch (command) {
    case "encrypt": {
      // read subscription: node src/secrets.js encrypt <chain> <key1,key2,key3,..>
      // example: node src/secrets.js encrypt polygonMumbai SECRET1,SECRET2
      validateArgumentCount(5, args.length);
      // fetch the secrets
      const secrets = buildSecretsObject(args[4].split(","));
      const encryptedSecrets = await encryptSecrets(
        args[3] /* chain */,
        secrets
      );
      console.log("Encrypted secrets:", encryptedSecrets);
      break;
    }
    case "encrypt-upload": {
      // read subscription: node src/secrets.js encrypt-upload <chain> <key1,key2,key3,..> <slotIdNumber> <expirationTimeMinutes>
      // example: node src/secrets.js encrypt-upload polygonMumbai SECRET1,SECRET2 0 60
      validateArgumentCount(7, args.length);
      // fetch the secrets
      const secrets = buildSecretsObject(args[4].split(","));
      await encryptSecretsAndPush(
        args[3] /* chain */,
        secrets,
        args[5] /* slotIdNumber */,
        args[6] /* expirationTimeMinutes */
      );
      break;
    }
    case "encrypt-gist": {
      // read subscription: node src/secrets.js encrypt-gist <chain> <key1,key2,key3,..>
      // example: node src/secrets.js encrypt-gist polygonMumbai SECRET1,SECRET2
      validateArgumentCount(5, args.length);
      // fetch the secrets
      const secrets = buildSecretsObject(args[4].split(","));
      const githubApiToken = getGithubApiToken();
      await encryptSecretsGist(args[3] /* chain */, secrets, githubApiToken);
      break;
    }
    default:
      throw new Error(`Unknown command ${command}`);
  }
};

/**
 * Build an object containing secrets based on the given array of keys.
 *
 * @param {string[]} keys - An array of keys to look for in the environment variables.
 * @returns {Record<string, string>} An object containing the secrets.
 * @throws {Error} Throws an error if a key is missing in the environment variables.
 */
const buildSecretsObject = (keys) => {
  // Initialize an empty object to hold the secrets
  const secrets = {};

  // Loop through the array of keys
  for (const key of keys) {
    // Fetch the value of each key from the environment variables
    const value = process.env[key];

    // Check if the value is missing or undefined
    if (!value) {
      // Throw an error if the key is not found in the environment variables
      throw new Error(
        `The key "${key}" is missing from your environment variables. Run "npx env-enc set" to add it.`
      );
    }

    // Add the key-value pair to the secrets object
    secrets[key] = value;
  }

  // Return the populated secrets object
  return secrets;
};

/**
 * Initialize and return a SecretsManager instance.
 *
 * @param {string} chain - The blockchain network to use.
 * @returns {Promise<SecretsManager>} Initialized SecretsManager instance.
 */
const getSecretsManager = async (chain) => {
  // Initialize signer and get contract addresses
  const signer = getEthersSigner(chain);
  const { router, donId } = getNeworkConfig(chain);

  // Initialize and return SecretsManager
  const secretsManager = new SecretsManager({
    signer,
    functionsRouterAddress: router,
    donId: donId,
  });
  await secretsManager.initialize();
  return secretsManager;
};

/**
 * Encrypt secrets.
 *
 * @param {string} chain - The blockchain network to use.
 * @param {Record<string, string>} secrets - The secrets to encrypt.
 * @returns {Promise<Object<string>>}
 */
const encryptSecrets = async (chain, secrets) => {
  // Initialize SecretsManager
  const secretsManager = await getSecretsManager(chain);

  // Encrypt secrets
  const encryptedSecrets = await secretsManager.encryptSecrets(secrets);
  return encryptedSecrets;
};

/**
 * Asynchronously encrypts a list of secret URLs.
 *
 * @param {string} chain - The name of the blockchain chain.
 * @param {Array<string>} secretsUrls - An array of URLs to be encrypted.
 *
 * @returns {Promise<string>} A Promise that resolves to an encrypted string.
 *
 * @example
 *
 * const encrypted = await encryptSecretsUrls('ethereum', ['https://example.com/secret1', 'https://example.com/secret2']);
 */
const encryptSecretsUrls = async (chain, secretsUrls) => {
  // Initialize SecretsManager
  const secretsManager = await getSecretsManager(chain);

  // Encrypt secrets URL
  const encryptedURLs = await secretsManager.encryptSecretsUrls(secretsUrls);
  return encryptedURLs;
};

/**
 * Encrypts secrets and pushes them to DON gateways.
 *
 * @async
 * @function
 * @param {string} chain - The blockchain network to use.
 * @param {Object} secrets - The secrets object that needs to be encrypted and pushed.
 * @param {number} slotIdNumber - The storage slot ID where the secrets should be pushed.
 * @param {number} expirationTimeMinutes - The time in minutes until the secret expires.
 * @returns {Promise<void>} - A Promise that resolves when the secrets have been encrypted and successfully pushed.
 *
 */
const encryptSecretsAndPush = async (
  chain,
  secrets,
  slotIdNumber,
  expirationTimeMinutes
) => {
  // Initialize SecretsManager
  const secretsManager = await getSecretsManager(chain);
  const { gatewayUrls } = getNeworkConfig(chain);

  // Encrypt secrets
  const { encryptedSecrets } = await secretsManager.encryptSecrets(
    secrets
  );
  console.log("Encrypted secrets:", encryptedSecrets);
  console.log(
    `Upload encrypted secret to gateways ${gatewayUrls}. slotId ${slotIdNumber}. Expiration in minutes: ${expirationTimeMinutes}`
  );

  // Upload secrets
  const wasUploadSuccessfulForAllNodes =
    await secretsManager.uploadEncryptedSecretsToDON({
      encryptedSecretsHexstring: encryptedSecrets,
      gatewayUrls: gatewayUrls,
      slotId: parseInt(slotIdNumber),
      minutesUntilExpiration: parseInt(expirationTimeMinutes),
    });

  console.log(
    `\n✅ Secrets uploaded properly to gateways ${gatewayUrls}! Gateways response: `,
    wasUploadSuccessfulForAllNodes
  );
};

/**
 * Encrypts secrets and stores them in a GitHub Gist.
 * The Gist will be automatically deleted after 1 minute.
 *
 * @param {string} chain - The blockchain chain.
 * @param {Object} secrets - The secrets to encrypt.
 * @param {string} githubApiToken - The GitHub API token for creating and deleting the Gist.
 * @returns {Promise<void>}
 */
const encryptSecretsGist = async (chain, secrets, githubApiToken) => {
  // Initialize SecretsManager to manage the encryption of secrets
  const secretsManager = await getSecretsManager(chain);

  // Encrypt the given secrets
  const encryptedSecrets = await secretsManager.encryptSecrets(secrets);
  console.log("Encrypted secrets:", encryptedSecrets);

  // Log the initiation of Gist creation
  console.log(`Creating gist...`);

  // Create a new GitHub Gist to store the encrypted secrets
  const gistURL = await createGist(
    githubApiToken,
    JSON.stringify(encryptedSecrets)
  );

  // Log the URL of the newly created Gist and inform the user that they have 1 minute to check it
  console.log(
    `Gist ${gistURL} created. You have 1 minute to verify its creation before it gets deleted.`
  );

  // Wait for 60,000 milliseconds (1 minute) using a Promise to pause the code execution
  await new Promise((resolve) => setTimeout(resolve, 60000));

  // Log the initiation of Gist deletion
  console.log(`Deleting ${gistURL} in progress...`);

  // Delete the Gist
  const success = await deleteGist(githubApiToken, gistURL);

  // Log the successful deletion of the Gist
  console.log(`\n✅ Gist ${gistURL} successfully deleted. Status:`, success);
};

/**
 * Main function to handle errors and execute appropriate tasks based on user input.
 */

handleArguments(executeCommand).catch((e) => {
  console.error(e);
  process.exit(1);
});
