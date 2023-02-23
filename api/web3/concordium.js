const {
  HttpProvider,
  JsonRpcClient,
  deserializeReceiveReturnValue,
  verifyMessageSignature,
  SchemaVersion,
  CcdAmount,
  AccountTransactionType, AccountAddress, TransactionExpiry, buildBasicAccountSigner,
  signTransaction, serializeUpdateContractParameters, getAccountTransactionHash
} = require("@concordium/node-sdk");
const fs = require("fs");

// Setup environment variables
const concordiumNode = process.env.CONCORDIUM_NODE || "";
const concordiumPort = process.env.CONCORDIUM_PORT || 9095;

class Concordium {
  client = null;
  rawNFTModuleSchema = "//";
  contractName = "";
  contractIndex = 0;
  contractSubindex = 0;

  constructor() {
    this.client = new JsonRpcClient(
      new HttpProvider(concordiumNode + ":" + concordiumPort)
    );
    this.contractName = process.env.SMARTCONTRACT_NAME;
    this.contractIndex = process.env.SMARTCONTRACT_INDEX;
    this.contractSubindex = process.env.SMARTCONTRACT_SUBINDEX;
    this.rawNFTModuleSchema = process.env.SMARTCONTRACT_RAWSCHEMA;
    this.private_key = process.env.PRIVATE_KEY;
  }

  async validateAccount(message, signature, account) {
    const accountInfo = await this.client.getAccountInfo(account);

    return await verifyMessageSignature(message, signature, accountInfo);
  }

  async listNFTs(account) {
    const viewResult = await this.client.invokeContract({
      contract: {
        index: BigInt(this.contractIndex),
        subindex: BigInt(this.contractSubindex),
      },
      method: this.contractName + ".view",
    });
    const returnValue = await deserializeReceiveReturnValue(
      Buffer.from(viewResult.returnValue, "hex"),
      Buffer.from(this.rawNFTModuleSchema, "base64"),
      this.contractName,
      "view",
      SchemaVersion.V2
    );

    if (!account)
    {
      return returnValue.all_tokens;
    }

    const data = returnValue.state.filter((accountInfo) => {
      return accountInfo[0].Account[0] === account;
    });

    return data[0][1].owned_tokens;
  }
  async getNextNFT() {
    return String(Object.keys(await this.listNFTs()).length + 1).padStart(
        8,
        "0"
    );
  }
  async mintNFT(address, token) {
    const accountAddress   = new AccountAddress(address);
    const nextAccountNonce = await this.client.getNextAccountNonce(accountAddress);
    const nonce            = nextAccountNonce.nonce;
    const signer           = await buildBasicAccountSigner(this.private_key);

    const contractName        = this.contractName;
    const receiveFunctionName = "mint";
    const receiveName         = contractName + '.' + receiveFunctionName;
    const rawModuleSchema     = Buffer.from(fs.readFileSync('./schema.bin'));
    const schemaVersion       = SchemaVersion.V1;
    const parameters          = {
      owner: {Account: [address]},
      tokens: [token]
    }
    const inputParams = serializeUpdateContractParameters(
        contractName,
        receiveFunctionName,
        parameters,
        rawModuleSchema,
        schemaVersion
    );

    const header = {
      expiry: new TransactionExpiry(new Date(Date.now() + 3600000)),
      nonce: nonce,
      sender: accountAddress,
    };

    const updateContractPayload = {
        amount: new CcdAmount(BigInt(0)),
        address: {
          index: BigInt(this.contractIndex),
          subindex: BigInt(this.contractSubindex),
        },
        receiveName: receiveName,
        message: inputParams,
        maxContractExecutionEnergy:  BigInt(10000)
      };

    const accountTransaction = {
      header: header,
      payload: updateContractPayload,
      type: AccountTransactionType.Update,
    };
    const lastFinalizedBlockHash = (await this.client.getConsensusStatus()).lastFinalizedBlock;
    const accountInfo = await this.client.getAccountInfo(accountAddress, lastFinalizedBlockHash);

    const transactionSignature = await signTransaction(accountTransaction, signer);
    const success = await this.client.sendAccountTransaction(accountTransaction, transactionSignature);

    if (success) {
      return getAccountTransactionHash(accountTransaction, transactionSignature);
    }
  }
}

module.exports = Concordium;
