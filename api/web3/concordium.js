const {
  HttpProvider,
  JsonRpcClient,
  deserializeReceiveReturnValue,
  verifyMessageSignature,
  SchemaVersion,
  CcdAmount,
  AccountTransactionType
} = require("@concordium/node-sdk");

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
    return await this.client.sendTransaction(
        address,
        AccountTransactionType.Update,
        {
          amount: new CcdAmount(BigInt(0)),
          contractAddress: {
            index: BigInt(this.contractIndex),
            subindex: BigInt(this.contractSubindex),
          },
          receiveName: this.contractName + ".mint",
          maxContractExecutionEnergy: BigInt(10000),
        },
        {
          owner: {
            Account: [address],
          },
          tokens: [token],
        },
        this.rawNFTModuleSchema
    );
  }
}

module.exports = Concordium;
