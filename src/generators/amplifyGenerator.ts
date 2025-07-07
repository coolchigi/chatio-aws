interface ProjectConfig {
    name: string;
    region: string;
    vectorDatabaseId: string;
    modelId: string;
    knowledgeBaseId: string;
    deploymentOption: string;
  }
  
  export function generateAmplifyProject(config: ProjectConfig): Record<string, string> {
    return {
      'package.json': generatePackageJson(config),
      'amplify/backend.ts': generateBackend(config),
      'amplify/auth/resource.ts': generateAuth(config),
      'amplify/data/resource.ts': generateData(config),
      'amplify/storage/resource.ts': generateStorage(config),
      'src/App.tsx': generateApp(config),
      'src/main.tsx': generateMain(config),
      'index.html': generateIndexHtml(config),
      'README.md': generateReadme(config)
    };
  }
  
  function generatePackageJson(config: ProjectConfig): string {
    return JSON.stringify({
      name: config.name.toLowerCase().replace(/\s+/g, '-'),
      version: "1.0.0",
      type: "module",
      scripts: {
        dev: "vite",
        build: "tsc && vite build",
        preview: "vite preview"
      },
      dependencies: {
        "@aws-amplify/backend": "^1.1.1",
        "@aws-amplify/ui-react": "^6.1.13",
        "@aws-amplify/ui-react-ai": "^1.0.0",
        "aws-amplify": "^6.4.0",
        "react": "^18.3.1",
        "react-dom": "^18.3.1"
      },
      devDependencies: {
        "@aws-amplify/backend-cli": "^1.2.4",
        "@types/react": "^18.3.3",
        "@types/react-dom": "^18.3.0",
        "typescript": "^5.5.3",
        "vite": "^5.3.4"
      }
    }, null, 2);
  }
  
  function generateBackend(config: ProjectConfig): string {
    return `import { defineBackend } from '@aws-amplify/backend';
  import { auth } from './auth/resource';
  import { data } from './data/resource';
  import { storage } from './storage/resource';
  
  export const backend = defineBackend({
    auth,
    data,
    storage,
  });`;
  }
  
  function generateAuth(config: ProjectConfig): string {
    return `import { defineAuth } from '@aws-amplify/backend';
  
  export const auth = defineAuth({
    loginWith: {
      email: true,
    },
  });`;
  }
  
  function generateStorage(config: ProjectConfig): string {
    return `import { defineStorage } from '@aws-amplify/backend';
  
  export const storage = defineStorage({
    name: '${config.name.toLowerCase().replace(/\s+/g, '-')}-documents',
    access: (allow) => ({
      'documents/*': [
        allow.authenticated.to(['read', 'write', 'delete']),
      ],
    }),
  });`;
  }
  
  function generateData(config: ProjectConfig): string {
    return `import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
  
  const schema = a.schema({
    chat: a.conversation({
      aiModel: a.ai.model('${config.modelId}'),
      systemPrompt: 'You are a helpful assistant that answers questions about uploaded PDF documents. Help users understand and analyze their documents.',
      tools: [
        a.ai.tool({
          name: 'getPdfContent',
          description: 'Retrieve content from uploaded PDF documents',
        }),
      ],
    }),
  });
  
  export type Schema = ClientSchema<typeof schema>;
  
  export const data = defineData({
    schema,
    authorizationModes: {
      defaultAuthorizationMode: 'userPool',
    },
  });`;
  }
  
  function generateApp(config: ProjectConfig): string {
    return `import { Authenticator } from '@aws-amplify/ui-react';
  import { AIConversation, createAIHooks } from '@aws-amplify/ui-react-ai';
  import { StorageManager } from '@aws-amplify/ui-react-storage';
  import { generateClient } from 'aws-amplify/data';
  import type { Schema } from '../amplify/data/resource';
  import '@aws-amplify/ui-react/styles.css';
  
  const client = generateClient<Schema>();
  const { useAIConversation } = createAIHooks(client);
  
  function ChatApp() {
    const [
      {
        data: { messages },
        isLoading,
      },
      handleSendMessage,
    ] = useAIConversation('chat');
  
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>${config.name}</h1>
        
        <div style={{ marginBottom: '2rem' }}>
          <h2>Upload PDF Documents</h2>
          <StorageManager
            acceptedFileTypes={['.pdf']}
            path="documents/"
            maxFileCount={10}
            isResumable
            showThumbnails
            displayText={{
              uploadingText: 'Uploading PDF...',
              browseFilesText: 'Browse files',
              dropFilesText: 'Drop PDF files here or',
            }}
          />
        </div>
  
        <div>
          <h2>Chat with your documents</h2>
          <AIConversation
            messages={messages}
            handleSendMessage={handleSendMessage}
            isLoading={isLoading}
            allowAttachments
            messageRenderer={{
              text: ({ text }) => <div>{text}</div>,
            }}
            avatars={{
              ai: {
                username: 'PDF Assistant',
                avatar: '📄',
              },
              user: {
                username: 'You',
              },
            }}
            displayText={{
              getMessageTimestampText: (date) => 
                date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }}
          />
        </div>
      </div>
    );
  }
  
  function App() {
    return (
      <Authenticator>
        {({ signOut }) => (
          <div>
            <header style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '1rem 2rem',
              borderBottom: '1px solid #ddd'
            }}>
              <h1>${config.name}</h1>
              <button onClick={signOut}>Sign out</button>
            </header>
            <ChatApp />
          </div>
        )}
      </Authenticator>
    );
  }
  
  export default App;`;
  }
  
  function generateMain(config: ProjectConfig): string {
    return `import React from 'react';
  import ReactDOM from 'react-dom/client';
  import { Amplify } from 'aws-amplify';
  import outputs from '../amplify_outputs.json';
  import App from './App.tsx';
  import './index.css';
  
  Amplify.configure(outputs);
  
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );`;
  }
  
  function generateIndexHtml(config: ProjectConfig): string {
    return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <link rel="icon" type="image/svg+xml" href="/vite.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${config.name}</title>
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="/src/main.tsx"></script>
    </body>
  </html>`;
  }
  
  function generateReadme(config: ProjectConfig): string {
    return `# ${config.name}
  
  A chat-with-PDF application built with AWS Amplify and Amazon Bedrock.
  
  ## Getting Started
  
  1. Install dependencies:
  \`\`\`bash
  npm install
  \`\`\`
  
  2. Start the development environment:
  \`\`\`bash
  npx ampx sandbox
  \`\`\`
  
  3. In a new terminal, start the dev server:
  \`\`\`bash
  npm run dev
  \`\`\`
  
  ## Configuration
  
  - **Region**: ${config.region}
  - **Vector Database**: ${config.vectorDatabaseId}
  - **AI Model**: ${config.modelId}
  
  ## Features
  
  - PDF document upload to S3
  - AI-powered chat interface
  - User authentication
  - Real-time conversation history
  
  ## Deployment
  
  To deploy to production:
  \`\`\`bash
  npx ampx deploy
  \`\`\`
  `;
  }