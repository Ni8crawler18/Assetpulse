const express = require('express');
const dotenv = require('dotenv');
const { TokenCreateTransaction, TokenAssociateTransaction, TransferTransaction, Client, PrivateKey, AccountId } = require('@hashgraph/sdk');
const { spawn } = require('child_process');

// Load environment variables
dotenv.config();

// Initialize the express app (only declare 'app' once)
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Initialize Hedera client for the testnet (only declare 'operatorId' and 'operatorKey' once)
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

// Endpoint to handle project creation
app.post('/create-project', async (req, res) => {
    try {
        const { name, symbol, decimals, initialSupply, treasuryId, description } = req.body;

        if (!name || !symbol || decimals == null || !initialSupply || !treasuryId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Step 1: Create the token
        const supplyKey = PrivateKey.generateED25519();
        const tokenCreateTx = new TokenCreateTransaction()
            .setTokenName(name)
            .setTokenSymbol(symbol)
            .setDecimals(decimals)
            .setInitialSupply(initialSupply)
            .setTreasuryAccountId(AccountId.fromString(treasuryId))
            .setSupplyKey(supplyKey)
            .freezeWith(client);

        const tokenCreateTxSigned = await tokenCreateTx.sign(operatorKey);
        const tokenCreateTxResponse = await tokenCreateTxSigned.execute(client);
        const tokenCreateTxReceipt = await tokenCreateTxResponse.getReceipt(client);
        const tokenId = tokenCreateTxReceipt.tokenId;

        // Step 2: Predict the token value using AI
        const features = [initialSupply, decimals, 1.0, 50.0]; // Example features
        const predictedValue = await getPrediction(features);

        // Respond with the token ID and predicted value
        res.status(200).json({ message: 'Project created successfully', tokenId: tokenId.toString(), predictedValue });

    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to handle token purchases
app.post('/buy-token', async (req, res) => {
    try {
        const { tokenName, amount, buyerAccountId } = req.body;

        if (!tokenName || !amount || !buyerAccountId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Step 1: Retrieve the token ID by name (assuming you have a mapping)
        // In a real application, this should be implemented based on your token tracking logic
        const tokenId = await getTokenIdByName(tokenName);  // Placeholder function

        if (!tokenId) {
            return res.status(404).json({ error: "Token not found" });
        }

        // Step 2: Associate the buyer's account with the token
        const associateTx = new TokenAssociateTransaction()
            .setAccountId(AccountId.fromString(buyerAccountId))
            .setTokenIds([tokenId])
            .freezeWith(client);

        const associateTxSigned = await associateTx.sign(PrivateKey.fromString(process.env.METAMASK_PVKEY));  // MetaMask key
        await associateTxSigned.execute(client);

        // Step 3: Transfer the tokens
        const transferTx = new TransferTransaction()
            .addTokenTransfer(tokenId, operatorId, -amount)  // Deduct from treasury (operator account)
            .addTokenTransfer(tokenId, AccountId.fromString(buyerAccountId), amount)  // Credit to buyer
            .freezeWith(client);

        const transferTxSigned = await transferTx.sign(operatorKey);
        const transferTxResponse = await transferTxSigned.execute(client);
        const transferTxReceipt = await transferTxResponse.getReceipt(client);

        res.status(200).json({ message: 'Token purchase successful', transactionId: transferTxReceipt.transactionId.toString() });

    } catch (error) {
        console.error("Error processing token purchase:", error);
        res.status(500).json({ error: error.message });
    }
});

// Function to get AI prediction
function getPrediction(features) {
    return new Promise((resolve, reject) => {
        const process = spawn('python3', ['valuation_model.py', ...features]);

        process.stdout.on('data', (data) => {
            resolve(data.toString().trim());
        });

        process.stderr.on('data', (data) => {
            reject(data.toString());
        });
    });
}

// Placeholder function to get token ID by token name
async function getTokenIdByName(tokenName) {
    // This is a placeholder. Implement your logic to retrieve token ID based on token name.
    throw new Error("getTokenIdByName function not implemented.");
}

// Start the server (only declare 'PORT' once)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
