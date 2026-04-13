import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models
import config



class GradientReversalFunction(torch.autograd.Function):
    @staticmethod
    def forward(ctx, x, lamb):
        ctx.lamb = lamb
        return x.view_as(x)

    @staticmethod
    def backward(ctx, grad_output):
        return -ctx.lamb * grad_output, None


class GradientReversalLayer(nn.Module):
    def forward(self, x, lamb=0.1):
        return GradientReversalFunction.apply(x, lamb)



def make_feature_head(in_dim, hidden_dim, depth):
    layers = []
    for i in range(depth):
        layers.append(nn.Linear(in_dim if i == 0 else hidden_dim, hidden_dim))
        layers.append(nn.ReLU(inplace=True))
        layers.append(nn.Dropout(p=config.HEAD_DROPOUT))
    return nn.Sequential(*layers)



class BackboneEmbedding(nn.Module):
    def __init__(self, backbone, feat_dim, depth):
        super().__init__()

        self.backbone = backbone

        self.head = make_feature_head(feat_dim, config.HEAD_HIDDEN_DIM, depth)
        self.project = nn.Linear(config.HEAD_HIDDEN_DIM, config.EMBED_DIM)

  
        self.class_classifier = nn.Linear(config.EMBED_DIM, config.NUM_CLASSES)

    
        self.grl = GradientReversalLayer()
        self.domain_classifier = nn.Sequential(
            nn.Linear(config.EMBED_DIM, config.HEAD_HIDDEN_DIM),
            nn.ReLU(),
            nn.Linear(config.HEAD_HIDDEN_DIM, len(config.DOMAIN_NAMES)),
        )

  
    def extract_features(self, x):
        return self.backbone(x)


    def forward(self, x):
        f = self.extract_features(x)
        f = self.head(f)

        emb = self.project(f)
        emb = F.normalize(emb, dim=1)

        return emb

 
    def forward_with_domain(self, x, lamb=0.1):
        f = self.extract_features(x)
        f = self.head(f)

        emb = self.project(f)
        emb = F.normalize(emb, dim=1)

       
        cls_logits = self.class_classifier(emb)

     
        dom_logits = self.domain_classifier(self.grl(emb, lamb))

        return emb, cls_logits, dom_logits



def freeze_except_last_resnet(m):
    for name, p in m.named_parameters():
        if "layer4" in name: 
            p.requires_grad = True
        else:
            p.requires_grad = False


def freeze_except_last_vgg(m):
    for name, p in m.named_parameters():
        if "features.40" in name or "features.41" in name:
            p.requires_grad = True
        else:
            p.requires_grad = False


def freeze_except_last_dense(m):
    for name, p in m.named_parameters():
        if "denseblock4" in name:
            p.requires_grad = True
        else:
            p.requires_grad = False



def _resnet50(depth):
    m = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)
    dim = m.fc.in_features
    m.fc = nn.Identity()

    freeze_except_last_resnet(m)

    return BackboneEmbedding(m, dim, depth)


def _vgg(depth):
    m = models.vgg16_bn(weights=models.VGG16_BN_Weights.DEFAULT)
    dim = m.classifier[-1].in_features
    m.classifier[-1] = nn.Identity()

    freeze_except_last_vgg(m)

    return BackboneEmbedding(m, dim, depth)


def _dense(depth):
    m = models.densenet121(weights=models.DenseNet121_Weights.DEFAULT)
    dim = m.classifier.in_features
    m.classifier = nn.Identity()

    freeze_except_last_dense(m)

    return BackboneEmbedding(m, dim, depth)



def build_model(name, depth):
    if name == "resnet50":
        return _resnet50(depth)
    elif name == "vgg16_bn":
        return _vgg(depth)
    elif name == "densenet121":
        return _dense(depth)
    else:
        raise ValueError("Unknown model")
