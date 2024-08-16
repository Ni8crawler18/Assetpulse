import {
    TokenMintTransaction,
    PrivateKey,
    Client,
    AccountId,
    Hbar,
} from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromStringRaw(process.env.OPERATOR_KEY);

if (!operatorId || !operatorKey) {
    throw new Error("Environment variables OPERATOR_ID and OPERATOR_KEY must be present");
}

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

const tokenId = operatorId; //change id
const supplyKey = PrivateKey.generateED25519();

try {
    const mintTx = new TokenMintTransaction()
        .setTokenId(tokenId)
        .setAmount(50)
        .setMaxTransactionFee(new Hbar(20))
        .freezeWith(client);

    const mintTxSigned = await mintTx.sign(supplyKey);
    const mintTxResponse = await mintTxSigned.execute(client);
    const mintTxReceipt = await mintTxResponse.getReceipt(client);
    console.log(`Minted tokens. Transaction status: ${mintTxReceipt.status.toString()}`);
} catch (error) {
    console.error("Error minting tokens:", error);
}

client.close();

