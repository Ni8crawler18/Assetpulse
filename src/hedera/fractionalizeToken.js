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

    const fractionalizeTx = new TokenMintTransaction()
        .setTokenId(tokenId) 
        .setAmount(100) 
        .setMaxTransactionFee(new Hbar(20))
        .freezeWith(client);

    const fractionalizeTxSigned = await fractionalizeTx.sign(supplyKey);
    const fractionalizeTxResponse = await fractionalizeTxSigned.execute(client);

    const fractionalizeTxReceipt = await fractionalizeTxResponse.getReceipt(client);

    console.log(`Fractionalized token. Transaction status: ${fractionalizeTxReceipt.status.toString()}`);
} catch (error) {
    console.error("Error fractionalizing tokens:", error);
}

client.close();
