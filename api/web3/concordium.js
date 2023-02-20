const {
  HttpProvider,
  JsonRpcClient,
  deserializeReceiveReturnValue,
  verifyMessageSignature,
  SchemaVersion,
  CcdAmount,
  AccountTransactionType, AccountAddress, TransactionExpiry, ModuleReference
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
    this.address = process.env.WALLET_ADDRESS;
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
  async mintNFT(token) {
    const accountAddress = new AccountAddress(this.address);
    const nextAccountNonce = await this.client.getNextAccountNonce(accountAddress);
    const nonce = nextAccountNonce.nonce;

    const header = {
      expiry: new TransactionExpiry(new Date(Date.now() + 3600000)),
      nonce: nonce,              // the next nonce for this account, can be found using getNextAccountNonce
      sender: accountAddress,
    };

    const simpleTransfer = {
      amount: new CcdAmount(BigInt(100)),
      toAddress: new AccountAddress("43TUDbrk8JioxPKqzsYvUy62qD5cqVMJnyvTAQsEWq4DEJHuDo"),
    };
    const accountTransaction = {
      header: header,
      payload: simpleTransfer,
      type: AccountTransactionType.Transfer,
    };
    const success = await this.client.sendAccountTransaction(accountTransaction, 'eyIwIjp7IjAiOiIyY2Q1NmFlMzg5ZDFmMTYzM2I4NzQ1MDZlZTMwOTlkNWQxYTFhYjM3MzlkMDA4ZTdhNGE2MTI2NDgwNDU5YzllNTVlNzc1ZDVkNGFmYmQzM2FhNmE3YzM0YmFmOGFhNGE0NGVkMGRjZjg1ZGI0OGE4ZDdlN2NhNmYwMDQxZjEwYSJ9fQ==');
    if (success) {
     console.log('xxxx'); debugger; return;
    } else {
     console.log('asdasd'); debugger; return;
    }
  }
}

module.exports = Concordium;
