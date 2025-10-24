# AutomatedPersonSearch/backend/face_embedding/mobilefacenet_arch.py
# --------------------------------------------------------------------------------
# MobileFaceNet Architecture (Adapted for ArcFace embedding extraction)
# --------------------------------------------------------------------------------

import torch.nn as nn
import torch.nn.functional as F
import torch

# --- Helper Blocks ---

class ConvBlock(nn.Module):
    """Standard Convolution Block: Conv + BatchNorm + PReLU"""
    def __init__(self, in_c, out_c, kernel, stride):
        super(ConvBlock, self).__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_c, out_c, kernel, stride, kernel // 2, bias=False),
            nn.BatchNorm2d(out_c),
            nn.PReLU(out_c)  # PReLU is standard in MobileFaceNet
        )
    def forward(self, x):
        return self.conv(x)

class DepthWiseBlock(nn.Module):
    """Depthwise Separable Convolution"""
    def __init__(self, in_c, out_c, kernel, stride):
        super(DepthWiseBlock, self).__init__()
        self.conv = nn.Sequential(
            # 1. Depthwise Convolution
            nn.Conv2d(in_c, in_c, kernel, stride, kernel // 2, groups=in_c, bias=False),
            nn.BatchNorm2d(in_c),
            nn.PReLU(in_c),
            # 2. Pointwise Convolution
            nn.Conv2d(in_c, out_c, kernel=1, stride=1, padding=0, bias=False),
            nn.BatchNorm2d(out_c)
        )
    def forward(self, x):
        return self.conv(x)

class ResidualBlock(nn.Module):
    """Inverted Residual Block with shortcut"""
    def __init__(self, in_c, out_c, stride):
        super(ResidualBlock, self).__init__()
        self.res = DepthWiseBlock(in_c, out_c, kernel=3, stride=stride)
        
        # Check if shortcut (residual) connection is needed
        self.shortcut = (in_c == out_c and stride == 1)
        self.PReLU = nn.PReLU(out_c)

    def forward(self, x):
        identity = x
        out = self.res(x)
        
        if self.shortcut:
            out = out + identity
        
        return self.PReLU(out)


# ------------------------------------------------------------------
# MAIN MODEL CLASS: MobileFaceNet (embedding_size=512)
# ------------------------------------------------------------------
class MobileFaceNet(nn.Module):
    def __init__(self, embedding_size=512):
        super(MobileFaceNet, self).__init__()
        
        # --- Feature Extraction Blocks ---
        self.features = nn.Sequential(
            # Initial Conv (Output channels: 64)
            ConvBlock(3, 64, kernel=3, stride=2), 
            
            # Layer 1: Stride 1 (Output channels: 64)
            ResidualBlock(64, 64, stride=1),
            ResidualBlock(64, 64, stride=1),
            ResidualBlock(64, 64, stride=1),
            
            # Layer 2: Stride 2 (Output channels: 128) - Downsample
            ResidualBlock(64, 128, stride=2), 
            ResidualBlock(128, 128, stride=1),
            ResidualBlock(128, 128, stride=1),

            # Layer 3: Stride 2 (Output channels: 128) - Downsample
            ResidualBlock(128, 128, stride=2), 
            ResidualBlock(128, 128, stride=1),
            ResidualBlock(128, 128, stride=1),
            
            ResidualBlock(128, 128, stride=1),
            ResidualBlock(128, 128, stride=1),
            
            # Layer 4: Final Expansion (Output channels: 512)
            ConvBlock(128, 512, kernel=1, stride=1),
        )
        
        # --- Embedding Head ---
        # Note: ArcFace models typically include a final BN layer to enforce L2 normalization.
        self.linear = nn.Sequential(
            nn.BatchNorm1d(512),
            nn.Dropout(p=0.5),
            nn.Linear(512, embedding_size, bias=False),
            nn.BatchNorm1d(embedding_size, affine=False) 
        )

    def forward(self, x):
        # 1. Feature Extraction (e.g., from 3x112x112 to 512x7x7)
        x = self.features(x)
        
        # 2. Global Average Pooling (512x7x7 to 512)
        x = x.view(x.size(0), x.size(1), -1) 
        x = x.mean(dim=2) 
        
        # 3. Embedding Generation
        x = self.linear(x)
        
        return x