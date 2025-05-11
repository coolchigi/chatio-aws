import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { awsConfig } from '../config/aws-config';

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  region: awsConfig.bedrock.region,
});

interface MessageRequest {
  message: string;
  documentId: string;
  knowledgeBaseId: string;
  vectorDatabaseId: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

interface MessageResponse {
  answer: string;
  sourceDocuments?: Array<{
    title: string;
    excerpt: string;
    pageNumber: number;
  }>;
}

export const sendMessageToBedrock = async (
  request: MessageRequest
): Promise<MessageResponse> => {
  try {
    // Format the prompt for the model
    const prompt = `Human: I'm asking about document ${request.documentId}. ${request.message}\n\nAssistant:`;
    
    // Create the request body
    const requestBody = {
      prompt,
      max_tokens: 1000,
      temperature: 0.7,
    };
    
    // Create the command
    const command = new InvokeModelCommand({
      modelId: awsConfig.bedrock.modelId,
      body: JSON.stringify(requestBody),
      contentType: 'application/json',
    });
    
    // Send the request
    const response = await bedrockClient.send(command);
    
    // Parse the response
    const responseBody = JSON.parse(
      new TextDecoder().decode(response.body)
    );
    
    return {
      answer: responseBody.completion || responseBody.generated_text || 'No response generated',
      sourceDocuments: [
        {
          title: 'Sample Document',
          excerpt: 'This is a sample excerpt from the document.',
          pageNumber: 1,
        },
      ],
    };
  } catch (error) {
    console.error('Error sending message to Bedrock:', error);
    throw error;
  }
};