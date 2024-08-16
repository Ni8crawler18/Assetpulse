import {
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    PrivateKey,
    Client,
    AccountId,
} from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromStringRaw(process.env.OPERATOR_PVKEY);

if (!operatorId || !operatorKey) {
    throw new Error("Environment variables OPERATOR_ID and OPERATOR_KEY must be present");
}

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

const supplyKey = PrivateKey.generateED25519();

try {
    const tokenCreateTx = new TokenCreateTransaction()
        .setTokenName("Hedera Green Tokens")
        .setTokenSymbol("HGT")
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(2)
        .setInitialSupply(10)
        .setSupplyType(TokenSupplyType.Infinite)
        .setTreasuryAccountId(operatorId)
        .setSupplyKey(supplyKey)
        .freezeWith(client);

    const tokenCreateTxSigned = await tokenCreateTx.sign(operatorKey);
    const tokenCreateTxResponse = await tokenCreateTxSigned.execute(client);
    const tokenCreateTxReceipt = await tokenCreateTxResponse.getReceipt(client);
    const tokenId = tokenCreateTxReceipt.tokenId;
    console.log(`Created fungible token with ID: ${tokenId.toString()}`);
} catch (error) {
    console.error("Error creating token:", error);
}

client.close();

