// Function to display a popup message
function showPopup(message) {
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.textContent = message;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 5000);  // Remove the popup after 5 seconds
}

// Handle project creation form submission
document.getElementById('projectForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Collect form data
    const formData = {
        name: document.getElementById('name').value,
        symbol: document.getElementById('symbol').value,
        decimals: document.getElementById('decimals').value,
        initialSupply: document.getElementById('initialSupply').value,
        treasuryId: document.getElementById('treasuryId').value,
        description: document.getElementById('description').value,
        fractionalAmount: document.getElementById('fractionalAmount').value
    };

    try {
        // Send the data to the backend
        const response = await fetch('/create-project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        // Display the result in the UI and show popup
        if (response.ok) {
            document.getElementById('result').innerHTML = `
                <h3>Project Created Successfully!</h3>
                <p>Token ID: ${result.tokenId}</p>
                <p>Predicted Value: ${result.predictedValue}</p>
            `;
            showPopup('Project Created Successfully!');
        } else {
            document.getElementById('result').innerHTML = `<p>Error: ${result.error}</p>`;
            showPopup(`Error: ${result.error}`);
        }
    } catch (error) {
        document.getElementById('result').innerHTML = `<p>Error: ${error.message}</p>`;
        showPopup(`Error: ${error.message}`);
    }
});

// Handle token purchase form submission
document.getElementById('buyForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Collect form data
    const formData = {
        tokenName: document.getElementById('tokenName').value,
        amount: document.getElementById('amount').value,
        buyerAccountId: document.getElementById('buyerAccountId').value
    };

    try {
        // Send the data to the backend
        const response = await fetch('/buy-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        // Display the result in the UI
        if (response.ok) {
            document.getElementById('result').innerHTML = `
                <h3>Token Purchase Successful!</h3>
                <p>Transaction ID: ${result.transactionId}</p>
            `;
        } else {
            document.getElementById('result').innerHTML = `<p>Error: ${result.error}</p>`;
        }

        // Show popup after 45 seconds indicating the token has been bought
        setTimeout(() => {
            if (response.ok) {
                showPopup('Token Purchase Successful!');
            } else {
                showPopup(`Error: ${result.error}`);
            }
        }, 45000);  // 45 seconds delay
    } catch (error) {
        document.getElementById('result').innerHTML = `<p>Error: ${error.message}</p>`;
        showPopup(`Error: ${error.message}`);
    }
});

// Handle "Connect Wallet" button
document.querySelector('button').addEventListener('click', async () => {
    if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

            // The user has connected their MetaMask wallet
            const account = accounts[0];
            alert(`Connected to MetaMask with account: ${account}`);

            // Update the button text to show the connected account
            document.querySelector('button').textContent = `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`;
            document.querySelector('button').disabled = true; // Disable the button after connection
        } catch (error) {
            // The user rejected the connection request or there was an error
            console.error("User rejected the connection or there was an error:", error);
            alert("Failed to connect to MetaMask.");
        }
    } else {
        // MetaMask is not installed or another wallet is being used
        alert('MetaMask is not installed. Please install MetaMask to use this feature.');
    }
});


