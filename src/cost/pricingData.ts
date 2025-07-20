export const OPENSEARCH_PRICING = {
  // Instance pricing (per hour) - US East (N. Virginia)..from the AWS docs
  onDemandHourly: 0.209, // or1.large.search (2 vCPU, 16 GiB RAM)
  
  instances: {
    't3.small.search': 0.036,   // 2 vCPU, 2 GiB RAM - Dev/test
    't3.medium.search': 0.072,  // 2 vCPU, 4 GiB RAM - Small workloads
    'or1.large.search': 0.209,  // 2 vCPU, 16 GiB RAM - Recommended
    'or1.xlarge.search': 0.418, // 4 vCPU, 32 GiB RAM - High performance
    'or1.2xlarge.search': 0.836 // 8 vCPU, 64 GiB RAM - Large workloads
  },
  
  // Storage pricing (per GB per month)
  ebsGbMonth: 0.122, // EBS gp3, us-east-1
  
  // OpenSearch Serverless pricing
  serverlessOcuHourly: 0.24,    // Per OCU per hour
  serverlessMinOcu: 2,          // Minimum OCUs required (production with HA)
  serverlessMinOcuDevTest: 1,   // Minimum OCUs for dev/test (no HA)
  serverlessStorageGbMonth: 0.024, // Per GB per month for serverless storage
  
  // UltraWarm storage
  ultrawarmStorageGbMonth: 0.024, // Per GB per month
  
  hoursPerMonth: 730, // AWS convention for monthly cost calculation
  
  docs: {
    main: "https://aws.amazon.com/opensearch-service/pricing/",
    ebs: "https://aws.amazon.com/ebs/pricing/",
    calculator: "https://calculator.aws.amazon.com/",
    instance: "https://instances.vantage.sh/aws/opensearch/"
  }
};

export const AURORA_PRICING = {
  // Instance pricing (per hour) - US East (N. Virginia)
  instances: {
    'db.t3.medium': 0.082,   // 2 vCPU, 4 GiB RAM - Burstable
    'db.r5.large': 0.335,    // 2 vCPU, 16 GiB RAM - Memory optimized
    'db.r5.xlarge': 0.670,   // 4 vCPU, 32 GiB RAM - High performance
    'db.r5.2xlarge': 1.340   // 8 vCPU, 64 GiB RAM - Large workloads
  },
  
  // Storage and I/O pricing
  storageGbMonth: 0.10,        // Aurora storage per GB per month
  ioPerMillionRequests: 0.20,  // I/O requests per million
  
  // Backup storage (beyond free allocation)
  backupStorageGbMonth: 0.021, // Per GB per month
  
  hoursPerMonth: 730,
  
  docs: {
    main: "https://aws.amazon.com/rds/aurora/pricing/",
    calculator: "https://calculator.aws.amazon.com/"
  }
};

export const DYNAMODB_PRICING = {
  // Storage pricing
  storageGbMonth: 0.25, // Per GB per month
  
  // On-demand pricing
  onDemand: {
    readRequestsPerMillion: 0.25,  // Per million read requests
    writeRequestsPerMillion: 1.25  // Per million write requests
  },
  
  // Provisioned capacity pricing (per month)
  provisioned: {
    readCapacityUnit: 0.25,   // Per RCU per month
    writeCapacityUnit: 1.25   // Per WCU per month
  },
  
  docs: {
    main: "https://aws.amazon.com/dynamodb/pricing/",
    calculator: "https://calculator.aws.amazon.com/"
  }
};

export const KENDRA_PRICING = {
  // Fixed monthly pricing
  developerEdition: 810,   // Per month, up to 750K documents
  enterpriseEdition: 1008, // Per month, up to 150K docs + HA
  
  docs: {
    main: "https://aws.amazon.com/kendra/pricing/",
    calculator: "https://calculator.aws.amazon.com/"
  }
};

export const PINECONE_PRICING = {
  // Third-party pricing (approximate)
  starterPodHourly: 0.096, // Per pod per hour (~$70/month)
  standardPodHourly: 0.192, // Per pod per hour (~$140/month)
  
  hoursPerMonth: 730,
  
  docs: {
    main: "https://www.pinecone.io/pricing/"
  }
};

export const BEDROCK_PRICING = {
  models: {
    // Anthropic Claude models
    'anthropic.claude-v2': {
      inputTokensPer1K: 0.008,   // $0.008 per 1K input tokens
      outputTokensPer1K: 0.024,  // $0.024 per 1K output tokens
      contextWindow: '100K tokens'
    },
    'anthropic.claude-3-sonnet-20240229-v1:0': {
      inputTokensPer1K: 0.003,   // $0.003 per 1K input tokens
      outputTokensPer1K: 0.015,  // $0.015 per 1K output tokens
      contextWindow: '200K tokens'
    },
    'anthropic.claude-3-haiku-20240307-v1:0': {
      inputTokensPer1K: 0.0008,  // $0.0008 per 1K input tokens
      outputTokensPer1K: 0.004,  // $0.004 per 1K output tokens
      contextWindow: '200K tokens'
    },
    
    // Amazon Titan models
    'amazon.titan-embed-text-v1': {
      inputTokensPer1K: 0.00011, // $0.00011 per 1K input tokens
      outputTokensPer1K: 0,      // No output tokens for embedding models
      contextWindow: '8K tokens (embedding)'
    }
  },
  
  docs: {
    main: "https://aws.amazon.com/bedrock/pricing/",
    calculator: "https://calculator.aws.amazon.com/"
  }
};

// Regional pricing multipliers (US East - N. Virginia = 1.0 baseline)
export const REGIONAL_MULTIPLIERS = {
  'us-east-1': 1.0,      // N. Virginia (baseline)
  'us-east-2': 1.0,      // Ohio
  'us-west-1': 1.15,     // N. California
  'us-west-2': 1.0,      // Oregon
  'eu-west-1': 1.08,     // Ireland
  'eu-central-1': 1.12,  // Frankfurt
  'ap-northeast-1': 1.08, // Tokyo
  'ap-southeast-1': 1.08  // Singapore
};

// Helper function to get regional pricing
export function getRegionalPrice(basePrice: number, region: string): number {
  const multiplier = REGIONAL_MULTIPLIERS[region as keyof typeof REGIONAL_MULTIPLIERS] || 1.0;
  return basePrice * multiplier;
}

export const PRICING_METADATA = {
  lastUpdated: '2025-01-12',
  baseRegion: 'us-east-1',
  currency: 'USD',
  sources: [
    'https://aws.amazon.com/opensearch-service/pricing/',
    'https://aws.amazon.com/rds/aurora/pricing/',
    'https://aws.amazon.com/dynamodb/pricing/',
    'https://aws.amazon.com/kendra/pricing/',
    'https://aws.amazon.com/bedrock/pricing/',
    'https://www.pinecone.io/pricing/'
  ],
  notes: [
    'All prices are for US East (N. Virginia) region unless otherwise specified',
    'Prices are exclusive of applicable taxes and duties',
    'AWS Free Tier limits may apply for eligible services',
    'Actual costs may vary based on usage patterns and configurations'
  ]
};
