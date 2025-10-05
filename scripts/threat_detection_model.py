"""
PyTorch-based Threat Detection Model
Classifies threats into: malware, zero_day, apt (Advanced Persistent Threat)
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import json
from datetime import datetime

class ThreatDetectionCNN(nn.Module):
    """
    Convolutional Neural Network for threat detection
    Analyzes binary file patterns and network traffic features
    """
    def __init__(self, input_size=1024, num_classes=3):
        super(ThreatDetectionCNN, self).__init__()
        
        # Convolutional layers for pattern recognition
        self.conv1 = nn.Conv1d(1, 64, kernel_size=5, padding=2)
        self.bn1 = nn.BatchNorm1d(64)
        self.conv2 = nn.Conv1d(64, 128, kernel_size=5, padding=2)
        self.bn2 = nn.BatchNorm1d(128)
        self.conv3 = nn.Conv1d(128, 256, kernel_size=3, padding=1)
        self.bn3 = nn.BatchNorm1d(256)
        
        # Pooling and dropout
        self.pool = nn.MaxPool1d(2)
        self.dropout = nn.Dropout(0.5)
        
        # Calculate flattened size after convolutions
        self.flat_size = 256 * (input_size // 8)
        
        # Fully connected layers
        self.fc1 = nn.Linear(self.flat_size, 512)
        self.fc2 = nn.Linear(512, 128)
        self.fc3 = nn.Linear(128, num_classes)
        
    def forward(self, x):
        # Add channel dimension if needed
        if len(x.shape) == 2:
            x = x.unsqueeze(1)
        
        # Convolutional blocks
        x = self.pool(F.relu(self.bn1(self.conv1(x))))
        x = self.pool(F.relu(self.bn2(self.conv2(x))))
        x = self.pool(F.relu(self.bn3(self.conv3(x))))
        
        # Flatten
        x = x.view(x.size(0), -1)
        
        # Fully connected layers
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = F.relu(self.fc2(x))
        x = self.dropout(x)
        x = self.fc3(x)
        
        return x

class ThreatDetector:
    """
    Main threat detection class that handles model inference
    """
    def __init__(self, model_path=None):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = ThreatDetectionCNN(input_size=1024, num_classes=3)
        
        # Load pre-trained weights if available
        if model_path:
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        else:
            # Initialize with random weights for demo
            print("[v0] No pre-trained model found. Using randomly initialized weights.")
        
        self.model.to(self.device)
        self.model.eval()
        
        self.class_names = ['malware', 'zero_day', 'apt']
        self.severity_thresholds = {
            'critical': 0.95,
            'high': 0.85,
            'medium': 0.70,
            'low': 0.50
        }
    
    def extract_features(self, file_data):
        """
        Extract features from file data or network traffic
        In production, this would analyze actual binary patterns, PE headers, etc.
        """
        # Simulate feature extraction from file bytes
        if isinstance(file_data, bytes):
            # Convert bytes to numerical features
            features = np.frombuffer(file_data[:1024], dtype=np.uint8)
            if len(features) < 1024:
                features = np.pad(features, (0, 1024 - len(features)), 'constant')
        else:
            # Generate synthetic features for demo
            features = np.random.randn(1024)
        
        # Normalize features
        features = (features - features.mean()) / (features.std() + 1e-8)
        return features.astype(np.float32)
    
    def calculate_severity(self, confidence, threat_type):
        """
        Calculate threat severity based on confidence and type
        """
        # APTs are generally more severe
        if threat_type == 'apt' and confidence > 0.7:
            return 'critical'
        
        for severity, threshold in self.severity_thresholds.items():
            if confidence >= threshold:
                return severity
        
        return 'low'
    
    def detect(self, file_data, file_name=None, source_ip=None):
        """
        Detect threats in the provided data
        Returns threat classification with confidence scores
        """
        start_time = datetime.now()
        
        # Extract features
        features = self.extract_features(file_data)
        
        # Convert to tensor
        x = torch.from_numpy(features).unsqueeze(0).to(self.device)
        
        # Run inference
        with torch.no_grad():
            logits = self.model(x)
            probabilities = F.softmax(logits, dim=1)
            confidence, predicted_class = torch.max(probabilities, 1)
        
        # Get results
        threat_type = self.class_names[predicted_class.item()]
        confidence_score = confidence.item() * 100
        severity = self.calculate_severity(confidence.item(), threat_type)
        
        # Calculate analysis time
        analysis_time = (datetime.now() - start_time).total_seconds() * 1000
        
        # Get all class probabilities
        all_scores = {
            name: float(prob) * 100 
            for name, prob in zip(self.class_names, probabilities[0].cpu().numpy())
        }
        
        result = {
            'threat_type': threat_type,
            'severity': severity,
            'confidence': round(confidence_score, 2),
            'file_name': file_name,
            'source_ip': source_ip,
            'prediction_scores': all_scores,
            'analysis_time_ms': int(analysis_time),
            'model_name': 'ThreatDetectionCNN',
            'model_version': '1.0.0'
        }
        
        return result

# Demo usage
if __name__ == '__main__':
    print("Initializing Threat Detection Model...")
    detector = ThreatDetector()
    
    # Simulate threat detection on sample data
    print("\nRunning threat detection on sample files...\n")
    
    samples = [
        {'name': 'suspicious_payload.exe', 'size': 2048},
        {'name': 'unknown_script.ps1', 'size': 1024},
        {'name': 'encrypted_data.bin', 'size': 4096},
    ]
    
    results = []
    for sample in samples:
        # Generate random file data for demo
        file_data = np.random.bytes(sample['size'])
        
        # Detect threat
        result = detector.detect(
            file_data, 
            file_name=sample['name'],
            source_ip='192.168.1.100'
        )
        
        results.append(result)
        
        print(f"File: {result['file_name']}")
        print(f"  Threat Type: {result['threat_type'].upper()}")
        print(f"  Severity: {result['severity'].upper()}")
        print(f"  Confidence: {result['confidence']:.2f}%")
        print(f"  Analysis Time: {result['analysis_time_ms']}ms")
        print(f"  Scores: {json.dumps(result['prediction_scores'], indent=4)}")
        print()
    
    print(f"Analyzed {len(results)} samples successfully!")
