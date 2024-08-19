const express = require('express');
const dotenv = require('dotenv');
const { createToken } = require('./hedera/createToken');
const { setMetadata } = require('./hedera/setMetadata');
const { fractionalizeToken } = require('./hedera/fractionalizeToken');
const { spawn } = require('child_process');

// Load environment variables
dotenv.config();

// Initialize the express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Endpoint to handle project creation
app.post('/create-project', async (req, res) => {
    try {
        const {
            name,
            symbol,
            decimals,
            initialSupply,
            treasuryId,
            description,
            fractionalAmount
        } = req.body;

        if (!name || !symbol || decimals == null || !initialSupply || !treasuryId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Step 1: Create the token
        const tokenId = await createToken(name, symbol, decimals, initialSupply, treasuryId);

        // Step 2: Set metadata for the token
        await setMetadata(tokenId, description);

        // Step 3: Mint fractional tokens if needed
        if (fractionalAmount && fractionalAmount > 0) {
            await fractionalizeToken(tokenId, fractionalAmount);
        }

        // Step 4: Predict the token value using AI
        const features = [initialSupply, fractionalAmount, 1.0, 50.0]; // Example features
        const predictedValue = await getPrediction(features);

        res.status(200).json({ message: 'Project created successfully', tokenId, predictedValue });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Function to call Python script and get AI prediction
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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
