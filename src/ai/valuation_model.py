import numpy as np
import pandas as pd
from tensorflow import keras
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import sys
import tensorflow as tf
layers = tf.keras.layers

# Load and preprocess the dataset (this is just a mock example)
def load_data():
    data = pd.DataFrame({
        'initial_supply': np.random.randint(1000, 10000, 1000),
        'minted_tokens': np.random.randint(100, 5000, 1000),
        'market_trend': np.random.uniform(0.5, 1.5, 1000),
        'previous_value': np.random.uniform(10, 500, 1000),
        'token_value': np.random.uniform(1, 100, 1000)
    })
    return data

def preprocess_data(data):
    X = data[['initial_supply', 'minted_tokens', 'market_trend', 'previous_value']].values
    y = data['token_value'].values
    
    # Standardize the data
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
    
    return X_train, X_test, y_train, y_test, scaler

# Define the model
def build_model(input_shape):
    model = keras.Sequential([
        layers.Dense(64, activation='relu', input_shape=input_shape),
        layers.Dense(32, activation='relu'),
        layers.Dense(1)  # Output layer for regression
    ])
    
    model.compile(optimizer='adam', loss='mean_squared_error', metrics=['mae'])
    return model

# Train the model and save it
def train_model():
    data = load_data()
    X_train, X_test, y_train, y_test, scaler = preprocess_data(data)
    
    model = build_model((X_train.shape[1],))
    
    model.fit(X_train, y_train, epochs=50, batch_size=32, validation_split=0.2, verbose=2)
    
    # Save the model and the scaler
    model.save('valuation_model.h5')
    np.save('scaler_mean.npy', scaler.mean_)
    np.save('scaler_scale.npy', scaler.scale_)
    
    return model, scaler

# Predict token value using the trained model
def predict_token_value(features):
    model = keras.models.load_model('valuation_model.h5')
    scaler = StandardScaler()
    scaler.mean_ = np.load('scaler_mean.npy')
    scaler.scale_ = np.load('scaler_scale.npy')

    # Preprocess the input
    features_scaled = scaler.transform([features])
    
    # Predict the token value
    predicted_value = model.predict(features_scaled)
    
    return predicted_value[0][0]

if __name__ == "__main__":
    # If run with arguments, predict the token value
    if len(sys.argv) > 1:
        features = [float(x) for x in sys.argv[1:]]
        prediction = predict_token_value(features)
        print(prediction)
    else:
        # Train the model if no arguments are provided
        train_model()
