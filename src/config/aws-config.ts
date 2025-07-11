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
    description: 'Fully managed search and analytics engine with vector search capabilities',
    pricing: 'Starts at $0.209/hr for or1.large.search (2 vCPU, 16 GiB RAM) in us-east-1. See pricing details.',
    pricingDetails: 'https://aws.amazon.com/opensearch-service/pricing/',
    setupComplexity: 'Medium',
  },
  {
    id: 'aurora',
    name: 'Amazon Aurora with pgvector',
    description: 'PostgreSQL-compatible database with vector search extension',
    pricing: '',
    pricingDetails: 'https://aws.amazon.com/rds/aurora/pricing/',
    setupComplexity: 'Medium',
  },
  {
    id: 'dynamodb',
    name: 'Amazon DynamoDB with vector search',
    description: 'Fully managed NoSQL database with vector search capabilities',
    pricing: '',
    pricingDetails: 'https://aws.amazon.com/dynamodb/pricing/',
    setupComplexity: 'Low',
  },
  {
    id: 'kendra',
    name: 'Amazon Kendra',
    description: 'Intelligent search service with natural language capabilities',
    pricing: '',
    pricingDetails: 'https://aws.amazon.com/kendra/pricing/',
    setupComplexity: 'Low',
  },
  {
    id: 'pinecone',
    name: 'Pinecone (3rd party)',
    description: 'Vector database optimized for vector search applications',
    pricing: '',
    pricingDetails: 'https://www.pinecone.io/pricing/',
    setupComplexity: 'Low',
  },
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