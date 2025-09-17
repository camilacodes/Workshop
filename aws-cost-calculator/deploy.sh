#!/bin/bash

# Script de deploy para AWS Cost Calculator
# Desenvolvido com Amazon Q Developer para TDC 2025

set -e

echo "🚀 AWS Cost Calculator - Deploy Script"
echo "======================================"

# Verificar se Terraform está instalado
if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform não encontrado. Instale: https://terraform.io/downloads"
    exit 1
fi

# Verificar se AWS CLI está configurado
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI não configurado. Execute: aws configure"
    exit 1
fi

echo "✅ Pré-requisitos verificados"

# Navegar para diretório de infraestrutura
cd infrastructure

echo "📦 Inicializando Terraform..."
terraform init

echo "📋 Planejando deployment..."
terraform plan

echo "🤔 Deseja continuar com o deploy? (y/N)"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "❌ Deploy cancelado"
    exit 0
fi

echo "🚀 Aplicando infraestrutura..."
terraform apply -auto-approve

echo ""
echo "✅ Deploy concluído com sucesso!"
echo ""
echo "📊 URLs do projeto:"
terraform output -json | jq -r '
  "🌐 Website S3: " + .website_url.value,
  "⚡ CloudFront: " + .cloudfront_url.value,
  "📦 Bucket S3: " + .s3_bucket_name.value
'

echo ""
echo "💰 Estimativa de custos:"
terraform output -json | jq -r '.estimated_monthly_cost.value | to_entries[] | "  " + .key + ": " + .value'

echo ""
echo "🎉 Projeto disponível em: https://$(terraform output -raw cloudfront_url | sed 's/https:\/\///')"
echo ""
echo "📝 Para destruir a infraestrutura: terraform destroy"