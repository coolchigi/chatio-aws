#!/bin/bash

# AWS Bedrock PDF Chat - Project Setup Script
# Creates folder structure and empty files from project specification

set -e  # Exit on any error

echo "🚀 Setting up AWS Bedrock PDF Chat project structure..."

# Check if we're in the right directory
if [ ! "$(basename "$PWD")" = "chatio-aws" ]; then
    echo "❌ Please run this script from the 'chatio-aws' directory"
    echo "Run: mkdir chatio-aws && cd chatio-aws && curl -o setup.sh [URL] && chmod +x setup.sh && ./setup.sh"
    exit 1
fi

echo "📁 Creating directory structure..."

# Create all directories
mkdir -p packages/frontend/src/components/KnowledgeBase
mkdir -p packages/frontend/src/services
mkdir -p packages/frontend/src/types
mkdir -p packages/frontend/src/hooks
mkdir -p packages/frontend/public

mkdir -p packages/backend/src/routes
mkdir -p packages/backend/src/services
mkdir -p packages/backend/src/middleware
mkdir -p packages/backend/src/types
mkdir -p packages/backend/src/utils

mkdir -p infra
mkdir -p docs

echo "📄 Creating package.json files..."

# Root package.json (Workspace Manager)
cat > package.json << 'EOF'
{
  "name": "chatio-aws",
  "version": "1.0.0",
  "description": "AWS Bedrock PDF Chat - A hosted web app for chatting with PDFs using AWS Bedrock",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "npm run dev --workspace=frontend",
    "dev:backend": "npm run dev --workspace=backend",
    "build": "npm run build --workspace=backend && npm run build --workspace=frontend",
    "lint": "npm run lint --workspace=frontend && npm run lint --workspace=backend",
    "type-check": "npm run type-check --workspace=frontend && npm run type-check --workspace=backend"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  },
  "keywords": ["aws", "bedrock", "pdf", "chat", "typescript", "react"],
  "author": "",
  "license": "MIT"
}
EOF

# Frontend package.json
cat > packages/frontend/package.json << 'EOF'
{
  "name": "frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.485.0",
    "@aws-sdk/client-sts": "^3.485.0",
    "@aws-sdk/client-bedrock": "^3.485.0",
    "@aws-sdk/client-bedrock-runtime": "^3.485.0",
    "@aws-sdk/client-bedrock-agent": "^3.485.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
EOF

# Backend package.json
cat > packages/backend/package.json << 'EOF'
{
  "name": "backend",
  "version": "1.0.0",
  "description": "Backend API for AWS Bedrock PDF Chat",
  "main": "dist/server.js",
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint . --ext .ts --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.485.0",
    "@aws-sdk/client-sts": "^3.485.0",
    "@aws-sdk/client-bedrock": "^3.485.0",
    "@aws-sdk/client-bedrock-agent": "^3.485.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.4",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "eslint": "^8.55.0",
    "nodemon": "^3.0.2",
    "ts-node": "^10.9.1",
    "typescript": "^5.2.2"
  }
}
EOF

echo "⚙️ Creating TypeScript configurations..."

# Frontend tsconfig.json
cat > packages/frontend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

# Frontend tsconfig.node.json
cat > packages/frontend/tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF

# Backend tsconfig.json
cat > packages/backend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "CommonJS",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Vite config
cat > packages/frontend/vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
EOF

echo "📁 Creating empty component files..."

# Frontend files with TODO comments
echo "// TODO: Implement App component" > packages/frontend/src/App.tsx
echo "// TODO: Implement main entry point" > packages/frontend/src/main.tsx

# Create component files
echo "// TODO: Implement RoleSetup component" > packages/frontend/src/components/RoleSetup.tsx
echo "// TODO: Implement S3Manager component" > packages/frontend/src/components/S3Manager.tsx
echo "// TODO: Implement PDFUpload component" > packages/frontend/src/components/PDFUpload.tsx
echo "// TODO: Implement ChatInterface component" > packages/frontend/src/components/ChatInterface.tsx

