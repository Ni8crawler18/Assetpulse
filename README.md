# AssetPulse

AssetPulse is a platform that allows you to easily tokenize and fractionalize sustainable projects using Hedera Token Service (HTS). You can also connect your MetaMask wallet and predict the value of your tokens using AI.

## Features

- Tokenize and fractionalize sustainable projects
- Integration with Hedera Smart contract Service (HSS)
- MetaMask wallet connection
- AI-powered token value prediction ( Tensorflow and Keras)

## How to Use AssetPulse

### 1. Clone and Install

First, clone the repository and install the necessary dependencies:

```bash

git clone https://github.com/Ni8crawler18/AssetPulse.git
cd AssetPulse
npm install
pip install -r requirements.txt
```

### 2. Configure Your Environment

Create a `.env` file in the root directory and add your Hedera testnet account details:

```plaintext
OPERATOR_ID=your-hedera-account-id
OPERATOR_KEY=your-hedera-private-key
```

### 3. Train the AI Model

Before you start using AssetPulse, train the AI model to enable token value prediction:

```bash
python3 valuation_model.py
```

### 4. Start the Application

Now, start the server:

```bash
npm start
```

Open your browser and go to `http://localhost:3000` to use AssetPulse.

## Requirements

- Node.js
- Python 3
- MetaMask browser extension

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Hedera Hashgraph for their Token Service
- MetaMask for wallet integration

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.
