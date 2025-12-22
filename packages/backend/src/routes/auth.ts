import { Router } from 'express';
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
import rateLimit from 'express-rate-limit';

const router = Router();

const stsClient = new STSClient({ 
  region: process.env.AWS_REGION || 'us-east-1' 
});

const EXTERNAL_ID = process.env.EXTERNAL_ID || 'pdf-chat-external-id';

// Rate limiting: 10 requests per 15 minutes per IP
const assumeRoleLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many assume-role requests. Try again later.' }
});

router.post('/assume-role', assumeRoleLimiter, async (req, res) => {
  try {
    const { roleArn } = req.body;

    if (!roleArn) {
      return res.status(400).json({ error: 'Role ARN is required' });
    }

    // Validate ARN format
    const arnRegex = /^arn:aws:iam::\d{12}:role\/[\w+=,.@-]+$/;
    if (!arnRegex.test(roleArn)) {
      return res.status(400).json({ error: 'Invalid Role ARN format' });
    }

    const command = new AssumeRoleCommand({
      RoleArn: roleArn,
      RoleSessionName: `pdf-chat-${Date.now()}`,
      DurationSeconds: 3600, // 1 hour
      ExternalId: EXTERNAL_ID
    });

    const response = await stsClient.send(command);

    if (!response.Credentials) {
      return res.status(500).json({ error: 'Failed to get credentials' });
    }

    res.json({
      accessKeyId: response.Credentials.AccessKeyId,
      secretAccessKey: response.Credentials.SecretAccessKey,
      sessionToken: response.Credentials.SessionToken,
      expiration: response.Credentials.Expiration
    });

  } catch (error: any) {
    console.error('AssumeRole error:', error);
    
    if (error.name === 'AccessDenied') {
      return res.status(403).json({ 
        error: 'Access denied. Check role trust policy and external ID.' 
      });
    }

    res.status(500).json({ 
      error: error.message || 'Failed to assume role' 
    });
  }
});

export default router;