# KnowledgeBase components
echo "// TODO: Implement DataSourceConfig component" > packages/frontend/src/components/KnowledgeBase/DataSourceConfig.tsx
echo "// TODO: Implement EmbeddingModelSelect component" > packages/frontend/src/components/KnowledgeBase/EmbeddingModelSelect.tsx
echo "// TODO: Implement VectorStoreConfig component" > packages/frontend/src/components/KnowledgeBase/VectorStoreConfig.tsx
echo "// TODO: Implement ChunkingConfig component" > packages/frontend/src/components/KnowledgeBase/ChunkingConfig.tsx
echo "// TODO: Implement ReviewCreate component" > packages/frontend/src/components/KnowledgeBase/ReviewCreate.tsx

# Frontend services
echo "// TODO: Implement backend API client" > packages/frontend/src/services/backendApi.ts
echo "// TODO: Implement AWS service operations" > packages/frontend/src/services/validationService.ts

# Frontend types and hooks
echo "// TODO: Define AWS TypeScript interfaces" > packages/frontend/src/types/aws.ts
echo "// TODO: Implement useAWSCredentials hook" > packages/frontend/src/hooks/useAWSCredentials.ts

echo "🔧 Creating backend files..."

# Backend files
echo "// TODO: Implement Express server setup" > packages/backend/src/server.ts
echo "// TODO: Implement Express app configuration" > packages/backend/src/app.ts

# Backend routes
echo "// TODO: Implement authentication routes" > packages/backend/src/routes/auth.ts
echo "// TODO: Implement S3 operation routes" > packages/backend/src/routes/s3.ts
echo "// TODO: Implement Bedrock operation routes" > packages/backend/src/routes/bedrock.ts

# Backend services
echo "// TODO: Implement STS role assumption service" > packages/backend/src/services/stsService.ts
echo "// TODO: Implement S3 operations service" > packages/backend/src/services/s3Service.ts
echo "// TODO: Implement Bedrock operations service" > packages/backend/src/services/bedrockService.ts

# Backend middleware
echo "// TODO: Implement authentication middleware" > packages/backend/src/middleware/auth.ts
echo "// TODO: Implement CORS middleware" > packages/backend/src/middleware/cors.ts

# Backend types and utils
echo "// TODO: Define backend AWS TypeScript interfaces" > packages/backend/src/types/aws.ts
echo "// TODO: Implement input validation utilities" > packages/backend/src/utils/validation.ts

echo "📋 Creating infrastructure files..."

# Infrastructure files
echo "# TODO: Create CloudFormation template for user IAM role" > infra/user-role-template.yaml

echo "📖 Creating documentation files..."

# Documentation files  
echo "# TODO: Document backend API endpoints and usage" > docs/api-docs.md
echo "# TODO: Write deployment instructions for all options" > docs/deployment-guide.md
# Basic HTML template
cat > packages/frontend/index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AWS Bedrock PDF Chat</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

# Environment files
echo "VITE_BACKEND_URL=http://localhost:3001" > packages/frontend/.env.example
echo "PORT=3001" > packages/backend/.env.example
echo "NODE_ENV=development" >> packages/backend/.env.example

# Basic README
cat > README.md << 'EOF'
# AWS Bedrock PDF Chat

A hosted web application for chatting with PDF documents using AWS Bedrock Knowledge Bases.

## Quick Start

1. Run the setup script to create project structure
2. Install dependencies: `npm install`
3. Start development: `npm run dev`

## Documentation

- [API Documentation](docs/api-docs.md)
- [Infra Deployment](infra/deployment-guide.md)
EOF

echo "✅ Project structure created successfully!"
echo ""
echo "Next steps:"
echo "1. Run: npm install"
echo "2. Run: npm run dev"
echo "3. Start building components in packages/frontend/src/components/"