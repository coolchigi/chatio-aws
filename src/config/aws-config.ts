// AWS Configuration
export const awsConfig = {
  region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
  
  // Auth
  userPoolId: process.env.REACT_APP_USER_POOL_ID,
  userPoolWebClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID,
  
  // S3
  s3: {
    bucketName: process.env.REACT_APP_S3_BUCKET_NAME,
    region: process.env.REACT_APP_S3_REGION || process.env.REACT_APP_AWS_REGION || 'us-east-1',
  },
  
  // Bedrock
  bedrock: {
    region: process.env.REACT_APP_BEDROCK_REGION || process.env.REACT_APP_AWS_REGION || 'us-east-1',
    modelId: process.env.REACT_APP_BEDROCK_MODEL_ID || 'anthropic.claude-v2',
  },
  
  // API Gateway (for backend)
  apiGateway: {
    endpoint: process.env.REACT_APP_API_ENDPOINT,
    region: process.env.REACT_APP_API_REGION || process.env.REACT_APP_AWS_REGION || 'us-east-1',
  }
};

// Vector database options (pricing is dynamic; see pricingDetails for official docs)
export const vectorDatabaseOptions = [
  {
    id: 'opensearch',
    name: 'Amazon OpenSearch Service',
    description: 'Managed Elasticsearch-compatible search engine with native vector search capabilities',
    pricing: 'Instance-based: $0.036-$0.836/hr + $0.122/GB storage',
    pricingDetails: 'https://aws.amazon.com/opensearch-service/pricing/',
    setupComplexity: 'Medium',
    actuallyUsedForVectors: true,
    why: 'OpenSearch has native k-NN vector search with FAISS and nmslib algorithms. Widely used in production.',
    features: [
      'Native vector search with k-NN algorithms',
      'FAISS and nmslib support',
      'Managed infrastructure',
      'Multi-AZ deployment',
      'Integration with AWS ecosystem'
    ],
    considerations: [
      'Requires running instances 24/7 (cost adds up)',
      'Need to choose instance size upfront',
      'Storage costs separate from compute'
    ]
  },
  {
    id: 'opensearch-serverless',
    name: 'Amazon OpenSearch Serverless',
    description: 'Serverless OpenSearch with automatic scaling, but minimum 2 OCUs always running',
    pricing: 'Serverless: $0.24/OCU-hour (min 2 OCUs = ~$350/month) + $0.024/GB storage',
    pricingDetails: 'https://aws.amazon.com/opensearch-service/pricing/',
    setupComplexity: 'Low',
    actuallyUsedForVectors: true,
    why: 'Same vector capabilities as regular OpenSearch, but serverless. Good for variable workloads.',
    features: [
      'Same vector search as OpenSearch Service',
      'Automatic scaling based on demand',
      'No infrastructure management',
      'Pay-per-use (with minimums)'
    ],
    considerations: [
      'Minimum 2 OCUs always running (~$350/month base cost)',
      'Can be expensive for light usage',
      'Less control over performance tuning'
    ]
  },
  {
    id: 'aurora',
    name: 'Amazon Aurora PostgreSQL with pgvector',
    description: 'PostgreSQL database with pgvector extension for vector similarity search',
    pricing: 'Instance-based: $0.082-$1.340/hr + $0.10/GB storage + $0.20/million I/O',
    pricingDetails: 'https://aws.amazon.com/rds/aurora/pricing/',
    setupComplexity: 'Medium',
    actuallyUsedForVectors: true,
    why: 'pgvector is a popular PostgreSQL extension. Good when you need both relational data and vectors.',
    features: [
      'Full PostgreSQL compatibility',
      'pgvector extension for similarity search',
      'ACID transactions',
      'SQL queries with vector operations',
      'Read replicas for scaling'
    ],
    considerations: [
      'Need to understand PostgreSQL and SQL',
      'I/O costs can be unpredictable',
      'Vector performance not as optimized as purpose-built vector DBs'
    ]
  },
  {
    id: 'kendra',
    name: 'Amazon Kendra',
    description: 'AI-powered enterprise search (not a traditional vector database)',
    pricing: 'Fixed: $810/month (Developer) or $1,008/month (Enterprise)',
    pricingDetails: 'https://aws.amazon.com/kendra/pricing/',
    setupComplexity: 'Low',
    actuallyUsedForVectors: false,
    why: 'Kendra uses vectors internally but is not a vector database. It\'s an enterprise search service.',
    features: [
      'Natural language queries',
      'Document understanding',
      'Built-in ML for search relevance',
      'Enterprise connectors (SharePoint, etc.)',
      'No vector database management needed'
    ],
    considerations: [
      'High fixed monthly cost',
      'Not a traditional vector database',
      'Limited to search use cases',
      'Can\'t directly manipulate vectors'
    ]
  },
  {
    id: 'pinecone',
    name: 'Pinecone',
    description: 'Purpose-built vector database (third-party service)',
    pricing: 'Pod-based: $0.096/hr per pod (~$70/month)',
    pricingDetails: 'https://www.pinecone.io/pricing/',
    setupComplexity: 'Low',
    actuallyUsedForVectors: true,
    why: 'Purpose-built for vectors. Fast, but requires data transfer costs to/from AWS.',
    features: [
      'Purpose-built for vector operations',
      'Sub-50ms query latency',
      'Real-time vector updates',
      'Metadata filtering',
      'RESTful API'
    ],
    considerations: [
      'Third-party service (not AWS native)',
      'Data transfer costs to/from AWS',
      'Limited to vector operations only',
      'Vendor lock-in concerns'
    ]
  }
];


// Bedrock model options (pricing is dynamic; see pricingDetails for official docs)
export const bedrockModelOptions = [
  {
    id: 'anthropic.claude-v2',
    name: 'Claude V2',
    provider: 'Anthropic',
    pricing: '',
    pricingDetails: 'https://aws.amazon.com/bedrock/pricing/',
    contextWindow: '100K tokens',
  },
  {
    id: 'anthropic.claude-3-sonnet-20240229-v1:0',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    pricing: '',
    pricingDetails: 'https://aws.amazon.com/bedrock/pricing/',
    contextWindow: '200K tokens',
  },
  {
    id: 'anthropic.claude-3-haiku-20240307-v1:0',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    pricing: '',
    pricingDetails: 'https://aws.amazon.com/bedrock/pricing/',
    contextWindow: '200K tokens',
  },
  {
    id: 'amazon.titan-embed-text-v1',
    name: 'Titan Embeddings',
    provider: 'Amazon',
    pricing: '',
    pricingDetails: 'https://aws.amazon.com/bedrock/pricing/',
    contextWindow: 'N/A (embedding model)',
  },
];