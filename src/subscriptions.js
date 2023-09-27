const { SubscriptionManager } = require("@chainlink/functions-toolkit");
const {
  getEthersSigner,
  validateArgumentCount,
  handleArguments,
} = require("./helper");
const { getNeworkConfig } = require("./config");

/**
 * Execute a command based on the user's input arguments.
 *
 * @param {string} command - The command to execute.
 * @param {Array<string>} args - The command line arguments.
 */
const executeCommand = async (command, args) => {
  switch (command) {
    case "read":
      // read subscription: node src/subscriptions.js read <chain> <subscriptionId>
      // example: node src/subscriptions.js read polygonMumbai 1
      validateArgumentCount(5, args.length);
      await getSubscription(args[3] /* chain */, args[4] /* subscriptionId */);
      break;

    case "create":
      // create subscription: node src/subscriptions.js create <chain> <consumerAddress(optional)>
      // example: node src/subscriptions.js create polygonMumbai 0x4B4BA2Fd6b93aDF8d6b6002E10540E58394388Ea
      validateArgumentCount(4, args.length);
      await createSubscription(
        args[3] /* chain */,
        args[4] /* consumerAddress */
      );
      break;
    case "cancel":
      // read subscription: node src/subscriptions.js cancel <chain> <subscriptionId> <refundAddress(optional)>
      // example: node src/subscriptions.js cancel polygonMumbai 1
      validateArgumentCount(5, args.length);
      await cancelSubscription(
        args[3] /* chain */,
        args[4] /* subscriptionId */,
        args[5] /* refundAddress */
      );
      break;

    case "fund":
      // fund subscription: node src/subscriptions.js fund <chain> <subscriptionId> <juelsAmount>
      // example: node src/subscriptions.js fund polygonMumbai 37 1000000000000000000
      validateArgumentCount(6, args.length);
      await fundSubscription(
        args[3] /* chain */,
        args[4] /* subscriptionId */,
        args[5] /* juelsAmount */
      );
      break;
    case "add-consumer":
      // fund subscription: node src/subscriptions.js add-consumer <chain> <subscriptionId> <consumerAddress>
      // example: node src/subscriptions.js add-consumer polygonMumbai 37 0x4B4BA2Fd6b93aDF8d6b6002E10540E58394388Ea
      validateArgumentCount(6, args.length);
      await addConsumer(
        args[3] /* chain */,
        args[4] /* subscriptionId */,
        args[5] /* consumerAddress */
      );
      break;
    case "remove-consumer":
      // fund subscription: node src/subscriptions.js remove-consumer <chain> <subscriptionId> <consumerAddress>
      // example: node src/subscriptions.js remove-consumer polygonMumbai 37 0x4B4BA2Fd6b93aDF8d6b6002E10540E58394388Ea
      validateArgumentCount(6, args.length);
      await removeConsumer(
        args[3] /* chain */,
        args[4] /* subscriptionId */,
        args[5] /* consumerAddress */
      );
      break;

    default:
      throw new Error(`Unknown command ${command}`);
  }
};

/**
 * Initialize and return a SubscriptionManager instance.
 *
 * @param {string} chain - The blockchain network to use.
 * @returns {Promise<SubscriptionManager>}  Initialized SubscriptionManager instance.
 */
const getSubscriptionManager = async (chain) => {
  // Initialize signer and get contract addresses
  const signer = getEthersSigner(chain);
  const { router, link } = getNeworkConfig(chain);

  // Initialize and return SubscriptionManager
  const subscriptionManager = new SubscriptionManager({
    signer,
    linkTokenAddress: link,
    functionsRouterAddress: router,
  });
  await subscriptionManager.initialize();
  return subscriptionManager;
};

/**
 * Fetch and log subscription information.
 *
 * @param {string} chain - The blockchain network to use.
 * @param {number} subscriptionId - The ID of the subscription to fetch.
 */
