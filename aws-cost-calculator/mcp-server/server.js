#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Dados de preços da AWS (região us-east-1)
const AWS_PRICING_DATA = {
  ec2: {
    't3.micro': { hourly: 0.0116, vcpu: 2, memory: 1 },
    't3.small': { hourly: 0.0232, vcpu: 2, memory: 2 },
    't3.medium': { hourly: 0.0464, vcpu: 2, memory: 4 },
    't3.large': { hourly: 0.0928, vcpu: 2, memory: 8 },
    't3.xlarge': { hourly: 0.1856, vcpu: 4, memory: 16 }
  },
  s3: {
    standard: {
      storage: 0.023, // per GB/month
      requests_put: 0.0005, // per 1000 requests
      requests_get: 0.0004 // per 1000 requests
    }
  },
  rds: {
    'db.t3.micro': { hourly: 0.017, vcpu: 2, memory: 1 },
    'db.t3.small': { hourly: 0.034, vcpu: 2, memory: 2 },
    'db.t3.medium': { hourly: 0.068, vcpu: 2, memory: 4 },
    storage: 0.115 // per GB/month
  },
  lambda: {
    requests: 0.0000002, // per request
    duration: 0.0000166667, // per GB-second
    free_tier: {
      requests: 1000000, // per month
      duration: 400000 // GB-seconds per month
    }
  },
  regions: {
    'us-east-1': { name: 'N. Virginia', multiplier: 1.0 },
    'us-west-2': { name: 'Oregon', multiplier: 1.05 },
    'eu-west-1': { name: 'Ireland', multiplier: 1.1 },
    'ap-southeast-1': { name: 'Singapore', multiplier: 1.15 }
  }
};

class AWSPricingMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'aws-pricing-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupResourceHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'calculate_ec2_cost',
          description: 'Calcula o custo mensal de instâncias EC2',
          inputSchema: {
            type: 'object',
            properties: {
              instance_type: { type: 'string', description: 'Tipo da instância (ex: t3.micro)' },
              instances: { type: 'number', description: 'Número de instâncias' },
              hours: { type: 'number', description: 'Horas por mês (máx 744)' },
              region: { type: 'string', description: 'Região AWS', default: 'us-east-1' }
            },
            required: ['instance_type', 'instances', 'hours']
          }
        },
        {
          name: 'calculate_s3_cost',
          description: 'Calcula o custo mensal do S3',
          inputSchema: {
            type: 'object',
            properties: {
              storage_gb: { type: 'number', description: 'Armazenamento em GB' },
              requests_get: { type: 'number', description: 'Requests GET (milhares)' },
              requests_put: { type: 'number', description: 'Requests PUT (milhares)' },
              region: { type: 'string', description: 'Região AWS', default: 'us-east-1' }
            },
            required: ['storage_gb']
          }
        },
        {
          name: 'calculate_lambda_cost',
          description: 'Calcula o custo mensal do Lambda',
          inputSchema: {
            type: 'object',
            properties: {
              requests_millions: { type: 'number', description: 'Requests em milhões' },
              duration_ms: { type: 'number', description: 'Duração média em ms' },
              memory_mb: { type: 'number', description: 'Memória em MB' },
              region: { type: 'string', description: 'Região AWS', default: 'us-east-1' }
            },
            required: ['requests_millions', 'duration_ms', 'memory_mb']
          }
        },
        {
          name: 'get_pricing_data',
          description: 'Obtém dados de preços para um serviço específico',
          inputSchema: {
            type: 'object',
            properties: {
              service: { type: 'string', enum: ['ec2', 's3', 'rds', 'lambda'], description: 'Serviço AWS' },
              region: { type: 'string', description: 'Região AWS', default: 'us-east-1' }
            },
            required: ['service']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'calculate_ec2_cost':
            return await this.calculateEC2Cost(args);
          case 'calculate_s3_cost':
            return await this.calculateS3Cost(args);
          case 'calculate_lambda_cost':
            return await this.calculateLambdaCost(args);
          case 'get_pricing_data':
            return await this.getPricingData(args);
          default:
            throw new Error(`Ferramenta desconhecida: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Erro: ${error.message}`
            }
          ]
        };
      }
    });
  }

  setupResourceHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'aws://pricing/ec2',
          mimeType: 'application/json',
          name: 'Preços EC2',
          description: 'Dados de preços das instâncias EC2'
        },
        {
          uri: 'aws://pricing/s3',
          mimeType: 'application/json',
          name: 'Preços S3',
          description: 'Dados de preços do S3'
        },
        {
          uri: 'aws://pricing/lambda',
          mimeType: 'application/json',
          name: 'Preços Lambda',
          description: 'Dados de preços do Lambda'
        },
        {
          uri: 'aws://regions',
          mimeType: 'application/json',
          name: 'Regiões AWS',
          description: 'Lista de regiões AWS com multiplicadores de preço'
        }
      ]
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      
      switch (uri) {
        case 'aws://pricing/ec2':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(AWS_PRICING_DATA.ec2, null, 2)
              }
            ]
          };
        case 'aws://pricing/s3':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(AWS_PRICING_DATA.s3, null, 2)
              }
            ]
          };
        case 'aws://pricing/lambda':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(AWS_PRICING_DATA.lambda, null, 2)
              }
            ]
          };
        case 'aws://regions':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(AWS_PRICING_DATA.regions, null, 2)
              }
            ]
          };
        default:
          throw new Error(`Recurso não encontrado: ${uri}`);
      }
    });
  }

  async calculateEC2Cost(args) {
    const { instance_type, instances, hours, region = 'us-east-1' } = args;
    
    if (!AWS_PRICING_DATA.ec2[instance_type]) {
      throw new Error(`Tipo de instância não encontrado: ${instance_type}`);
    }

    const pricing = AWS_PRICING_DATA.ec2[instance_type];
    const regionMultiplier = AWS_PRICING_DATA.regions[region]?.multiplier || 1.0;
    const monthlyCost = instances * pricing.hourly * hours * regionMultiplier;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            service: 'EC2',
            instance_type,
            instances,
            hours,
            region,
            pricing: {
              hourly_rate: pricing.hourly,
              region_multiplier: regionMultiplier,
              monthly_cost: parseFloat(monthlyCost.toFixed(2))
            },
            specs: {
              vcpu: pricing.vcpu,
              memory_gb: pricing.memory
            }
          }, null, 2)
        }
      ]
    };
  }

  async calculateS3Cost(args) {
    const { storage_gb, requests_get = 0, requests_put = 0, region = 'us-east-1' } = args;
    
    const pricing = AWS_PRICING_DATA.s3.standard;
    const regionMultiplier = AWS_PRICING_DATA.regions[region]?.multiplier || 1.0;
    
    const storageCost = storage_gb * pricing.storage * regionMultiplier;
    const getCost = requests_get * pricing.requests_get * regionMultiplier;
    const putCost = requests_put * pricing.requests_put * regionMultiplier;
    const totalCost = storageCost + getCost + putCost;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            service: 'S3',
            storage_gb,
            requests: { get: requests_get, put: requests_put },
            region,
            pricing: {
              storage_cost: parseFloat(storageCost.toFixed(2)),
              requests_get_cost: parseFloat(getCost.toFixed(2)),
              requests_put_cost: parseFloat(putCost.toFixed(2)),
              total_monthly_cost: parseFloat(totalCost.toFixed(2))
            }
          }, null, 2)
        }
      ]
    };
  }

  async calculateLambdaCost(args) {
    const { requests_millions, duration_ms, memory_mb, region = 'us-east-1' } = args;
    
    const pricing = AWS_PRICING_DATA.lambda;
    const regionMultiplier = AWS_PRICING_DATA.regions[region]?.multiplier || 1.0;
    
    const totalRequests = requests_millions * 1000000;
    const gbSeconds = totalRequests * (duration_ms / 1000) * (memory_mb / 1024);
    
    // Aplicar free tier
    const billableRequests = Math.max(0, totalRequests - pricing.free_tier.requests);
    const billableGBSeconds = Math.max(0, gbSeconds - pricing.free_tier.duration);
    
    const requestsCost = billableRequests * pricing.requests * regionMultiplier;
    const durationCost = billableGBSeconds * pricing.duration * regionMultiplier;
    const totalCost = requestsCost + durationCost;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            service: 'Lambda',
            requests_millions,
            duration_ms,
            memory_mb,
            region,
            calculations: {
              total_requests: totalRequests,
              gb_seconds: parseFloat(gbSeconds.toFixed(2)),
              billable_requests: billableRequests,
              billable_gb_seconds: parseFloat(billableGBSeconds.toFixed(2))
            },
            pricing: {
              requests_cost: parseFloat(requestsCost.toFixed(4)),
              duration_cost: parseFloat(durationCost.toFixed(4)),
              total_monthly_cost: parseFloat(totalCost.toFixed(4))
            },
            free_tier_applied: true
          }, null, 2)
        }
      ]
    };
  }

  async getPricingData(args) {
    const { service, region = 'us-east-1' } = args;
    
    if (!AWS_PRICING_DATA[service]) {
      throw new Error(`Serviço não encontrado: ${service}`);
    }

    const data = {
      service,
      region,
      region_info: AWS_PRICING_DATA.regions[region],
      pricing_data: AWS_PRICING_DATA[service],
      last_updated: new Date().toISOString()
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2)
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('AWS Pricing MCP Server rodando...');
  }
}

const server = new AWSPricingMCPServer();
server.run().catch(console.error);