import { 
  OPENSEARCH_PRICING, 
  AURORA_PRICING, 
  KENDRA_PRICING, 
  PINECONE_PRICING,
  BEDROCK_PRICING,
  getRegionalPrice
} from './pricingData';

// user configurable

interface OpenSearchCostParams {
  storageGB: number;
  nodes: number;             
  instanceType: string;
  serverless?: boolean;
  region?: string;
}

interface CostResult {
  compute: number;
  storage: number;
  total: number;
  breakdown: {
    compute: string;
    storage: string;
    explanation: string;
  };
}

export function calculateOpenSearchCost({ 
  storageGB, 
  nodes,
  instanceType,
  serverless = false,
  devTestMode = false,
  region = 'us-east-1'
}: OpenSearchCostParams & { devTestMode?: boolean }): CostResult {
  
  if (serverless) {
    const minOcus = devTestMode ? OPENSEARCH_PRICING.serverlessMinOcuDevTest : OPENSEARCH_PRICING.serverlessMinOcu;
    const baseComputeCost = minOcus * OPENSEARCH_PRICING.serverlessOcuHourly * OPENSEARCH_PRICING.hoursPerMonth;
    const compute = getRegionalPrice(baseComputeCost, region);
    
    const baseStorageCost = storageGB * OPENSEARCH_PRICING.serverlessStorageGbMonth;
    const storage = getRegionalPrice(baseStorageCost, region);
    
    const mode = devTestMode ? 'dev/test' : 'production (HA)';
    
    return {
      compute,
      storage,
      total: compute + storage,
      breakdown: {
        compute: `${minOcus} OCU${minOcus > 1 ? 's' : ''} (${mode}) × $${OPENSEARCH_PRICING.serverlessOcuHourly}/hr × 730 hrs = $${compute.toFixed(2)}`,
        storage: `${storageGB} GB × $${OPENSEARCH_PRICING.serverlessStorageGbMonth}/GB/month = $${storage.toFixed(2)}`,
        explanation: `Serverless ${mode} runs ${minOcus} OCU${minOcus > 1 ? 's' : ''} continuously. Each OCU = 6GB RAM + vCPU + storage. ${devTestMode ? 'Dev/test mode has no high availability.' : 'Production mode includes high availability across AZs.'}`
      }
    };
  } else {
    const instanceHourlyRate = OPENSEARCH_PRICING.instances[instanceType as keyof typeof OPENSEARCH_PRICING.instances];
    
    if (!instanceHourlyRate) {
      throw new Error(`Unknown OpenSearch instance type: ${instanceType}. Available types: ${Object.keys(OPENSEARCH_PRICING.instances).join(', ')}`);
    }

    const baseComputeCost = nodes * instanceHourlyRate * OPENSEARCH_PRICING.hoursPerMonth;
    const compute = getRegionalPrice(baseComputeCost, region);
    
    const baseStorageCost = storageGB * OPENSEARCH_PRICING.ebsGbMonth;
    const storage = getRegionalPrice(baseStorageCost, region);
    
    return {
      compute,
      storage,
      total: compute + storage,
      breakdown: {
        compute: `${nodes} × ${instanceType} × $${instanceHourlyRate}/hr × 730 hrs = $${compute.toFixed(2)}`,
        storage: `${storageGB} GB EBS (gp3) × $${OPENSEARCH_PRICING.ebsGbMonth}/GB/month = $${storage.toFixed(2)}`,
        explanation: `Regular OpenSearch runs ${nodes} instance${nodes > 1 ? 's' : ''} 24/7. Instance type ${instanceType} chosen for your workload requirements.`
      }
    };
  }
}

interface AuroraCostParams {
  storageGB: number;
  nodes: number;              
  instanceType: string;      
  estimatedIOPerMonth: number;
  region?: string;
}

export function calculateAuroraCost({
  storageGB,
  nodes,
  instanceType,
  estimatedIOPerMonth,
  region = 'us-east-1'
}: AuroraCostParams): CostResult {
  
  const instanceHourlyRate = AURORA_PRICING.instances[instanceType as keyof typeof AURORA_PRICING.instances];
  
  if (!instanceHourlyRate) {
    throw new Error(`Unknown Aurora instance type: ${instanceType}. Available types: ${Object.keys(AURORA_PRICING.instances).join(', ')}`);
  }

  const baseComputeCost = nodes * instanceHourlyRate * AURORA_PRICING.hoursPerMonth;
  const compute = getRegionalPrice(baseComputeCost, region);
  
  const baseStorageCost = storageGB * AURORA_PRICING.storageGbMonth;
  const storage = getRegionalPrice(baseStorageCost, region);
  
  // I/O cost calculation
  const ioRequestsInMillions = estimatedIOPerMonth / 1000000;
  const baseIOCost = ioRequestsInMillions * AURORA_PRICING.ioPerMillionRequests;
  const ioCost = getRegionalPrice(baseIOCost, region);
  
  return {
    compute: compute + ioCost,
    storage,
    total: compute + storage + ioCost,
    breakdown: {
      compute: `${nodes} nodes × ${instanceType} × $${instanceHourlyRate}/hr × 730 hrs + ${ioRequestsInMillions.toFixed(1)}M I/O × $${AURORA_PRICING.ioPerMillionRequests} = $${(compute + ioCost).toFixed(2)}`,
      storage: `${storageGB} GB Aurora storage × $${AURORA_PRICING.storageGbMonth}/GB = $${storage.toFixed(2)}`,
      explanation: `Aurora charges for compute instances (running 24/7), storage that auto-scales, and I/O operations. You chose ${nodes} instances${nodes > 1 ? ' for read scaling' : ''}.`
    }
  };
}

