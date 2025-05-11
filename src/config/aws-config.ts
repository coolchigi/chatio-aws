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

// Vector database options with pricing information
export const vectorDatabaseOptions = [
  {
    id: 'opensearch',
    name: 'Amazon OpenSearch Service',
    description: 'Fully managed search and analytics engine with vector search capabilities',
    pricing: 'Starting at $0.10 per hour for t3.small instance',
    pricingDetails: 'https://aws.amazon.com/opensearch-service/pricing/',
    setupComplexity: 'Medium',
  },
  {
    id: 'aurora',
    name: 'Amazon Aurora with pgvector',
    description: 'PostgreSQL-compatible database with vector search extension',
    pricing: 'Starting at $0.10 per hour for db.t3.small instance',
    pricingDetails: 'https://aws.amazon.com/rds/aurora/pricing/',
    setupComplexity: 'Medium',
  },
  {
    id: 'dynamodb',
    name: 'Amazon DynamoDB with vector search',
    description: 'Fully managed NoSQL database with vector search capabilities',
    pricing: 'Pay per request and storage used',
    pricingDetails: 'https://aws.amazon.com/dynamodb/pricing/',
    setupComplexity: 'Low',
  },
  {
    id: 'kendra',
    name: 'Amazon Kendra',
    description: 'Intelligent search service with natural language capabilities',
    pricing: 'Starting at $0.75 per hour for Developer Edition',
    pricingDetails: 'https://aws.amazon.com/kendra/pricing/',
    setupComplexity: 'Low',
  },
  {
    id: 'pinecone',
    name: 'Pinecone (3rd party)',
    description: 'Vector database optimized for vector search applications',
    pricing: 'Starting at $0.096 per hour for a pod',
    pricingDetails: 'https://www.pinecone.io/pricing/',
    setupComplexity: 'Low',
  },
];

// Bedrock model options with pricing
export const bedrockModelOptions = [
  {
    id: 'anthropic.claude-v2',
    name: 'Claude V2',
    provider: 'Anthropic',
    pricing: '$11.02 per 1M input tokens, $32.68 per 1M output tokens',
    contextWindow: '100K tokens',
  },
  {
    id: 'anthropic.claude-3-sonnet-20240229-v1:0',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    pricing: '$3.00 per 1M input tokens, $15.00 per 1M output tokens',
    contextWindow: '200K tokens',
  },
  {
    id: 'anthropic.claude-3-haiku-20240307-v1:0',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    pricing: '$0.25 per 1M input tokens, $1.25 per 1M output tokens',
    contextWindow: '200K tokens',
  },
  {
    id: 'amazon.titan-embed-text-v1',
    name: 'Titan Embeddings',
    provider: 'Amazon',
    pricing: '$0.20 per 1M tokens',
    contextWindow: 'N/A (embedding model)',
  },
];