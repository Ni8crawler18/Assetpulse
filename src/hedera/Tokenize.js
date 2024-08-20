import {
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    PrivateKey,
    Client,
    AccountId,
    Hbar
} from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

// Placeholder for MetaMask account details
let metamaskAccountId;
let metamaskPrivateKey;

async function connectMetamask() {
    if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

            // Assuming the account is on the Hedera network (Hedera-compatible private key)
            metamaskAccountId = AccountId.fromString(accounts[0]);

            // Here you would retrieve the private key associated with the MetaMask account.
            // Hedera does not natively support MetaMask keys, so this step assumes you have a way to securely obtain or use a corresponding Hedera private key.
            // You could potentially use a stored key, or another secure method.
            metamaskPrivateKey = PrivateKey.fromString(process.env.METAMASK_PVKEY); // Placeholder for actual key retrieval method

            return { accountId: metamaskAccountId, privateKey: metamaskPrivateKey };
        } catch (error) {
            console.error("Failed to connect to MetaMask:", error);
            alert("Failed to connect to MetaMask.");
        }
    } else {
        alert('MetaMask is not installed. Please install MetaMask to use this feature.');
    }
}

// Connect the MetaMask account when the "Connect Wallet" button is clicked
document.querySelector('button').addEventListener('click', async () => {
    const { accountId, privateKey } = await connectMetamask();
    if (accountId && privateKey) {
        alert(`Connected to MetaMask with account: ${accountId.toString()}`);
        document.querySelector('button').textContent = `Connected: ${accountId.toString().slice(0, 6)}...${accountId.toString().slice(-4)}`;
        document.querySelector('button').disabled = true; // Disable the button after connection
    }
});

// Handle project creation form submission
document.getElementById('projectForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Ensure MetaMask is connected
    if (!metamaskAccountId || !metamaskPrivateKey) {
        alert("Please connect your MetaMask wallet first.");
        return;
    }

    // Collect form data
    const formData = {
        name: document.getElementById('name').value,
        symbol: document.getElementById('symbol').value,
        decimals: parseInt(document.getElementById('decimals').value),
        initialSupply: parseInt(document.getElementById('initialSupply').value),
        treasuryId: AccountId.fromString(document.getElementById('treasuryId').value),
        description: document.getElementById('description').value,
    };

    try {
        // Create Hedera client using the MetaMask account
        const client = Client.forTestnet().setOperator(metamaskAccountId, metamaskPrivateKey);

        // Create the token on Hedera
        const supplyKey = PrivateKey.generateED25519();

        const tokenCreateTx = new TokenCreateTransaction()
            .setTokenName(formData.name)
            .setTokenSymbol(formData.symbol)
            .setTokenType(TokenType.FungibleCommon)
            .setDecimals(formData.decimals)
            .setInitialSupply(formData.initialSupply)
            .setTreasuryAccountId(formData.treasuryId)
            .setSupplyKey(supplyKey)
            .setSupplyType(TokenSupplyType.Infinite)
            .setMaxTransactionFee(new Hbar(20))  // Set a reasonable transaction fee
            .freezeWith(client);

        const tokenCreateTxSigned = await tokenCreateTx.sign(metamaskPrivateKey);
        const tokenCreateTxResponse = await tokenCreateTxSigned.execute(client);
        const tokenCreateTxReceipt = await tokenCreateTxResponse.getReceipt(client);
        const tokenId = tokenCreateTxReceipt.tokenId;

        console.log(`Created fungible token with ID: ${tokenId.toString()}`);

        // Display success message
        document.getElementById('result').innerHTML = `
            <h3>Project Created Successfully!</h3>
            <p>Token ID: ${tokenId.toString()}</p>
        `;

        // Show a success popup
        showPopup('Project Created Successfully!');

        client.close();
    } catch (error) {
        console.error("Error creating token:", error);
        document.getElementById('result').innerHTML = `<p>Error: ${error.message}</p>`;
        showPopup(`Error: ${error.message}`);
    }
});

