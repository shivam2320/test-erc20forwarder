import { ethers } from "ethers";
import { Biconomy } from "@biconomy/mexa";
import fetch from "node-fetch";
import {} from "dotenv/config";

global.fetch = fetch;

const GaslessTxn = async () => {
  console.log("testing gas forwarding");
  const tokenAddress = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";
  let privateKey = process.env.PRIVATE_KEY;
  let wallet = new ethers.Wallet(privateKey);
  let address = wallet.address;
  const provider = new ethers.providers.WebSocketProvider(
    "wss://polygon-mainnet.g.alchemy.com/v2/6u1ISW4hS4x6qeadkY28j3MD8upivhg3"
  );

  const biconomy = new Biconomy(provider, {
    apiKey: process.env.API_KEY,
    debug: true,
    contractAddresses: [tokenAddress], // list of contract address you want to enable gasless on
  });
  // console.log("bico setup: ", biconomy.erc20ForwarderClient);
  biconomy
    .onEvent(biconomy.READY, async () => {
      ercForwarderClient = biconomy.erc20ForwarderClient;
      permitClient = biconomy.permitClient;

      let ethersProvider = new ethers.providers.Web3Provider(biconomy);

      //   const contractInstance = new ethers.Contract(
      //     contractAddress,
      //     abi,
      //     biconomy.getSignerByAddress(address)
      //   );

      let contractInterface = new ethers.utils.Interface(abi);

      const daiPermitOptions = {
        expiry: Math.floor(Date.now() / 1000 + 3600),
        allowed: true,
      };

      // any accepted ERC20 token can be used
      // you can use PermitClient like below for popular tokens like DAI and USDC

      //getting permit
      console.log("getting user's permit to spend tokens");
      await permitClient.daiPermit(daiPermitOptions);

      // Create your target method signature.. here we are calling addRating() method of our contract
      let functionSignature = contractInterface.encodeFunctionData("transfer", [
        "0x8E9e20b90efa7d0A072bfc8b0C74D96104F1F6FE",
        ethers.utils.parseEther("5"),
      ]);
      let gasPrice = await ethersProvider.getGasPrice();
      let gasLimit = await ethersProvider.estimateGas({
        to: config.contract.address,
        from: userAddress,
        data: data,
      });
      console.log(gasLimit.toString());

      let rawTx, signedTx;

      rawTx = {
        to: config.contract.address,
        data: functionSignature,
        from: address,
        value: "0x0",
        //gasLimit: web3.utils.toHex(gasLimit),
      };

      signedTx = await wallet.signTransaction(rawTx);

      // should get user message to sign for EIP712 or personal signature types
      const forwardRequestData =
        await biconomy.getForwardRequestAndMessageToSign(signedTx);
      //   console.log(forwardRequestData);
      const signParams = forwardRequestData.eip712Format;
      // returned data has personal signature format available as well
      // data.personalSignatureFormat

      // forward request that was created to prepare the data to sign
      // you must pass the same request otherwise it would result in signature mistach
      const request = forwardRequestData.request;

      const cost = forwardRequestData.cost;
      console.log(cost);
      //show the fees in number of ERC20 tokens to be spent

      //https://github.com/ethers-io/ethers.js/issues/687
      /** ethers automatically appends EIP712 domain type.
       *  only need to remove for EIP712 format
       * personal format is available as well by dataToSign.personalSignatureFormat
       */
      delete signParams.types.EIP712Domain;
      //   console.log(signParams);
      const signature = await wallet._signTypedData(
        signParams.domain,
        signParams.types,
        signParams.message
      );

      let data = {
        signature: signature,
        forwardRequest: request,
        rawTransaction: signedTx,
        signatureType: biconomy.EIP712_SIGN,
      };

      try {
        let tx = await ethersProvider.send("eth_sendRawTransaction", [data]);

        console.log(tx);
      } catch (error) {
        if (error.returnedHash && error.expectedHash) {
          console.log("Transaction hash : ", error.returnedHash);
          transactionHash = error.returnedHash;
        } else {
          console.log(error);
        }
      }

      if (transactionHash) {
        let receipt = await ethersProvider.waitForTransaction(transactionHash);
      } else {
      }
    })
    .onEvent(biconomy.ERROR, (error, message) => {
      //   console.log(message);
      console.log(error);
    });
};

GaslessTxn();
