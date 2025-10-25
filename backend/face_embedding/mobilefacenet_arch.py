# AutomatedPersonSearch/backend/face_embedding/mobilefacenet_arch.py
# --------------------------------------------------------------------------------
# MobileFaceNet Architecture (CORRECTED for PyTorch Conv2d syntax)
# --------------------------------------------------------------------------------

import torch.nn as nn
import torch.nn.functional as F
import torch

# --- Helper Blocks ---

class ConvBlock(nn.Module):
    """Standard Convolution Block: Conv + BatchNorm + PReLU"""
    # 🚨 FIX 1: Change 'kernel' to 'kernel_size'
    def __init__(self, in_c, out_c, kernel_size, stride): 
        super(ConvBlock, self).__init__()
        self.conv = nn.Sequential(
            # 🚨 FIX 2: Use the correct argument name 'kernel_size'
            nn.Conv2d(in_c, out_c, kernel_size, stride, kernel_size // 2, bias=False), 
            nn.BatchNorm2d(out_c),
            nn.PReLU(out_c)
        )
    def forward(self, x):
        return self.conv(x)

class DepthWiseBlock(nn.Module):
    """Depthwise Separable Convolution"""
    # 🚨 FIX 1: Change 'kernel' to 'kernel_size'
    def __init__(self, in_c, out_c, kernel_size, stride): 
        super(DepthWiseBlock, self).__init__()
        self.conv = nn.Sequential(
            # 1. Depthwise Convolution
            nn.Conv2d(in_c, in_c, kernel_size, stride, kernel_size // 2, groups=in_c, bias=False),
            nn.BatchNorm2d(in_c),
            nn.PReLU(in_c),
            # 2. Pointwise Convolution (Fixed the 'kernel' argument here)
            # 🚨 FIX 2: Pointwise convolution MUST use 'kernel_size=1'
            nn.Conv2d(in_c, out_c, kernel_size=1, stride=1, padding=0, bias=False), 
            nn.BatchNorm2d(out_c)
        )
    def forward(self, x):
        return self.conv(x)

class ResidualBlock(nn.Module):
    """Inverted Residual Block with shortcut"""
    # Note: This block receives 'kernel' argument implicitly through its parent call, 
    # but the internal structure expects to pass the kernel size correctly.
    def __init__(self, in_c, out_c, stride):
        super(ResidualBlock, self).__init__()
        # 🚨 FIX 3: Pass 'kernel_size=3' explicitly to DepthWiseBlock
        self.res = DepthWiseBlock(in_c, out_c, kernel_size=3, stride=stride) 
        
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
            # Initial Conv: Pass 'kernel_size' explicitly
            ConvBlock(3, 64, kernel_size=3, stride=2), 
            
            # Layer 1: Stride 1 
            ResidualBlock(64, 64, stride=1),
            ResidualBlock(64, 64, stride=1),
            ResidualBlock(64, 64, stride=1),
            
            # Layer 2: Stride 2 - Downsample
            ResidualBlock(64, 128, stride=2), 
            ResidualBlock(128, 128, stride=1),
            ResidualBlock(128, 128, stride=1),

            # Layer 3: Stride 2 - Downsample
            ResidualBlock(128, 128, stride=2), 
            ResidualBlock(128, 128, stride=1),
            ResidualBlock(128, 128, stride=1),
            
            ResidualBlock(128, 128, stride=1),
            ResidualBlock(128, 128, stride=1),
            
            # Layer 4: Final Expansion
            # Final Conv: Pass 'kernel_size' explicitly
            ConvBlock(128, 512, kernel_size=1, stride=1), 
        )
        
        # --- Embedding Head ---
        self.linear = nn.Sequential(
            nn.BatchNorm1d(512),
            nn.Dropout(p=0.5),
            nn.Linear(512, embedding_size, bias=False),
            nn.BatchNorm1d(embedding_size, affine=False) 
        )
        self.embedding_size = embedding_size

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), x.size(1), -1) 
        x = x.mean(dim=2) 
        x = self.linear(x)
        return x