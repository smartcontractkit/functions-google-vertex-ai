# Creating Generative Art Dynamic NFTs with Google Cloud Vertex AI and Chainlink Functions

> :warning: **Disclaimer**: For Chainlink Functions demo purposes only. Do not use in production! This repo contains the Chainlink portion of a Google Codelab.

## Task 9. Install the required frameworks and dependencies

1. In a VS code terminal, clone this repo and change directories.
<!---->
    git clone https://github.com/smartcontractkit/functions-google-vertex-ai.git && \cd functions-google-vertex-ai/

3. [Install Node.js 18](https://nodejs.org/en/download/) . Optionally, you can use the [nvm package](https://www.npmjs.com/package/nvm) to switch between Node.js versions with \`nvm use 18\`.

\*\*Note\*\*: To ensure you are running the correct version in a terminal, run:

    node -v

3. Install DENO

<!---->

    curl -fsSL https://deno.land/x/install/install.sh | sh

<!---->

    export PATH="$HOME/.deno/bin:$PATH"

Now check your version to confirm the install:

    deno --version

Optional: If you encounter problems, you may need to run:

    source ~/.bashrc  # or ~/.zshrc, or the appropriate configuration file

4. Run \`npm install\` to install the dependencies.

<!---->

    npm install

5. For higher security, the starter kit encrypts your environment variables at rest. Note:

Set an encryption password for your environment variables.

    npx env-enc set-pw

5\. To configure your environment variables that you need to send your requests to the Polygon Mumbai network, run:

    npx env-enc set 

You will  be asked for a variable name, enter:

    POLYGON_MUMBAI_RPC_URL

Set a URL for the Polygon Mumbai testnet, You can sign up for a personal endpoint from [Alchemy](https://www.alchemy.com/), [Infura](https://www.infura.io/), or another node provider service. Enter:

    <RPC_URL>

You will then be asked if you want to add another variable name, enter:

    PRIVATE_KEY

Find the private key for your testnet wallet. If you use MetaMask, follow the instructions to [Export a Private Key](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key). Then enter:

    <YOUR_PRIVATE_KEY>

**Note:** The Chainlink Functions hardhat starter kit uses your private key to sign any transactions you make such as deploying your consumer contract, creating subscriptions, and making requests.

**Note:**  If you get into env-enc package issues you can fallback to dotenv, below are the steps to use dotenv instead of env-enx\
Create a `.env` file that contains the 2 environment variables private key and mumbai RPC URL:

    npm install dotenv --save

When complete, replace **require("@chainlink/env-enc").config();** with the blow line in  these JS files request.js, secrets.js and env.js:

    require('dotenv').config()

## Task 10. Configure your on-chain resources

After you configure your local environment, configure some on-chain resources to process your requests using Chainlink Functions.

1.  Open the [Functions Consumer NFT contract](https://remix.ethereum.org/#url=https://gist.githubusercontent.com/cl-adamn/1079e4d7742ee26c1baf5ed8ba0ad15f/raw/4af2aad19794b97bfcbd8423eb2c8603636515a9/FunctionsConsumerNFT.sol) in Remix.

2.  Compile the contract by clicking the **"Compile"** button in the **Solidity Compiler** tab.

3.  Open MetaMask and select the Polygon Mumbai network.

4.  In Remix under the **Deploy & Run Transactions** tab, select “**Injected**

**Provider - MetaMask”**  in the **Environment** list. Remix will use the MetaMask wallet to communicate with Polygon Mumbai testnet.

5.  Under the **Deploy** section, fill in the `router` address. For Polygon Mumbai, the router address is:

    0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C

6.  Under the **Deploy** section, put in your GCP Bucket URL for base URL. For example:

    https://storage.cloud.google.com/<YOUR_BUCKET_NAME>/

7.  Click the **Deploy** button to deploy the contract. MetaMask prompts you to confirm the transaction. Check the transaction details to make sure you are deploying the contract to Polygon Mumbai.

## Task 11. Mint your NFT

1.  Expand the contract you just deployed under **Deployed Contracts**

2.  Paste your wallet address into the `safeMint` field and hit the labeled orange button to call the function.

3.  MetaMask prompts you to confirm the transaction.

4.  After you confirm the transaction, get your contract address that appears in the **Deployed Contracts** list. Copy the contract address for the next steps.

## Task 12. Chainlink Functions: Create a subscription

1\. Follow the [Managing Functions Subscriptions](https://docs.chain.link/chainlink-functions/resources/subscriptions#create-a-subscription) guide to accept the Chainlink Functions Terms of Service (ToS), create a subscription, fund it, then add your consumer contract address to it.

2\. You can find the Chainlink Functions UI at <https://functions.chain.link/>

## Task 13. Chainlink Functions: Generate NFT Metadata 

1.  Open the file `request.js`, which is located in the `/examples/POST-data/request.js` folder.

2.  Replace the consumer contract address and the subscription ID with your own values.

    const consumerAddress = "0x8dFf78B7EE3128D00E90611FBeD20A71397064D9"

     // REPLACE this with your Functions consumer address


    const subscriptionId = 3
     // REPLACE this with your subscription ID and save the file.

3.  Open the file `source.js`, which is located in the `/examples/POST-data/source.js` folder.

    const seed = 999999;

     // REPLACE this with a number between 100000 - 999999 of your choosing. This is our seed for the GCP Vertex AI.

    const url = "<GCP-FUNCTION-URL>";

     // REPLACE this with your API endpoint from Task 8, Step 7 above and save the file.

4\. Make a request:

     node ./examples/POST-data/request.js

The script runs your function in a sandbox environment before making an on-chain transaction:

    Start simulation...

    Simulation result {

      capturedTerminalOutput: 'start 1695313922102\nend 1695313924114\ntime 2013\n',

      responseBytesHexstring: '0x636f6d706c657465'

    }

    ✅ Decoded response to string:  complete

    Estimate request costs...

    Fulfillment cost estimated to 0.20069639093792 LINK

    Make request...

    ✅ Functions request sent! Transaction hash 0xc55c4f1f51e053d108bff10064a2323e854d17b1dc381782b83bf4b874430360 -  Request id is 0x3350816bd81c10b78eeb76f311925022ce0f003eaab1341c6aec993ca389f666. Waiting for a response...

    See your request in the explorer https://mumbai.polygonscan.com/tx/0xc55c4f1f51e053d108bff10064a2323e854d17b1dc381782b83bf4b874430360

    ✅ Request 0x3350816bd81c10b78eeb76f311925022ce0f003eaab1341c6aec993ca389f666 fulfilled with code: 0. Cost is 0.200034634436717068 LINK.Complete response:  {

      requestId: '0x3350816bd81c10b78eeb76f311925022ce0f003eaab1341c6aec993ca389f666',

      subscriptionId: 14,

      totalCostInJuels: 200034634436717068n,

      responseBytesHexstring: '0x636f6d706c657465',

      errorString: '',

      returnDataBytesHexstring: '0x',

      fulfillmentCode: 0

    }

    ✅ Decoded response to string:  complete

5\. You can now navigate to your tokenUrl below:

tokenUrl:  **https\://storage.cloud.google.com/\<YOUR_BUCKET_NAME>/0.json**

6\. At the end of this JSON metadata will be your NFT:

image: **https\://storage.cloud.google.com/\<YOUR_BUCKET_NAME>/0_img.png**

- Open this URL to see your NFT!

## Task 14. Chainlink Functions: Update NFT Metadata

1\. Open the file `source.js`, which is located in the `/examples/POST-data/source.js` folder.

    const seed = <NEW-SEED>;

    // REPLACE this with a different number between 100000 - 999999 of your choosing. 

    const isUpdate = false;

    // REPLACE this with true. This specifies we are updating the metadata, not updating existing metadata.

2\. Make a request:

    node ./examples/POST-data/request.js

_\[Similar output as above]_

3\. You can now navigate to your token metadata below:

Token metadata: **https\://storage.cloud.google.com/\<YOUR_BUCKET_NAME>/0.json**

4\. At the end of this JSON metadata will be your updated NFT:

image: **https\://storage.cloud.google.com/\<YOUR_BUCKET_NAME>/0_img.png**

- Open this URL to see your NFT updated with a new seed!

## Disclaimer
This tutorial offers educational examples of how to use a Chainlink system, product, or service and is provided to demonstrate how to interact with Chainlink’s systems, products, and services to integrate them into your own. This template is provided “AS IS” and “AS AVAILABLE” without warranties of any kind, it has not been audited, and it may be missing key checks or error handling to make the usage of the system, product, or service more clear. Do not use the code in this example in a production environment without completing your own audits and application of best practices. Neither Chainlink Labs, the Chainlink Foundation, nor Chainlink node operators are responsible for unintended outputs that are generated due to errors in code