interface KendraCostParams {
  edition: 'developer' | 'enterprise';
  region?: string;
}

export function calculateKendraCost({
  edition,
  region = 'us-east-1'
}: KendraCostParams): CostResult {
  
  const baseCost = edition === 'enterprise' ? 
    KENDRA_PRICING.enterpriseEdition : 
    KENDRA_PRICING.developerEdition;
    
  const total = getRegionalPrice(baseCost, region);
  
  const limits = edition === 'enterprise' ? 
    'up to 150K documents + high availability' : 
    'up to 750K documents';
  
  return {
    compute: total,
    storage: 0,
    total,
    breakdown: {
      compute: `${edition} edition: $${baseCost}/month`,
      storage: 'Storage included in base price',
      explanation: `Kendra is a fixed monthly cost for ${limits}. No per-query charges, but heavy usage may require Enterprise edition.`
    }
  };
}

interface PineconeCostParams {
  pods: number;              
  tier: 'starter' | 'standard'; 
  region?: string;
}

export function calculatePineconeCost({
  pods,
  tier,
  region = 'us-east-1'
}: PineconeCostParams): CostResult {
  
  const hourlyRate = tier === 'standard' ? 
    PINECONE_PRICING.standardPodHourly : 
    PINECONE_PRICING.starterPodHourly;
    
  const baseCost = pods * hourlyRate * PINECONE_PRICING.hoursPerMonth;
  const total = getRegionalPrice(baseCost, region);
  
  const podCapacity = tier === 'starter' ? '~1-2M vectors' : '~5M vectors';
  
  return {
    compute: total,
    storage: 0,
    total,
    breakdown: {
      compute: `${pods} ${tier} pod(s) × $${hourlyRate}/hr × 730 hrs = $${total.toFixed(2)}`,
      storage: 'Storage included in pod cost',
      explanation: `Each ${tier} pod supports ${podCapacity} with sub-50ms queries. Pinecone charges per pod running 24/7.`
    }
  };
}

interface BedrockCostParams {
  modelId: string;
  inputTokensPerMonth: number;   
  outputTokensPerMonth: number;  
  region?: string;
}

export function calculateBedrockCost({
  modelId,
  inputTokensPerMonth,
  outputTokensPerMonth,
  region = 'us-east-1'
}: BedrockCostParams): CostResult {
  
  const model = BEDROCK_PRICING.models[modelId as keyof typeof BEDROCK_PRICING.models];
  
  if (!model) {
    throw new Error(`Unknown Bedrock model: ${modelId}. Available models: ${Object.keys(BEDROCK_PRICING.models).join(', ')}`);
  }
  
  const inputCost = (inputTokensPerMonth / 1000) * model.inputTokensPer1K;
  const outputCost = (outputTokensPerMonth / 1000) * model.outputTokensPer1K;
  
  const baseCost = inputCost + outputCost;
  const total = getRegionalPrice(baseCost, region);
  
  return {
    compute: total,
    storage: 0,
    total,
    breakdown: {
      compute: `${(inputTokensPerMonth / 1000).toLocaleString()}K input tokens × $${model.inputTokensPer1K} + ${(outputTokensPerMonth / 1000).toLocaleString()}K output tokens × $${model.outputTokensPer1K} = $${total.toFixed(2)}`,
      storage: 'No storage costs for Bedrock',
      explanation: `Bedrock charges per token processed. Input tokens are your prompts + document context. Output tokens are AI responses. Costs scale with usage.`
    }
  };
}

// Helper function to estimate tokens from queries
export function estimateTokensFromQueries(
  queriesPerMonth: number,
  avgPromptLength: number,     
  avgResponseLength: number    
): { inputTokens: number; outputTokens: number } {
  
  const inputTokensPerQuery = Math.ceil(avgPromptLength / 4);
  const outputTokensPerQuery = Math.ceil(avgResponseLength / 4);
  
  return {
    inputTokens: queriesPerMonth * inputTokensPerQuery,
    outputTokens: queriesPerMonth * outputTokensPerQuery
  };
}