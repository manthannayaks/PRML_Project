import torch.nn as nn


class ClassCrossEntropyLoss(nn.Module):
    def __init__(self):
        super().__init__()
        self.loss = nn.CrossEntropyLoss()

    def forward(self, logits, targets):
        return self.loss(logits, targets)


class DomainCrossEntropyLoss(nn.Module):
    def __init__(self):
        super().__init__()
        self.loss = nn.CrossEntropyLoss()

    def forward(self, logits, targets):
        return self.loss(logits, targets)
