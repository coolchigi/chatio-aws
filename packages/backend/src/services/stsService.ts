import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
import { IAMClient, GetRoleCommand } from '@aws-sdk/client-iam';
import { randomUUID } from 'crypto';
import { AWSCredentials, SessionData, AssumeRoleResult } from '../types/aws';

// In-memory cache for session credentials
const credentialsCache = new Map<string, SessionData>();

// we need to clean-up expired sessions every 5 minutes
setInterval(() => {
  const now = new Date();
  for (const [sessionId, session] of credentialsCache.entries()) {
    if (session.expiresAt <= now) {
      credentialsCache.delete(sessionId);
      console.log(`Cleaned up expired session: ${sessionId}`);
    }
  }
}, 5 * 60 * 1000);

/**
 * ARN format validation for IAM roles
 * @param roleArn - The role ARN to validate
 * @returns true if valid, false otherwise
 */
function validateRoleArnFormat(roleArn: string): boolean {
  const arnRegex = /^arn:aws:iam::\d{12}:role\/[\w+=,.@-]+$/;
  return arnRegex.test(roleArn);
}

/**
 * Sanitizes AWS error messages to remove sensitive information
 * @param error - The error object from AWS SDK
 * @returns Sanitized error message
 */
function sanitizeErrorMessage(error: any): string {
  const message = error.message || 'Unknown error';
  
  // Define sanitization rules
  const sanitizationRules = [
    {
      pattern: /User: arn:aws:sts::\d+:assumed-role\/[\w-]+\/[\w-]+ is not authorized/,
      replacement: 'Not authorized to assume the specified role. Please check your role permissions.'
    },
    {
      pattern: /Role arn:aws:iam::\d+:role\/[\w-]+ does not exist/,
      replacement: 'The specified role does not exist. Please check your role ARN.'
    },
    {
      pattern: /Invalid principal in policy/,
      replacement: 'The role trust policy does not allow this application to assume the role.'
    },
    {
      pattern: /arn:aws:iam::\d+/g,
      replacement: 'your AWS account'
    },
    {
      pattern: /Account \d+/g,
      replacement: 'your account'
    }
  ];

  let sanitizedMessage = message;
  for (const rule of sanitizationRules) {
    sanitizedMessage = sanitizedMessage.replace(rule.pattern, rule.replacement);
  }

  // If no specific rule matched, return a generic message
  if (sanitizedMessage === message && message.includes('arn:aws')) {
    return 'Unable to assume the specified role. Please check your role ARN and permissions.';
  }

  return sanitizedMessage;
}

/**
 * Validates if the role exists in AWS
 * @param roleArn - The role ARN to validate
 * @returns true if the role exists, false otherwise
 */
async function validateRoleExists(roleArn: string): Promise<boolean> {
  try {
    // Extract account ID and role name from ARN
    const arnParts = roleArn.split(':');
    if (arnParts.length !== 6) return false;
    
    const roleName = arnParts[5].split('/')[1];
    
    // Create IAM client to check role existence & requires the IAM:GetRole permission on the role
    const iamClient = new IAMClient({ region: process.env.AWS_REGION || 'us-east-1' });
    
    await iamClient.send(new GetRoleCommand({
      RoleName: roleName
    }));
    
    return true;
  } catch (error: any) {
    // Role doesn't exist or we don't have permission to check
    console.log(`Role validation failed for ${roleArn}:`, error.message);
    return false;
  }
}

/**
 * Assumes an IAM role and returns temporary credentials
 * @param roleArn - The ARN of the role to assume
 * @returns AWSCredentials object containing temporary credentials
 */
async function assumeRole(roleArn: string): Promise<AWSCredentials> {
  console.log('AWS credentials check:', process.env.AWS_ACCESS_KEY_ID ? 'Found' : 'Missing');
  const stsClient = new STSClient({ region: process.env.AWS_REGION || 'us-east-1' });
  
  const sessionName = `ChatPDF-Session-${Date.now()}`;
  const command = new AssumeRoleCommand({
    RoleArn: roleArn,
    RoleSessionName: sessionName,
    DurationSeconds: 3600, // 1 hour (AWS maximum)
    ExternalId: 'pdf-chat-external-id'
  });

  const response = await stsClient.send(command);
  
  if (!response.Credentials) {
    throw new Error('No credentials returned from STS');
  }

  return {
    accessKeyId: response.Credentials.AccessKeyId!,
    secretAccessKey: response.Credentials.SecretAccessKey!,
    sessionToken: response.Credentials.SessionToken!,
    expiration: response.Credentials.Expiration!
  };
}

/**
 * Assumes a role and caches the credentials
 * @param roleArn - The ARN of the role to assume
 * @returns AssumeRoleResult containing session ID and expiration
 */
export async function assumeRoleAndCache(roleArn: string): Promise<AssumeRoleResult> {
  try {
    // 1. Validate ARN format
    if (!validateRoleArnFormat(roleArn)) {
      return {
        success: false,
        error: 'Invalid role ARN format. Please provide a valid IAM role ARN.'
      };
    }

    // 2. Check if role exists (optional - might fail due to permissions)
    const roleExists = await validateRoleExists(roleArn);
    if (!roleExists) {
      console.log(`Warning: Could not validate role existence for ${roleArn}`);
      // Continue anyway - role might exist but we don't have GetRole permissions
    }

    // 3. Attempt to assume the role
    console.log(`Attempting to assume role: ${roleArn}`);
    const credentials = await assumeRole(roleArn);

    // 4. Generate session ID and cache credentials
    const sessionId = randomUUID();
    const expiresAt = new Date(credentials.expiration.getTime() - 10 * 60 * 1000); // Expire 10 minutes early

    const sessionData: SessionData = {
      credentials,
      roleArn,
      createdAt: new Date(),
      expiresAt
    };

    credentialsCache.set(sessionId, sessionData);
    
    console.log(`Successfully assumed role and cached credentials. Session: ${sessionId}`);
    
    return {
      success: true,
      sessionId,
      expiresAt
    };

  } catch (error: any) {
    console.error('STS assume role error:', error);
    
    return {
      success: false,
      error: sanitizeErrorMessage(error)
    };
  }
}

/**
 * Retrieves session credentials from cache
 * @param sessionId - The session ID to retrieve credentials for
 * @returns AWSCredentials object or null if session not found or expired
 */
export function getSessionCredentials(sessionId: string): AWSCredentials | null {
  const session = credentialsCache.get(sessionId);
  
  if (!session) {
    console.log(`Session not found: ${sessionId}`);
    return null;
  }

  // Check if session has expired
  if (session.expiresAt <= new Date()) {
    console.log(`Session expired: ${sessionId}`);
    credentialsCache.delete(sessionId);
    return null;
  }

  return session.credentials;
}

/**
 * Clears a session and removes cached credentials
 * @param sessionId - The session ID to clear 
 * @return true if session was cleared, false if not found
 */
export function clearSession(sessionId: string): boolean {
  const deleted = credentialsCache.delete(sessionId);
  if (deleted) {
    console.log(`Session cleared: ${sessionId}`);
  }
  return deleted;
}

/**
 * Gets cache statistics for debugging purposes
 * @returns Object containing cache statistics 
 * including total sessions, active sessions, and expired sessions
 */
export function getCacheStats() {
  const now = new Date();
  const activeSessions = Array.from(credentialsCache.values()).filter(
    session => session.expiresAt > now
  ).length;
  
  return {
    totalSessions: credentialsCache.size,
    activeSessions,
    expiredSessions: credentialsCache.size - activeSessions
  };
}
