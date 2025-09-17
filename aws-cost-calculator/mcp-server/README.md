# AWS Pricing MCP Server

Este é um servidor MCP (Model Context Protocol) que fornece dados de preços da AWS e funcionalidades de cálculo de custos.

## Funcionalidades

### Tools (Ferramentas)
- `calculate_ec2_cost`: Calcula custos de instâncias EC2
- `calculate_s3_cost`: Calcula custos de armazenamento S3
- `calculate_lambda_cost`: Calcula custos de execução Lambda
- `get_pricing_data`: Obtém dados de preços para serviços específicos

### Resources (Recursos)
- `aws://pricing/ec2`: Dados de preços EC2
- `aws://pricing/s3`: Dados de preços S3
- `aws://pricing/lambda`: Dados de preços Lambda
- `aws://regions`: Lista de regiões AWS

## Instalação

```bash
cd mcp-server
npm install
```

## Uso

### Executar o servidor
```bash
npm start
```

### Configuração no Amazon Q Developer

Adicione ao seu arquivo de configuração MCP:

```json
{
  "mcpServers": {
    "aws-pricing": {
      "command": "node",
      "args": ["/caminho/para/aws-cost-calculator/mcp-server/server.js"]
    }
  }
}
```

## Exemplos de Uso

### Calcular custo EC2
```json
{
  "tool": "calculate_ec2_cost",
  "arguments": {
    "instance_type": "t3.micro",
    "instances": 2,
    "hours": 744,
    "region": "us-east-1"
  }
}
```

### Calcular custo S3
```json
{
  "tool": "calculate_s3_cost",
  "arguments": {
    "storage_gb": 100,
    "requests_get": 10,
    "requests_put": 5,
    "region": "us-east-1"
  }
}
```

### Calcular custo Lambda
```json
{
  "tool": "calculate_lambda_cost",
  "arguments": {
    "requests_millions": 1.5,
    "duration_ms": 200,
    "memory_mb": 512,
    "region": "us-east-1"
  }
}
```

## Regiões Suportadas

- `us-east-1`: N. Virginia (multiplicador: 1.0)
- `us-west-2`: Oregon (multiplicador: 1.05)
- `eu-west-1`: Ireland (multiplicador: 1.1)
- `ap-southeast-1`: Singapore (multiplicador: 1.15)

## Dados de Preços

Os preços são baseados na região us-east-1 e incluem:

### EC2
- t3.micro: $0.0116/hora
- t3.small: $0.0232/hora
- t3.medium: $0.0464/hora
- t3.large: $0.0928/hora

### S3
- Armazenamento: $0.023/GB/mês
- Requests GET: $0.0004/1000 requests
- Requests PUT: $0.0005/1000 requests

### Lambda
- Requests: $0.0000002/request
- Duração: $0.0000166667/GB-segundo
- Free Tier: 1M requests + 400K GB-segundos/mês

*Preços atualizados em setembro de 2024. Consulte a documentação oficial da AWS para preços mais recentes.*