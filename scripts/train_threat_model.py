"""
Training script for the threat detection model
In production, this would train on real malware datasets
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
from threat_detection_model import ThreatDetectionCNN

class ThreatDataset(Dataset):
    """
    Dataset for threat samples
    In production, load from real malware databases like VirusTotal, EMBER, etc.
    """
    def __init__(self, num_samples=1000, input_size=1024):
        self.num_samples = num_samples
        self.input_size = input_size
        
        # Generate synthetic training data
        # In production, replace with real threat samples
        self.data = []
        self.labels = []
        
        for i in range(num_samples):
            # Generate synthetic features
            features = np.random.randn(input_size).astype(np.float32)
            label = i % 3  # 0: malware, 1: zero_day, 2: apt
            
            self.data.append(features)
            self.labels.append(label)
    
    def __len__(self):
        return self.num_samples
    
    def __getitem__(self, idx):
        return torch.from_numpy(self.data[idx]), self.labels[idx]

def train_model(epochs=10, batch_size=32, learning_rate=0.001):
    """
    Train the threat detection model
    """
    print("Preparing training data...")
    
    # Create datasets
    train_dataset = ThreatDataset(num_samples=1000)
    val_dataset = ThreatDataset(num_samples=200)
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    
    # Initialize model
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = ThreatDetectionCNN(input_size=1024, num_classes=3)
    model.to(device)
    
    # Loss and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    
    print(f"Training on {device}...")
    print(f"Epochs: {epochs}, Batch Size: {batch_size}, Learning Rate: {learning_rate}\n")
    
    # Training loop
    for epoch in range(epochs):
        model.train()
        train_loss = 0.0
        train_correct = 0
        train_total = 0
        
        for batch_idx, (data, labels) in enumerate(train_loader):
            data, labels = data.to(device), labels.to(device)
            
            # Forward pass
            optimizer.zero_grad()
            outputs = model(data)
            loss = criterion(outputs, labels)
            
            # Backward pass
            loss.backward()
            optimizer.step()
            
            # Statistics
            train_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            train_total += labels.size(0)
            train_correct += (predicted == labels).sum().item()
        
        # Validation
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0
        
        with torch.no_grad():
            for data, labels in val_loader:
                data, labels = data.to(device), labels.to(device)
                outputs = model(data)
                loss = criterion(outputs, labels)
                
                val_loss += loss.item()
                _, predicted = torch.max(outputs.data, 1)
                val_total += labels.size(0)
                val_correct += (predicted == labels).sum().item()
        
        # Print epoch results
        train_acc = 100 * train_correct / train_total
        val_acc = 100 * val_correct / val_total
        
        print(f"Epoch [{epoch+1}/{epochs}]")
        print(f"  Train Loss: {train_loss/len(train_loader):.4f}, Acc: {train_acc:.2f}%")
        print(f"  Val Loss: {val_loss/len(val_loader):.4f}, Acc: {val_acc:.2f}%")
    
    # Save model
    model_path = 'threat_detection_model.pth'
    torch.save(model.state_dict(), model_path)
    print(f"\nModel saved to {model_path}")
    
    return model

if __name__ == '__main__':
    print("Starting Threat Detection Model Training...\n")
    trained_model = train_model(epochs=10, batch_size=32, learning_rate=0.001)
    print("\nTraining complete!")