const getSubscription = async (chain, subscriptionId) => {
  // Initialize SubscriptionManager
  const subscriptionManager = await getSubscriptionManager(chain);

  // Fetch and log subscription information
  const subscriptionInfo = await subscriptionManager.getSubscriptionInfo(
    subscriptionId
  );
  console.log("Subscription created: ", subscriptionId);
  console.log("Subscription details:", subscriptionInfo);
};

/**
 * Create a new subscription.
 *
 * @param {string} chain - The blockchain network to use.
 * @param {string} [consumerAddress] - Optional address of the consumer.
 */
const createSubscription = async (chain, consumerAddress) => {
  const subscriptionManager = await getSubscriptionManager(chain);

  // Check if a consumer address is provided, and create subscription accordingly
  let subscriptionId;
  if (consumerAddress === undefined) {
    subscriptionId = await subscriptionManager.createSubscription();
  } else {
    subscriptionId = await subscriptionManager.createSubscription({
      consumerAddress,
    });
  }

  await getSubscription(chain, subscriptionId);
};

/**
 * Cancel an existing subscription.
 *
 * @param {string} chain - The blockchain network to use.
 * @param {number} subscriptionId - The ID of the subscription to cancel.
 * @param {string} [refundAddress] - Optional address for refunds.
 */
const cancelSubscription = async (chain, subscriptionId, refundAddress) => {
  const subscriptionManager = await getSubscriptionManager(chain);

  // Check if a refund address is provided, and cancel subscription accordingly
  if (refundAddress === undefined) {
    await subscriptionManager.cancelSubscription({ subscriptionId: subscriptionId });
  } else {
    await subscriptionManager.cancelSubscription({
      subscriptionId: subscriptionId,
      refundAddress,
    });
  }

  console.log(`Subscription ${subscriptionId} deleted.`);
};

/**
 * Fund an existing subscription.
 *
 * @param {string} chain - The blockchain network to use.
 * @param {number} subscriptionId - The ID of the subscription to fund.
 * @param {string} juelsAmount - The amount of LINK tokens to fund (Juels).
 */
const fundSubscription = async (chain, subscriptionId, juelsAmount) => {
  const subscriptionManager = await getSubscriptionManager(chain);

  await subscriptionManager.fundSubscription({
    subscriptionId: subscriptionId,
    juelsAmount: juelsAmount,
  });

  console.log(`Subscription ${subscriptionId} funded with ${juelsAmount} Juels`);
  await getSubscription(chain, subscriptionId);
};

/**
 * Add a consumer to an existing subscription.
 *
 * @param {string} chain - The blockchain network to use.
 * @param {number} subscriptionId - The ID of the subscription.
 * @param {string} consumerAddress - The address of the consumer to add.
 */
const addConsumer = async (chain, subscriptionId, consumerAddress) => {
  const subscriptionManager = await getSubscriptionManager(chain);

  await subscriptionManager.addConsumer({
    subscriptionId: subscriptionId,
    consumerAddress,
  });

  console.log(
    `Consumer ${consumerAddress} added to subscription ${subscriptionId}`
  );
  await getSubscription(chain, subscriptionId);
};

/**
 * Remove a consumer from an existing subscription.
 *
 * @param {string} chain - The blockchain network to use.
 * @param {number} subscriptionId - The ID of the subscription.
 * @param {string} consumerAddress - The address of the consumer to remove.
 */
const removeConsumer = async (chain, subscriptionId, consumerAddress) => {
  const subscriptionManager = await getSubscriptionManager(chain);

  await subscriptionManager.removeConsumer({
    subscriptionId: subscriptionId,
    consumerAddress,
  });

  console.log(
    `Consumer ${consumerAddress} removed from subscription ${subscriptionId}`
  );
  await getSubscription(chain, subscriptionId);
};

/**
 * Main function to handle errors and execute appropriate tasks based on user input.
 */

handleArguments(executeCommand).catch((e) => {
  console.error(e);
  process.exit(1);
});
