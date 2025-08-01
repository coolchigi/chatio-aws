# Development Environment Setup Guide

## Prerequisites

- **Node.js 18+** and **npm 9+** installed
- **Git** configured
- **Code editor** (VS Code recommended)

## Quick Setup

1. **Create project directory and run setup:**
```bash
mkdir chatio-aws
cd chatio-aws
curl -o setup.sh https://raw.githubusercontent.com/coolchigi/chatio-aws/main/setup.sh
chmod +x setup.sh
./setup.sh
```

2. **Install dependencies and start development:**
```bash
npm install
npm run dev
```

## Manual Setup (Copy Script Commands)

If you prefer to run commands manually, copy these lines from the setup script:

```bash
# Create directory structure
mkdir -p packages/frontend/src/components/KnowledgeBase
mkdir -p packages/frontend/src/services
mkdir -p packages/frontend/src/types
mkdir -p packages/frontend/src/hooks
mkdir -p packages/backend/src/{routes,services,middleware,types,utils}
mkdir -p infra docs

# Create component files
echo "// TODO: Implement RoleSetup component" > packages/frontend/src/components/RoleSetup.tsx
echo "// TODO: Implement S3Manager component" > packages/frontend/src/components/S3Manager.tsx
# ... (continue with all echo commands from script)
```

## AWS IAM Role Setup

Users need to create an IAM role in their AWS account that allows the application to access their resources.

[![Deploy to AWS](https://s3.amazonaws.com/cloudformation-examples/cloudformation-launch-stack.png)](https://console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/create/review?templateURL=https://github.com/coolchigi/chatio-aws/blob/main/infra/user-role-template.yaml&stackName=pdf-chat-role&param_TrustedAccountId=337305803512)

**Manual Setup:**
1. Download the CloudFormation template from `infra/user-role-template.yaml`
2. Go to AWS CloudFormation console
3. Create new stack and upload the template
4. Set TrustedAccountId to: `337305803512`
5. Deploy and copy the Role ARN from Outputs


## Developer Workflow

### Available Scripts
```bash
# Start both frontend and backend
npm run dev

# Individual services
npm run dev:frontend  # http://localhost:5173
npm run dev:backend   # http://localhost:3001

# Build and validation
npm run build
npm run lint
npm run type-check
```

### Development URLs
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

### IDE Setup (VS Code)

**Recommended Extensions:**
- TypeScript and JavaScript Language Features
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint

**Workspace Settings (`.vscode/settings.json`):**
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

## Next Steps

After setup is complete:
1. Verify both servers start with `npm run dev`
2. Start building Phase 1 components (RoleSetup, backend STS integration)
3. Follow the project specification for development phases