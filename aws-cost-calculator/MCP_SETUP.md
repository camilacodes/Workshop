# Como Configurar o Servidor MCP no Amazon Q Developer

## Passo 1: Localizar o arquivo de configuração MCP

O Amazon Q Developer procura por configurações MCP em diferentes locais dependendo do seu sistema:

### macOS/Linux:
```bash
~/.config/amazonq/mcp_servers.json
```

### Windows:
```bash
%APPDATA%\amazonq\mcp_servers.json
```

## Passo 2: Criar/Editar o arquivo de configuração

Crie ou edite o arquivo `mcp_servers.json` com o seguinte conteúdo:

```json
{
  "mcpServers": {
    "aws-pricing": {
      "command": "node",
      "args": ["/caminho/completo/para/aws-cost-calculator/mcp-server/server.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**IMPORTANTE**: Substitua `/caminho/completo/para/aws-cost-calculator` pelo caminho real onde você salvou o projeto.

## Passo 3: Exemplo de configuração completa

Para o nosso projeto, a configuração seria:

```json
{
  "mcpServers": {
    "aws-pricing": {
      "command": "node",
      "args": ["/Workshop/aws-cost-calculator/mcp-server/server.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

## Passo 4: Verificar se o servidor está funcionando

1. Abra um terminal
2. Navegue até o diretório do servidor MCP:
   ```bash
   cd /Workshop/aws-cost-calculator/mcp-server
   ```
3. Execute o servidor manualmente para testar:
   ```bash
   npm start
   ```
4. Você deve ver a mensagem: "AWS Pricing MCP Server rodando..."

## Passo 5: Reiniciar o Amazon Q Developer

Após configurar o arquivo MCP:
1. Feche completamente o Amazon Q Developer
2. Reabra o Amazon Q Developer
3. O servidor MCP será carregado automaticamente

## Passo 6: Testar a integração

No Amazon Q Developer, você pode testar se o servidor MCP está funcionando perguntando:

```
"Calcule o custo de 2 instâncias t3.micro rodando 744 horas por mês"
```

ou

```
"Qual o preço do S3 para 100GB de armazenamento?"
```

## Comandos disponíveis no MCP Server

### 1. Calcular custo EC2
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

### 2. Calcular custo S3
```json
{
  "tool": "calculate_s3_cost",
  "arguments": {
    "storage_gb": 100,
    "requests_get": 10,
    "requests_put": 5
  }
}
```

### 3. Calcular custo Lambda
```json
{
  "tool": "calculate_lambda_cost",
  "arguments": {
    "requests_millions": 1.5,
    "duration_ms": 200,
    "memory_mb": 512
  }
}
```

### 4. Obter dados de preços
```json
{
  "tool": "get_pricing_data",
  "arguments": {
    "service": "ec2",
    "region": "us-east-1"
  }
}
```

## Troubleshooting

### Problema: Servidor não inicia
**Solução**: Verifique se o Node.js está instalado e as dependências foram instaladas:
```bash
cd mcp-server
npm install
```

### Problema: Amazon Q não reconhece o servidor
**Solução**: 
1. Verifique se o caminho no arquivo de configuração está correto
2. Certifique-se de que o arquivo `mcp_servers.json` está no local correto
3. Reinicie completamente o Amazon Q Developer

### Problema: Permissões no arquivo
**Solução**: No Linux/macOS, certifique-se de que o arquivo tem permissões corretas:
```bash
chmod 644 ~/.config/amazonq/mcp_servers.json
```

## Exemplo de uso no Amazon Q Developer

Depois de configurado, você pode fazer perguntas como:

- "Usando o servidor MCP, calcule o custo de 3 instâncias t3.small por 500 horas"
- "Qual seria o custo do Lambda para 2 milhões de requests com 300ms de duração e 1GB de memória?"
- "Compare os preços do EC2 entre as regiões us-east-1 e eu-west-1"

## Logs e Debug

Para ver logs do servidor MCP:
```bash
cd mcp-server
npm start 2>&1 | tee mcp-server.log
```

Os logs ajudam a identificar problemas de conexão ou execução.

---

**Nota**: Este servidor MCP foi desenvolvido especificamente para o TDC 2025 Q Developer Quest e fornece dados de preços atualizados da AWS para integração com o Amazon Q Developer.