import {
    TokenUpdateTransaction,
    PrivateKey,
    Client,
    AccountId,
} from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);

if (!operatorId || !operatorKey) {
    throw new Error("Environment variables OPERATOR_ID and OPERATOR_KEY must be present");
}

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

const tokenId = operatorId; //change id

try {
    const updateTx = new TokenUpdateTransaction()
        .setTokenId(tokenId)
        .setTokenMemo("This token represents fractional ownership in a sustainable project.")
        .freezeWith(client);

    const updateTxSigned = await updateTx.sign(operatorKey);
    const updateTxResponse = await updateTxSigned.execute(client);
    const updateTxReceipt = await updateTxResponse.getReceipt(client);
    console.log(`Updated token metadata. Transaction status: ${updateTxReceipt.status.toString()}`);
} catch (error) {
    console.error("Error updating token metadata:", error);
}

client.close();

